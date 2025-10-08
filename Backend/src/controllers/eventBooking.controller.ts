import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Event from "../models/event.model.js";
import Stripe from "stripe";
import EventBooking from "../models/eventBooking.model.js";
import { IUser } from "../models/user.model.js";
import { generateAndSendTickets } from "./ticket.controller.js";
import mongoose from 'mongoose';
import Coupon from '../models/coupon.model.js';

interface AuthRequest extends Request {
  user?: IUser;
}

const getStripeInstance = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new ApiError(500, "Stripe secret key not found");
  }
  return new Stripe(stripeKey);
};

const bookEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stripe = getStripeInstance();
  const { numberOfTickets, eventId, couponCode } = req.body;
  
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!eventId || !numberOfTickets || numberOfTickets <= 0) {
    throw new ApiError(400, "Valid event ID and number of tickets required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const event = await Event.findById(eventId).session(session);
    
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    if (event.seats < numberOfTickets) {
      throw new ApiError(400, `Only ${event.seats} seats available`);
    }
    
    let originalAmount = event.price * numberOfTickets;
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let appliedCoupon = null;
    
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        eventId,
        isActive: true,
      }).session(session);
      
      if (!coupon) {
        throw new ApiError(400, "Invalid coupon code");
      }
      
      const now = new Date();
      if (coupon.validFrom > now || coupon.validUntil < now) {
        throw new ApiError(400, "Coupon has expired");
      }
      
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(400, "Coupon usage limit exceeded");
      }
      
      if (coupon.minOrderAmount && originalAmount < coupon.minOrderAmount) {
        throw new ApiError(
          400,
          `Minimum order amount of $${coupon.minOrderAmount} required`
        );
      }
      
      if (coupon.discountType === "percentage") {
        discountAmount = (originalAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
      
      finalAmount = Math.max(0, originalAmount - discountAmount);
      
      coupon.usedCount += 1;
      await coupon.save({ session });
      
      appliedCoupon = {
        code: coupon.code,
        discountAmount,
      };
    }
    
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.title,
              description: appliedCoupon 
                ? `Discount applied: ${appliedCoupon.code}` 
                : undefined,
            },
            unit_amount: Math.round((finalAmount / numberOfTickets) * 100), 
          },
          quantity: numberOfTickets,
        },
      ],
      metadata: {
        event_id: eventId,
        user_id: userId.toString(),
        number_of_tickets: numberOfTickets.toString(),
        coupon_code: couponCode || "",
        original_amount: originalAmount.toString(),
        discount_amount: discountAmount.toString(),
      },
      mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/booked-events/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/events/`,
    });

    if (!stripeSession) {
      throw new ApiError(500, "Payment session creation failed");
    }

    const booking = await EventBooking.create([{
      userId,
      eventId,
      numberOfTickets,
      bookingDate: new Date(),
      originalAmount,
      discountAmount,
      finalAmount,
      couponCode: appliedCoupon?.code || null,
      paymentStatus: "pending",
      stripePaymentId: stripeSession.id,
    }], { session });

    event.seats -= numberOfTickets;
    await event.save({ session });

    await session.commitTransaction();

    return res.status(200).json(
      new ApiResponse(200, "Booking initiated successfully", {
        checkoutUrl: stripeSession.url,
        booking: {
          id: booking[0]._id,
          numberOfTickets,
          originalAmount,
          discountAmount,
          finalAmount,
          couponApplied: !!appliedCoupon,
        },
      })
    );

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const successPay = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stripe = getStripeInstance();
  const { session_id } = req.params;
  const session = await stripe.checkout.sessions.retrieve(session_id);
 
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  const existingBooking = await EventBooking.findOne({
    stripePaymentId: session_id,
    paymentStatus: "paid"
  });

  if (existingBooking) {
    return res.status(200).json(
      new ApiResponse(200, "Payment already processed", { booking: existingBooking })
    );
  }

  if (session.payment_status === "paid") {
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    
    try {
      const booking = await EventBooking.findOneAndUpdate(
        { 
          stripePaymentId: session_id,
          paymentStatus: "pending"
        },
        { paymentStatus: "paid" },
        { new: true, session: mongoSession }
      ).populate('eventId').populate('userId', 'name email');

      if (!booking) {
        throw new ApiError(404, "Booking not found or already processed");
      }

      const bookingId = (booking._id as any).toString();

      const event = await Event.findById(booking.eventId._id).session(mongoSession);
      
      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      await mongoSession.commitTransaction();
      try {
        await generateAndSendTickets(bookingId);
      } catch (error) {
        console.error("Error generating tickets:", error);
      }


      return res.status(200).json(
        new ApiResponse(200, "Payment successful and tickets sent", { booking })
      );

    } catch (error) {
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      mongoSession.endSession();
    }
  } else {
    throw new ApiError(400, "Payment not completed");
  }
});

const getBookedEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = (req.user as any)?._id;
  const events = await EventBooking.find({ userId }).populate("eventId","title date time location coverImage");
  if (!events) {
    throw new ApiError(404, "No events found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Events fetched successfully", events));
});

export { bookEvent, successPay, getBookedEvents };

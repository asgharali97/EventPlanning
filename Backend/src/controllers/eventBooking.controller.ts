import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Event from "../models/event.model.js";
import Stripe from "stripe";
import EventBooking from "../models/eventBooking.model.js";
import { IUser } from "models/user.model.js";
import { generateAndSendTickets } from "./ticket.controller.js";

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
  let paymentStatus: string = "pending";
  const { numberOfTickets, eventId } = req.body;

  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  if (!(numberOfTickets > 0)) {
    throw new ApiError(
      400,
      "Number of tickets required and must be greater than 0"
    );
  }

  const bookingDate: string = new Date().toISOString().split("T")[0];

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.seats === 0) {
    throw new ApiError(404, "No seats available");
  }

  const totalPrice: number = event.price * numberOfTickets;
  const remaningSeats: number = event.seats - numberOfTickets;
  const customer = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: event.title,
          },
          unit_amount: event.price * 100,
        },
        quantity: numberOfTickets,
      },
    ],
    metadata: {
      event_id: eventId,
    },
    mode: "payment",
    success_url: `http://localhost:5173/booked-events/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5173/events/`,
  });
 
  if (!customer) {
    throw new ApiError(500, "Payment session creation failed");
  }

  const booking = await EventBooking.create({
    userId,
    eventId,
    numberOfTickets,
    bookingDate,
    totalPrice,
    paymentStatus,
    stripePaymentId: customer.id, 
  });
  if (!booking) {
    throw new ApiError(500, "Booking failed");
  }

  return res.status(200).json(
    new ApiResponse(200, "Event booked successfully", {
      customer: customer.url,
      booking,
    })
  );
});

const successPay = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stripe = getStripeInstance();
  const { session_id } = req.params;
  const session = await stripe.checkout.sessions.retrieve(session_id);
 
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.payment_status === "paid") {
    const booking = await EventBooking.findOneAndUpdate(
      { stripePaymentId: session_id },
      { paymentStatus: "paid" },
      { new: true }
    ).populate('eventId').populate('userId', 'name email');
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }
    let bookingId = (booking._id as any).toString()
    const eventId = booking.eventId._id

    const event = await Event.findByIdAndUpdate(
      { _id: eventId },
      { $inc: { seats: -booking.numberOfTickets } },
      { new: true }
    );

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    try {
      await generateAndSendTickets(bookingId);
    } catch (error) {
      console.error("Error generating tickets:", error);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Payment successful and tickets sent", { booking }));
  } else {
    throw new ApiError(400, "Payment not completed");
  }
});

const getBookedEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = (req.user as any)?._id;
  const events = await EventBooking.find({ userId });
  if (!events) {
    throw new ApiError(404, "No events found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Events fetched successfully", events));
});

export { bookEvent, successPay, getBookedEvents };

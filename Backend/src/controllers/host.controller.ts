import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import User, { IUser } from "../models/user.model.js";
import Event from '../models/event.model.js';
import EventBooking from '../models/eventBooking.model.js';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import stripe from "../utils/stripe.js";
import cron from "node-cron";

interface AuthRequest extends Request {
  user?: IUser;
}

const refundHostDeposit = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id);
    console.log('refund Controller call')
    if (!user || !user.depositHeld || user.role !== "host") {
      throw new ApiError(400, "no deposit to refund");
    }

    const refund = await stripe.refunds.create({
      payment_intent: user.stripePaymentId,
      amount: user.depositHeld,
    });

    if (!refund) {
      throw new ApiError(400, "refund failed");
    }

    user.depositHeld = 0;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, "Deposit refunded", {}));
  }
);

const verifyHostPaymentwebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    console.log('sig get',sig);
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_KEY!
    );
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      if (paymentIntent.metadata.type === "host_verifaction_deposit") {
        const user = await User.findById(paymentIntent.metadata.userId);
        if (user) {
          user.role = "host";
          user.isVerified = true;
          user.depositHeld = paymentIntent.amount;
          user.stripePaymentId = paymentIntent.id;
          await user.save();
          console.log("host verified for user:", user._id);
        }
      }
    } else if (event.type === "payment_intent.payment_failed") {
      console.error(
        `Payment failed for user ${event.data.object.metadata.userId}`
      );
    }
    res
      .status(200)
      .json(new ApiResponse(200, "host payment verified", { received: true }));
  }
);

const depositRefundCronJob = asyncHandler(async () => {
  const hosts = await User.find({ role: "host", depositHeld: { $gt: 0 } });

  for (const host of hosts) {
    const events = await Event.find({ hostId: host._id });
    const bookings = await EventBooking.find({
      eventId: { $in: events.map((e) => e._id) },
    }).populate("eventId");
    const allEventsPassed = bookings.every(
      (b) => new Date(b.eventId.date) < new Date()
    );
    const avgRating =
      bookings.reduce(
        (sum, b) => sum + (b.reviewStatus === "approved" ? 5 : 0),
        0
      ) / bookings.length;

    if (allEventsPassed && avgRating > 4) {
      await stripe.refunds.create({
        payment_intent: host.stripePaymentId,
        amount: host.depositHeld,
      });
      host.depositHeld = 0;
      host.stripePaymentId = undefined;
      await host.save();
    }
  }
});

cron.schedule('0 0 * * *', depositRefundCronJob)

export { refundHostDeposit, verifyHostPaymentwebhook };

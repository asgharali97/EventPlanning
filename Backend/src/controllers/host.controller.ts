import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import stripe from "../utils/stripe.js";

interface AuthRequest extends Request {
  user?: IUser;
}

const verifyHostPaymentwebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = (req?.headers["stripe-signature"] as string);
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

export { refundHostDeposit, verifyHostPaymentwebhook };
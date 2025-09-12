import Stripe from "stripe";
import { ApiError } from "./ApiError.js";
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new ApiError(500, "Stripe secret key not found");
}
const stripe = new Stripe(stripeKey);

export default stripe
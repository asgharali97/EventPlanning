import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Event from "../models/event.model.js";
import Stripe from "stripe";
import EventBooking from "../models/eventBooking.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const bookEvent = asyncHandler(async (req, res) => {
  let paymentStatus = "pending";
  const { numberOfTickets, eventId } = req.body;
  const userId = req.user._id;

  if(!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  if (!(numberOfTickets || numberOfTickets > 0)) {
    throw new ApiError(
      400,
      "Number of tickets required and must be greater than 0"
    );
  }

  const bookingDate = new Date().toISOString().split("T")[0];
  console.log("bookingDate", bookingDate);

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.seats.length === 0) {
    throw new ApiError(404, "No seats available");
  }


  const totalPrice = event.price * numberOfTickets;
  const remaningSeats = event.seats - numberOfTickets;
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
  console.log("customer", customer);

  const updateEvent = await Event.findOneAndUpdate(
    { _id: eventId },
    { seats: remaningSeats },
    { new: true }
  );

  const booking = await EventBooking.create({
    userId,
    eventId,
    numberOfTickets,
    bookingDate,
    totalPrice,
    paymentStatus,
  });
  console.log("Booking", booking);
  if (!booking) {
    throw new ApiError(500, "Booking failed");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Event booked successfully", {
        customer: customer.url,
        booking,
      })
    );
});

const successPay = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.payment_status === "paid") {
    const booking = await EventBooking.findOneAndUpdate(
      { eventId: session.metadata.event_id },
      { paymentStatus: "paid" },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "Payment successful", { booking }));
  }
});

const getBookedEvents = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const events = await EventBooking.find({userId});
  if (!events) {
    throw new ApiError(404, "No events found");
  }
  res.status(200).json(new ApiResponse(200, "Events fetched successfully", events));
});

export { bookEvent, successPay, getBookedEvents };

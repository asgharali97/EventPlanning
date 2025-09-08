import mongoose, {
  Schema,
  model,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

const eventBookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    numberOfTickets: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);
export type EventBookingDoc = HydratedDocument<InferSchemaType<typeof eventBookingSchema>>;
const EventBooking = model("EventBooking", eventBookingSchema);

export default EventBooking;

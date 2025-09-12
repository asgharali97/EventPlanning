import mongoose, {
  Schema,
  model,
  InferSchemaType,
  HydratedDocument,
  Document,
  Types,
} from "mongoose";

interface IEventBooking extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  bookingDate: Date;
  status: "confirmed" | "cancelled";
  numberOfTickets: number;
  totalPrice: number;
  paymentStatus: "paid" | "pending" | "failed";
  stripePaymentId: string;
  reviewStatus?: "pending" | "approved" | "disputed";
  createdAt: Date;
  updatedAt: Date;
}

const eventBookingSchema = new Schema<IEventBooking>(
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
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },
    stripePaymentId: {
      type: String,
      required: true,
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "disputed"],
      default: "pending",
    },
  },
  { timestamps: true }
);
export type EventBookingDoc = HydratedDocument<
  InferSchemaType<typeof eventBookingSchema>
>;
const EventBooking = model<IEventBooking>("EventBooking", eventBookingSchema);

export default EventBooking;

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
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode: string | null;
  paymentStatus: "paid" | "pending" | "failed";
  stripePaymentId?: string;
  reviewStatus?: "pending" | "approved" | "disputed";
  createdAt: Date;
  updatedAt: Date;
  date?:Date
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
    originalAmount: { 
      type: Number,
      required: true 
    },
    discountAmount: {
       type: Number,
       default: 0 
      },
    finalAmount: {
       type: Number,
       required: true 
    },
    couponCode: {
       type: String,
       default: null 
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: "pending",
    },
    stripePaymentId: {
      type: String,
      required: false,
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

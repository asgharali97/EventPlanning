import {
  Schema,
  model,
  InferSchemaType,
  HydratedDocument,
  Document,
  Types,
} from "mongoose";

interface ITicket extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  qrCode: string;
  ticketNumber: string;
  status: "active" | "cancelled" | "used";
  onlineDetails?: {
    link: string;
    password?: string;
    platform?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "EventBooking",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "used"],
      default: "active",
    },
    onlineDetails: {
      link: {
        type: String,
      },
      password: {
        type: String,
      },
      platform: {
        type: String,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export type TicketDoc = HydratedDocument<InferSchemaType<typeof ticketSchema>>;
const Ticket = model<ITicket>("Ticket", ticketSchema);

export default Ticket;
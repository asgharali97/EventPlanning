import mongoose, {
  Schema,
  model,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

const evetnSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["tech", "sports", "arts"],
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "system",
    },
  },
  { timestamps: true }
);
export type EventDoc = HydratedDocument<InferSchemaType<typeof evetnSchema>>;
const Event = model("Event", evetnSchema);
export default Event;

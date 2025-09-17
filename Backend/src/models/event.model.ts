import mongoose, {
  Schema,
  model,
  InferSchemaType,
  HydratedDocument,
  Document,
  Types,
} from "mongoose";

interface IOnlineDetails {
  link: string;
  password?: string;
  platfrom?: string;
}

interface IEvent extends Document {
  title: string;
  price: number;
  seats: number;
  category: string;
  date: Date;
  time: string;
  description?: string;
  coverImage: string;
  location: string;
  hostId: Types.ObjectId;
  isVerified: boolean;
  eventType: "physical" | "online";
  onlineDetails?: IOnlineDetails;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const evetnSchema = new Schema<IEvent>(
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
      enum: ["tech", "sports", "arts", "music", "food", "health", "other"],
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
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    eventType: {
      type: String,
      enum: ["physical", "online"],
      required: true,
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
    tags: [{ type: String }],
  },
  { timestamps: true }
);
evetnSchema.index({
  title: "text",
  description: "text",
  location: "text",
  tags: "text",
});

export type EventDoc = HydratedDocument<InferSchemaType<typeof evetnSchema>>;
const Event = model<IEvent>("Event", evetnSchema);
export default Event;

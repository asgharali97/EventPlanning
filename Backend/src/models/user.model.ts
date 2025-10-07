import mongoose, {
  Schema,
  model,
  InferSchemaType,
  HydratedDocument,
  Document,
  Types,
} from "mongoose";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  refreshToken?: string;
  google: {
    accessToken?: string;
    refreshToken?: string;
    tokenExpiryDate?: Date;
  };
  role: "user" | "host" | "admin";
  isVerified: boolean;
  stripePaymentId?: string;
  depositHeld?: number;
  createdAt: Date;
  updatedAt: Date;
  gernateAccessToken: () => string;
  gernateRefreshToken: () => string;
}


const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "host", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    stripePaymentId: {
      type: String,
    },
    depositHeld: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
    },
    google: {
      accessToken: {
        type: String,
      },
      refreshToken: {
        type: String,
      },
      tokenExpiryDate: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

UserSchema.methods.gernateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    secret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as any  }
  );
};

UserSchema.methods.gernateRefreshToken = function () {
  const secret = process.env.REFRESH_TOKEN_SECRET 
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    {
      _id: this._id,
    },
    secret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as any  }
  );
};
export type UserDoc = HydratedDocument<InferSchemaType<typeof UserSchema>>;
const User = mongoose.model("User", UserSchema);
export default User;

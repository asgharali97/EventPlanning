import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar:{
      type: String,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User" , UserSchema)
export default User;
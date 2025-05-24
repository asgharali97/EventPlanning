import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { raw } from "express";

const webHook = asyncHandler(async (req, res) => {
  console.log("webhook");
  const signature = req.headers["clerk-signature"];
  const rawBody = req.body;

  const secret = process.env.CLERK_WEBHOOK_SIGNIN_SECRET;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

    if (signature !== hash) {
        throw new ApiError(401, "Invalid signature");
    }

    const event = JSON.parse(rawBody)

    if(event.type === "user.created"){
        const user = event.data
        const { id, email_addresses, first_name, last_name } = user

        const email = email_addresses[0]?.email_address

        const existingUser = await User.findOne({ clerkId: id })
        if(!existingUser){
            const newUser = await User.create({
                clerkId: id,
                email,
                name: `${first_name || ""} ${last_name || ""}`
            })
            return res.status(201).json(new ApiResponse(newUser, "User created successfully"))
        }
    }
});

const createUser = asyncHandler(async (req, res) => {
  console.log("Creating user");
  const { userId, sessionClaims } = req.auth;
  console.log("auth", req.auth());
  const existingUser = await User.findOne({ clerkId: userId });

  // if(!existingUser){
  //     const name = sessionClaims.name
  //     const email = sessionClaims.email

  //     const user = await User.create({
  //         clerkId: userId,
  //         email,
  //         name
  //     })
  //     return res.status(201).json(new ApiResponse(user, "User created successfully"))
  // }
});

export { createUser, webHook };

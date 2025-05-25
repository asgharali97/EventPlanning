import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createUser = asyncHandler(async (req, res) => {
  console.log("Creating user");
//   if(!existingUser){
//       const name = sessionClaims.name
//       const email = sessionClaims.email

//       const user = await User.create({
//           clerkId: userId,
//           email,
//           name
//       })
//       return res.status(201).json(new ApiResponse(user, "User created successfully"))
//   }
});

export { createUser };

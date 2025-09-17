import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

const isHost = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Unauthorized: No user information found");
  }

  const user = await User.findById(req.user._id).select("role");

  if (!user) {
    throw new ApiError(401, "Unauthorized: User does not exist");
  }

  if (user.role !== "host") {
    throw new ApiError(403, "Forbidden: Only hosts are allowed to perform this action");
  }

  req.user.role = user.role;

  next();
});

export default isHost;
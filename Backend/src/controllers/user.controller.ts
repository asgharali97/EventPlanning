import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OAuth } from "../utils/googleConfig.js";
import axios from "axios";
import stripe from "../utils/stripe.js";

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

interface GoogleProfile {
  email: string;
  name: string;
  picture: string;
}

interface AuthRequest extends Request {
  user?: IUser;
}

const gernateAccessTokenAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    // @ts-ignore
    const accessToken: string = user.gernateAccessToken();
    // @ts-ignore
    const refreshToken: string = user.gernateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong While generate accessToken and refreshToken"
    );
  }
};

const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    throw new ApiError(400, "Code is required");
  }

  const { tokens } = await OAuth.getToken(code);
  const typedTokens = tokens as unknown as GoogleTokens;
  OAuth.setCredentials(tokens);

  const { data: profile } = await axios.get<GoogleProfile>(
    `https://www.googleapis.com/oauth2/v1/userinfo`,
    {
      params: { alt: "json", access_token: tokens.access_token },
    }
  );

  if (!profile) {
    throw new ApiError(400, "something went wrong while fetching profile data");
  }
  const { email, name, picture } = profile;
  const user = await User.findOneAndUpdate(
    { email },
    {
      name,
      avatar: picture,
      google: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpireDate: new Date(Number(tokens.expiry_date)),
      },
    },
    { upsert: true, new: true }
  ).select("-google -refreshToken");

  if (!user) {
    throw new ApiError(404, "something went wrong while creating user");
  }

  const { accessToken, refreshToken } = await gernateAccessTokenAndRefreshToken(
    (user as any)._id
  );

  if (!accessToken && !refreshToken) {
    throw new ApiError(400, "AccessToken is undefined");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    domain: undefined,
  };
  console.log("user created", user);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User created successfully", { user }));
});

const becomeHost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById((req as any).user._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized, No user found");
  }
  if (user?.role === "host") {
    throw new ApiError(400, "already a host");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 100,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: user._id.toString(),
      type: "host_verifaction_deposit",
    },
  });
  if (!paymentIntent) {
    throw new ApiError(
      400,
      "Something went wrong while creating payment intent"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Payment intent created successfully",
        paymentIntent.client_secret
      )
    );
});

const verifyHostPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { paymentIntentId } = req.body;
    const user = await User.findById((req as any).user._id);

    if (!user) {
      throw new ApiError(401, "Unauthorized, No user found");
    }
    if (!paymentIntentId) {
      throw new ApiError(400, "please provide the PaymentIntentId");
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (
      paymentIntent.status !== "succeeded" ||
      paymentIntent.metadata.userId !== user._id.toString()
    ) {
      throw new ApiError(400, "Invalid or failed payment");
    }

    user.role = "host";
    user.depositHeld = paymentIntent.amount;
    user.isVerified = true;
    const updatedUser = await user.save();
    if (!updatedUser) {
      throw new ApiError(400, "Something went wrong while updating user");
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Payment verified successfully", updatedUser));
  }
);

const handleLogout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized, No user found");
  }
  const user = await User.findById((req as any).user._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized, No user found");
  }

  const refreshToken = (user as any).google.refreshToken;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  const response = await axios.post(
    `https://accounts.google.com/o/oauth2/revoke?token=${refreshToken}`,
    {},
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  if (response.status !== 200) {
    throw new ApiError(400, "Something went wrong while revoking token");
  }
  // @ts-ignore
  user.google.refreshToken = "";
  // @ts-ignore
  user.google.accessToken = "";

  const options = {
    httpOnly: true,
    secure: true,
  };

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "logout success", {}));
});

const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", req.user));
});

const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    throw new ApiError(404, "UserId not provided");
  }

  const user = await User.findById(userId).select("-google -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfuly", user));
});

export {
  createUser,
  handleLogout,
  getUser,
  becomeHost,
  verifyHostPayment,
  getUserById,
};

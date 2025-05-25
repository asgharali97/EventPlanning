import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OAuth } from "../utils/googleConfig.js";
import axios from "axios";

const gernateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.gernateAccessToken();
    const refreshToken = user.gernateRefreshToken();
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

const createUser = asyncHandler(async (req, res) => {
  console.log("Creating user");
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "Code is required");
  }

  const { tokens } = await OAuth.getToken(code);
  OAuth.setCredentials(tokens);

  const { data: profile } = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo`,
    {
      params: { alt: "json", access_token: tokens.access_token },
    }
  );

  if (!profile) {
    throw new ApiError(400, "something went wrong while fetching profile data");
  }
  console.log("profile", profile);
  const { email, name, picture } = profile;
  const user = await User.findOneAndUpdate(
    { email },
    {
      name,
      avatar: picture,
      google: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpireDate: new Date(tokens.expiry_date),
      },
    },
    { upsert: true, new: true }
  ).select("-google");

  if (!user) {
    throw new ApiError(400, "something went wrong while creating user");
  }

  const { accessToken, refreshToken } =
      await gernateAccessTokenAndRefreshToken(user._id);

    if (!accessToken && !refreshToken) {
      throw new ApiError(400, "AccessToken is undefined");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User created successfully", { user }));
});


const handleLogout = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(401, "Unauthorized, No user found");
    }

    const refreshToken = user.google.refreshToken;
    console.log("refreshToken", refreshToken);

    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required");
    }

    console.log("comed to refreshToken");
    const response = await axios.post(
      `https://accounts.google.com/o/oauth2/revoke?token=${refreshToken}`,
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("cross the resposne");
    if (response.status !== 200) {
      throw new ApiError(400, "Something went wrong while revoking token");
    }
    user.google.refreshToken = "";
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
      .json(new ApiResponse(200, "logout success"));
});

const getUser = asyncHandler(async (req, res) => {
   return res.status(200).json(new ApiResponse(200, "User fetched successfully", req.user));
})

export { createUser, handleLogout, getUser };

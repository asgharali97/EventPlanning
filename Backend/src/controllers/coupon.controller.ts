import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Coupon from "../models/coupon.model.js";
import Event from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    eventId,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    validUntil,
    description,
} = req.body;

  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!code || !eventId || !discountType || !discountValue || !validUntil) {
    throw new ApiError(400, "Code, eventId, discountType, discountValue, and validUntil are required");
  }

  if (!["percentage", "fixed"].includes(discountType)) {
    throw new ApiError(400, "Discount type must be 'percentage' or 'fixed'");
  }

  if (discountValue <= 0) {
    throw new ApiError(400, "Discount value must be greater than 0");
  }

  if (discountType === "percentage" && discountValue > 100) {
    throw new ApiError(400, "Percentage discount cannot exceed 100%");
  }

  const validUntilDate = new Date(validUntil);
  const now = new Date();
  
  if (validUntilDate <= now) {
    throw new ApiError(400, "Valid until date must be in the future");
  }

  const event = await Event.findOne({ _id: eventId, hostId: userId });
  if (!event) {
    throw new ApiError(404, "Event not found or you are not the host");
  }

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new ApiError(400, "Coupon code already exists");
  }

  const couponData: any = {
    code: code.toUpperCase().trim(),
    eventId,
    hostId: userId,
    discountType,
    discountValue,
    validUntil: validUntilDate,
  };

  if (minOrderAmount !== undefined) couponData.minOrderAmount = minOrderAmount;
  if (maxDiscountAmount !== undefined) couponData.maxDiscountAmount = maxDiscountAmount;
  if (usageLimit !== undefined) couponData.usageLimit = usageLimit;
  if (description) couponData.description = description.trim();

  const coupon = await Coupon.create(couponData);

  if (!coupon) {
    throw new ApiError(500, "Failed to create coupon");
  }

  res.status(201).json(new ApiResponse(201, "Coupon created successfully", { coupon }));
});

const getEventCoupons = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  const event = await Event.findOne({ _id: eventId, hostId: userId });
  if (!event) {
    throw new ApiError(404, "Event not found or you are not the host");
  }

  const coupons = await Coupon.find({ eventId, hostId: userId })
    .sort({ createdAt: -1 })
    .populate('eventId', 'title date');

  res.status(200).json(new ApiResponse(200, "Coupons retrieved successfully", {
    eventId,
    eventTitle: event.title,
    coupons,
    totalCoupons: coupons.length
  }));
});

const getCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponId } = req.params;
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!couponId) {
    throw new ApiError(400, "Coupon ID is required");
  }

  const coupon = await Coupon.findOne({ _id: couponId, hostId: userId })
    .populate('eventId', 'title date price')
    .populate('hostId', 'username email');

  if (!coupon) {
    throw new ApiError(404, "Coupon not found or you are not the host");
  }

  res.status(200).json(new ApiResponse(200, "Coupon retrieved successfully", { coupon }));
});

const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponId } = req.params;
  const {
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    validUntil,
    description,
    isActive,
  } = req.body;

  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!couponId) {
    throw new ApiError(400, "Coupon ID is required");
  }

  const coupon = await Coupon.findOne({ _id: couponId, hostId: userId });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found or you are not the host");
  }

  const updateData: any = {};

  if (discountValue !== undefined) {
    if (discountValue <= 0) {
      throw new ApiError(400, "Discount value must be greater than 0");
    }
    if (coupon.discountType === "percentage" && discountValue > 100) {
      throw new ApiError(400, "Percentage discount cannot exceed 100%");
    }
    updateData.discountValue = discountValue;
  }

  if (minOrderAmount !== undefined) {
    updateData.minOrderAmount = minOrderAmount >= 0 ? minOrderAmount : undefined;
  }

  if (maxDiscountAmount !== undefined) {
    updateData.maxDiscountAmount = maxDiscountAmount >= 0 ? maxDiscountAmount : undefined;
  }

  if (usageLimit !== undefined) {
    if (usageLimit < coupon.usedCount) {
      throw new ApiError(400, "Usage limit cannot be less than current usage count");
    }
    updateData.usageLimit = usageLimit;
  }

  if (validUntil !== undefined) {
    const validUntilDate = new Date(validUntil);
    if (validUntilDate <= coupon.validFrom) {
      throw new ApiError(400, "Valid until date must be after valid from date");
    }
    updateData.validUntil = validUntilDate;
  }

  if (description !== undefined) {
    updateData.description = description?.trim() || "";
  }

  if (isActive !== undefined) {
    updateData.isActive = Boolean(isActive);
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedCoupon) {
    throw new ApiError(500, "Failed to update coupon");
  }

  res.status(200).json(new ApiResponse(200, "Coupon updated successfully", {
    coupon: updatedCoupon,
    updatedFields: Object.keys(updateData)
  }));
});

const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponId } = req.params;
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!couponId) {
    throw new ApiError(400, "Coupon ID is required");
  }

  const coupon = await Coupon.findOne({ _id: couponId, hostId: userId });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found or you are not the host");
  }

  if (coupon.usedCount > 0) {
    throw new ApiError(400, "Cannot delete coupon that has been used. Deactivate it instead.");
  }

  await Coupon.deleteOne({ _id: couponId, hostId: userId });

  res.status(200).json(new ApiResponse(200, "Coupon deleted successfully", { couponId }));
});

const deactivateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponId } = req.params;
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!couponId) {
    throw new ApiError(400, "Coupon ID is required");
  }

  const coupon = await Coupon.findOne({ _id: couponId, hostId: userId });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found or you are not the host");
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: { isActive: false } },
    { new: true, runValidators: true }
  );

  if (!updatedCoupon) {
    throw new ApiError(500, "Failed to deactivate coupon");
  }

  res.status(200).json(new ApiResponse(200, "Coupon deactivated successfully", { coupon: updatedCoupon }));
});

const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, eventId, orderAmount } = req.body;

  if (!code || !eventId || !orderAmount) {
    throw new ApiError(400, "Code, eventId, and orderAmount are required");
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    eventId,
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  const now = new Date();
  if (coupon.validFrom > now || coupon.validUntil < now) {
    throw new ApiError(400, "Coupon has expired");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "Coupon usage limit exceeded");
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount of ${coupon.minOrderAmount} required`);
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  const finalAmount = Math.max(0, orderAmount - discountAmount);

  res.status(200).json(new ApiResponse(200, "Coupon is valid", {
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    },
    originalAmount: orderAmount,
    discountAmount,
    finalAmount,
    remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : null,
  }));
});

const getHostCoupons = asyncHandler(async (req: Request, res: Response) => {
  const hostId = (req as any).user?._id;
  if (!hostId) {
    throw new ApiError(401, "HostId is required");
  }
  const hostEvents = await Event.find({ hostId }).select('_id');
  const eventIds = hostEvents.map(event => event._id);
  if (!hostEvents) {
    throw new ApiError(404, "Events not found");
  }

  const coupons = await Coupon.find({ eventId: { $in: eventIds } })
    .populate('eventId', 'title coverImage')
    .sort({ createdAt: -1 });

  if (!coupons) {
    throw new ApiError(400, "Failed to getCoupons");
  }

  return res.status(200).json(
    new ApiResponse(200,'Host coupons fetched successfully',  coupons)
  );
});

const getCouponStats = asyncHandler(async (req: Request, res: Response) => {
  const hostId = (req as any).user?._id;
  if (!hostId) {
    throw new ApiError(401, "HostId is required");
  }
  const hostEvents = await Event.find({ hostId }).select('_id');
  const eventIds = hostEvents.map(event => event._id);
  if (!hostEvents) {
    throw new ApiError(404, "Events not found");
  }

  const [totalCoupons, activeCoupons, totalUsage] = await Promise.all([
    Coupon.countDocuments({ eventId: { $in: eventIds } }),
    Coupon.countDocuments({ 
      eventId: { $in: eventIds },
      isActive: true,
      validUntil: { $gt: new Date() }
    }),
    Coupon.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: null, total: { $sum: '$usedCount' } } }
    ])
  ]);

  return res.status(200).json(
    new ApiResponse(200,'Coupon stats fetched successfully', {
      totalCoupons,
      activeCoupons,
      totalUsage: totalUsage[0]?.total || 0
    })
  );
});


export {
  createCoupon,
  getEventCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  deactivateCoupon,
  validateCoupon,
  getHostCoupons,
  getCouponStats
};

import EventBooking from "../models/eventBooking.model.js";
import Event from "../models/event.model.js";
import Coupon from "../models/coupon.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getHostStats = asyncHandler(async (req, res) => {
  // @ts-ignore
  const hostId = req.user._id;

  if (!hostId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }
  const hostEvents = await Event.find({ hostId }).select("_id");
  const eventIds = hostEvents.map((event) => event._id);

  const [totalEvents, totalBookings, bookings, activeCoupons] =
    await Promise.all([
      Event.countDocuments({ hostId }),
      EventBooking.countDocuments({ eventId: { $in: eventIds } }),
      EventBooking.find({
        eventId: { $in: eventIds },
        paymentStatus: "completed",
      }).select("totalAmount"),
      Coupon.countDocuments({
        eventId: { $in: eventIds },
        isActive: true,
        expiresAt: { $gt: new Date() },
      }),
    ]);

  const totalRevenue = bookings.reduce(
    //@ts-ignore
    (sum, booking) => sum + booking?.totalAmount,
    0
  );
  return res.status(200).json(
    new ApiResponse(200, "Host stats fetched successfully", {
      totalEvents,
      totalBookings,
      totalRevenue,
      activeCoupons,
    })
  );
});

const getRecentEvents = asyncHandler(async (req, res) => {
  const hostId = (req as any).user?._id;
  if (!hostId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }
  const limit = parseInt(req.query.limit as string) || 5;

  const recentEvents = await Event.find({ hostId, status: { $ne: "canceled" } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(
      "title coverImage date time price seats category eventType location"
    );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Recent events fetched successfully", recentEvents)
    );
});
export { getHostStats, getRecentEvents };

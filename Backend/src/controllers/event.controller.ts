import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from 'mongoose';

const updatePastEvents = async () => {
  const now = new Date();
  await Event.updateMany(
    {
      status: "active",
      date: { $lt: now }
    },
    {
      $set: { status: "past" }
    }
  );
};

interface EventQueryParams {
  type?: "all" | "physical" | "online";
  search?: string;
  date?: string;
  sortByPrice?: "asc" | "desc" | "none";
  page?: string;
  limit?: string;
  category?: string;
}

const getEventByHostId = asyncHandler(async (req: Request, res: Response) => {
  await updatePastEvents();
  
  const hostId = (req as any).user?._id;
  if (!hostId) {
    throw new ApiError(400, "UnAuthorized: User not found");
  }
  const {
    q,
    category,
    eventType,
    date,
    page = "1",
    limit = "12",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page || "1", 10));
  const limitNum = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(limit || "12", 10))
  );
  const skip = (pageNum - 1) * limitNum;

  const match: any = {
      hostId: new mongoose.Types.ObjectId(hostId),
      status: { $ne: "canceled" }
  };

  if (category) match.category = { $in: category.split(",") };
  if (eventType) match.eventType = { $in: eventType.split(",") };

  if (date) {
    const now = new Date();
    const targetDate = new Date(date);
    match.date = { $gte: now, $lte: targetDate };
  }

  const textSearchStage: any[] = [];
  if (q && q.trim().length) {
    textSearchStage.push({
      $match: {
        $or: [
          { title: { $regex: q.trim(), $options: "i" } },
          { description: { $regex: q.trim(), $options: "i" } },
          { tags: { $regex: q.trim(), $options: "i" } },
        ],
      },
    });
  }

  const pipeline: any[] = [
    { $match: match },
    ...textSearchStage,
    {
      $lookup: {
        from: "users",
        let: { hostId: "$hostId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$hostId"] } } },
          {
            $project: {
              _id: 1,
              email: 1,
              avatar: 1,
              fullName: 1,
              isVerified: 1,
              role: 1,
            },
          },
        ],
        as: "eventHost",
      },
    },
    {
      $addFields: {
        host: { $arrayElemAt: ["$eventHost", 0] },
      },
    },
    { $project: { eventHost: 0 } },
    { $skip: skip },
    { $limit: limitNum },
  ];

  const results = await Event.aggregate(pipeline).allowDiskUse(true).exec();

  const totalCount = await Event.countDocuments(match);

  return res.status(200).json(
    new ApiResponse(200, "Success", {
      events: results,
      totalCount,
      page: pageNum,
      limit: limitNum,
    })
  );
});

const getEventById = asyncHandler(async (req: Request, res: Response) => {
  await updatePastEvents();
  
  const { eventId } = req.params;
  const event = await Event.findById(eventId).populate(
    "hostId",
    "_id name email avatar isVerified"
  );
  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Event fetched successfully", event));
});

const MAX_PAGE_SIZE = 50;

const getAllEventsEnhanced = asyncHandler(
  async (req: Request, res: Response) => {
    const statusEvent = await updatePastEvents();
    const {
      q,
      category,
      eventType,
      priceMin,
      priceMax,
      date,
      sortBy = "date",
      sortDir = "asc",
      page = "1",
      limit = "12",
    } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page || "1", 10));
    const limitNum = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(limit || "12", 10))
    );
    const skip = (pageNum - 1) * limitNum;
    const match: any = {
      status: { $ne: "canceled" }
    };

    if (category) match.category = { $in: category.split(",") };
    if (eventType) match.eventType = { $in: eventType.split(",") };

    if (priceMin || priceMax) {
      match.price = {};
      if (priceMin) match.price.$gte = Number(priceMin);
      if (priceMax) match.price.$lte = Number(priceMax);
    }

    if (date) {
      const now = new Date();
      const targetDate = new Date(date);
      match.date = { $gte: now, $lte: targetDate };
    }

    const textSearchStage: any[] = [];
    if (q && q.trim().length) {
      textSearchStage.push({
        $match: {
          $or: [
            { title: { $regex: q.trim(), $options: "i" } },
            { description: { $regex: q.trim(), $options: "i" } },
            { tags: { $regex: q.trim(), $options: "i" } },
          ],
        },
      });
    }

    const sortStage: any = {};
    if (sortBy === "price") sortStage.price = sortDir === "asc" ? 1 : -1;
    else if (sortBy === "relevance" && q) sortStage.relevance = -1;
    else sortStage.date = sortDir === "asc" ? 1 : -1;

    const pipeline: any[] = [
      { $match: match },
      ...textSearchStage,
      {
        $lookup: {
          from: "users",
          let: { hostId: "$hostId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$hostId"] } } },
            {
              $project: {
                _id: 1,
                email: 1,
                avatar: 1,
                fullName: 1,
                isVerified: 1,
                role: 1,
              },
            },
          ],
          as: "eventHost",
        },
      },
      {
        $addFields: {
          host: { $arrayElemAt: ["$eventHost", 0] },
        },
      },
      { $project: { eventHost: 0 } },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const results = await Event.aggregate(pipeline).allowDiskUse(true).exec();

    const totalCount = await Event.countDocuments(match);

    return res.status(200).json(
      new ApiResponse(200, "Success", {
        events: results,
        totalCount,
        page: pageNum,
        limit: limitNum,
      })
    );
  }
);

export { getEventByHostId, getEventById, getAllEventsEnhanced };

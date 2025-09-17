import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/event.model.js";
import EventBooking from '../models/eventBooking.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "utils/cloudaniry.js";
import User from "models/user.model.js";

const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    price,
    seats,
    category,
    date,
    time,
    description,
    location,
    eventType,
    onlineDetails,
    tags,
  } = req.body;

  const coverImage =
    (req.files &&
      (req.files as any).coverImage &&
      (req.files as any).coverImage[0]?.path) ||
    undefined;

  if (!title || !price || !seats || !category || !date || !time || !eventType) {
    throw new ApiError(400, "All fields are required");
  }

  if (!coverImage) {
    throw new ApiError(400, "cover image is required");
  }

  if (eventType === "online" && !onlineDetails) {
    throw new ApiError(400, "Online details are required");
  }

  const coverImageFile = await uploadOnCloudinary(coverImage);

  if (!coverImageFile) {
    throw new ApiError(400, "failed to upload image on cloudaniry");
  }

  const userId = (req as any).user?._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(401, "Unauthorized, No user found");
  }

  const eventData: any = {
    title,
    price,
    seats,
    category,
    date,
    time,
    coverImage: coverImageFile.url,
    hostId: user._id,
    eventType,
  };

  if (eventType === "online") {
    eventData.location = "online";
    if (onlineDetails) {
      eventData.onlineDetails = onlineDetails;
    }
  } else {
    if (!location) {
      throw new ApiError(400, "Location is required for physical events");
    }
    eventData.location = location;
  }

  if (description) eventData.description = description;
  if (Array.isArray(tags) && tags.length > 0) eventData.tags = tags;

  const event = await Event.create(eventData);

  if (!event) {
    throw new ApiError(400, "failed to create event");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Event created sucessfult", { event }));
});

const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  console.log(req.body)
  const {
    title,
    price,
    seats,
    category,
    date,
    time,
    description,
    location,
    eventType,
    onlineDetails,
    tags,
  } = req.body;
  console.log(title)
  const userId = (req as any).user?._id;

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  const event = await Event.findOne({ _id: eventId, hostId: userId });

  if (!event) {
    throw new ApiError(404, "Event not found or you are not the host");
  }

  const bookingCount = await EventBooking.countDocuments({ 
    eventId: eventId, 
    status: "confirmed" 
  });

  if (bookingCount > 0 && (date || time)) {
    throw new ApiError(400, 
      `Cannot change date/time when ${bookingCount} booking(s) exist. Please contact support or cancel existing bookings first.`
    );
  }

  const updateData: any = {};

  if (title !== undefined) {
    console.log('titel is undefined')
    if (!title.trim()) {
      throw new ApiError(400, "Title cannot be empty");
    }
    updateData.title = title.trim();
  }

  if (price !== undefined) {
    if (price < 0) {
      throw new ApiError(400, "Price cannot be negative");
    }
    updateData.price = price;
  }

  if (seats !== undefined) {
    if (seats < 1) {
      throw new ApiError(400, "Seats must be at least 1");
    }
    updateData.seats = seats;
  }

  if (category !== undefined) {
    const validCategories = ["tech", "sports", "arts", "music", "food", "health", "other"];
    if (!validCategories.includes(category)) {
      throw new ApiError(400, "Invalid category");
    }
    updateData.category = category;
  }

  if (date !== undefined) {
    updateData.date = new Date(date);
  }

  if (time !== undefined) {
    if (!time.trim()) {
      throw new ApiError(400, "Time cannot be empty");
    }
    updateData.time = time.trim();
  }

  if (description !== undefined) {
    updateData.description = description?.trim() || "";
  }

  if (eventType !== undefined) {
    if (!["physical", "online"].includes(eventType)) {
      throw new ApiError(400, "Event type must be 'physical' or 'online'");
    }
    updateData.eventType = eventType;

    if (eventType === "online") {
      updateData.location = "online";
      if (onlineDetails !== undefined) {
        if (!onlineDetails?.link) {
          throw new ApiError(400, "Online link is required for online events");
        }
        updateData.onlineDetails = onlineDetails;
      }
    } else {
      if (location !== undefined) {
        if (!location?.trim()) {
          throw new ApiError(400, "Location is required for physical events");
        }
        updateData.location = location.trim();
      }
    }
  } else {
    if (location !== undefined) {
      if (event.eventType === "online") {
        throw new ApiError(400, "Cannot set location for online events");
      }
      if (!location?.trim()) {
        throw new ApiError(400, "Location cannot be empty for physical events");
      }
      updateData.location = location.trim();
    }

    if (onlineDetails !== undefined && event.eventType === "physical") {
      throw new ApiError(400, "Cannot set online details for physical events");
    }
    if (onlineDetails !== undefined && event.eventType === "online") {
      if (!onlineDetails?.link) {
        throw new ApiError(400, "Online link is required");
      }
      updateData.onlineDetails = onlineDetails;
    }
  }

  if (tags !== undefined) {
    if (Array.isArray(tags)) {
      // Clean and validate new tags
      const newTags = tags.filter(tag => tag?.trim()).map(tag => tag.trim());
      
      // Merge with existing tags (remove duplicates)
      const existingTags = event.tags || [];
      const mergedTags = [...new Set([...existingTags, ...newTags])];
      
      updateData.tags = mergedTags;
    } else {
      // If tags is not an array, keep existing tags
      updateData.tags = event.tags || [];
    }
  }

  const coverImageFile =
    (req.files &&
      (req.files as any).coverImage &&
      (req.files as any).coverImage[0]?.path) ||
    undefined;

  if (coverImageFile) {
    try {
      await deleteFromCloudinary(event.coverImage);
    } catch (error) {
      console.error("Error deleting old cover image:", error);
    }

    const uploadResult = await uploadOnCloudinary(coverImageFile);
    if (!uploadResult) {
      throw new ApiError(400, "Failed to upload new cover image");
    }
    updateData.coverImage = uploadResult.url;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedEvent) {
    throw new ApiError(500, "Failed to update event");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Event updated successfully", { 
      event: updatedEvent,
      bookingCount,
      updatedFields: Object.keys(updateData)
    }));
});

const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.body;

  if (!eventId) {
    throw new ApiError(400, "Event id is a required field");
  }

  const event = await Event.findById(eventId);

  const bookingCount = await EventBooking.countDocuments({ 
    eventId: eventId, 
    status: "confirmed" 
  });

  if (bookingCount > 0) {
    throw new ApiError(400, 
      `Cannot Delete Event whens ${bookingCount} booking(s) exist. Please contact support or cancel existing bookings first.`
    );
  }

  const userId = (req as any).user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }


  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.hostId.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden: You are not the host of this event");
  }

  if (event.coverImage) {
    try {
      await deleteFromCloudinary(event.coverImage);
    } catch (err) {
      throw new ApiError(400, "Failed to delete cover image from cloudinary");
    }
  }

  await Event.deleteOne({ _id: eventId, hostId: userId });

  res
    .status(200)
    .json(new ApiResponse(200, "Event deleted successfully", { eventId }));
});

export { createEvent, updateEvent, deleteEvent };

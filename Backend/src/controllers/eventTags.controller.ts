import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addTagsToEvent = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { tags } = req.body;
  const userId = (req as any).user?._id;

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    throw new ApiError(400, "Tags array is required and cannot be empty");
  }

  const cleanTags = tags
    .filter(tag => tag && typeof tag === 'string' && tag.trim())
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  if (cleanTags.length === 0) {
    throw new ApiError(400, "No valid tags provided");
  }

  const event = await Event.findOne({ _id: eventId, hostId: userId });

  if (!event) {
    throw new ApiError(404, "Event not found or you are not the host");
  }

  const existingTags = event.tags || [];
  const mergedTags = [...new Set([...existingTags, ...cleanTags])];

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: { tags: mergedTags } },
    { new: true, runValidators: true }
  );

  if (!updatedEvent) {
    throw new ApiError(500, "Failed to add tags to event");
  }

  res.status(200).json(new ApiResponse(200, "Tags added successfully", {
    event: updatedEvent,
    addedTags: cleanTags,
    allTags: updatedEvent.tags
  }));
});

const removeTagsFromEvent = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { tags } = req.body;
  const userId = (req as any).user?._id;

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    throw new ApiError(400, "Tags array is required and cannot be empty");
  }

  const tagsToRemove = tags
    .filter(tag => tag && typeof tag === 'string' && tag.trim())
    .map(tag => tag.trim());

  if (tagsToRemove.length === 0) {
    throw new ApiError(400, "No valid tags provided for removal");
  }

  const event = await Event.findOne({ _id: eventId, hostId: userId });

  if (!event) {
    throw new ApiError(404, "Event not found or you are not the host");
  }

  const existingTags = event.tags || [];
  const updatedTags = existingTags.filter(tag => !tagsToRemove.includes(tag));

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: { tags: updatedTags } },
    { new: true, runValidators: true }
  );

  if (!updatedEvent) {
    throw new ApiError(500, "Failed to remove tags from event");
  }

  res.status(200).json(new ApiResponse(200, "Tags removed successfully", {
    event: updatedEvent,
    removedTags: tagsToRemove,
    remainingTags: updatedEvent.tags
  }));
});

const replaceEventTags = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { tags } = req.body;
  const userId = (req as any).user?._id;

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!Array.isArray(tags)) {
    throw new ApiError(400, "Tags must be an array");
  }

  const cleanTags = tags
    .filter(tag => tag && typeof tag === 'string' && tag.trim())
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const uniqueTags = [...new Set(cleanTags)];

  const event = await Event.findOne({ _id: eventId, hostId: userId });

  if (!event) {
    throw new ApiError(404, "Event not found or you are not the host");
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: { tags: uniqueTags } },
    { new: true, runValidators: true }
  );

  if (!updatedEvent) {
    throw new ApiError(500, "Failed to replace tags");
  }

  res.status(200).json(new ApiResponse(200, "Tags replaced successfully", {
    event: updatedEvent,
    newTags: updatedEvent.tags,
    previousTags: event.tags || []
  }));
});

const getEventTags = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = (req as any).user?._id;

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  const event = await Event.findOne({ _id: eventId, hostId: userId }).select('tags title');

  if (!event) {
    throw new ApiError(404, "Event not found or you are not the host");
  }

  res.status(200).json(new ApiResponse(200, "Event tags retrieved successfully", {
    eventId: event._id,
    eventTitle: event.title,
    tags: event.tags || []
  }));
});

const clearEventTags = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
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

  const previousTags = event.tags || [];

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: { tags: [] } },
    { new: true, runValidators: true }
  );

  if (!updatedEvent) {
    throw new ApiError(500, "Failed to clear tags");
  }

  res.status(200).json(new ApiResponse(200, "All tags cleared successfully", {
    event: updatedEvent,
    clearedTags: previousTags
  }));
});

export {
  addTagsToEvent,
  removeTagsFromEvent,
  replaceEventTags,
  getEventTags,
  clearEventTags
};

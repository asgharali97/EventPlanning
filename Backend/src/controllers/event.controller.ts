import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Event from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllEvents = asyncHandler(async (req: Request, res:Response) => {
  const events = await Event.find();

  if (!events) {
    throw new ApiError(404, "No events found");
  }
  res.status(200).json(new ApiResponse(200, "Events fetched successfully", events));
});

const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);  
  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  return res.status(200).json(new ApiResponse(200, "Event fetched successfully", event));
});


export  { getAllEvents, getEventById };
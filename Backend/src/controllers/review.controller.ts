import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudaniry.js";
import EventBooking from "../models/eventBooking.model.js";
import Review from "../models/review.model.js";
import Event from "../models/event.model.js"; 
import mongoose from "mongoose";

const checkReviewEligibility = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = (req.user as any)?._id;
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const eventDate = new Date(event.date);
  const now = new Date();
  const hasEventPassed = eventDate < now;

  if (!hasEventPassed) {
    return res.status(200).json(
      new ApiResponse(200, "Eligibility check", {
        canReview: false,
        reason: "Event has not occurred yet",
        eventDate: eventDate,
      })
    );
  }

  const booking = await EventBooking.findOne({
    userId,
    eventId,
    status: "confirmed",
    paymentStatus: "paid",
  });

  if (!booking) {
    return res.status(200).json(
      new ApiResponse(200, "Eligibility check", {
        canReview: false,
        reason: "You have not booked this event",
      })
    );
  }

  const existingReview = await Review.findOne({ userId, eventId });

  if (existingReview) {
    return res.status(200).json(
      new ApiResponse(200, "Eligibility check", {
        canReview: false,
        reason: "You have already reviewed this event",
        existingReview: existingReview,
      })
    );
  }

  res.status(200).json(
    new ApiResponse(200, "Eligibility check", {
      canReview: true,
      reason: "You can review this event",
    })
  );
});

const addReview = asyncHandler(async (req: Request, res: Response) => {
  const { review, rating, eventId } = req.body;
  const userId = (req.user as any)?._id;
  console.log(req.body)
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }
  
  if (!review || !rating || !eventId) {
    throw new ApiError(400, "Review, rating, and eventId are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be an integer between 1 and 5");
  }

  if (review.trim().length < 10 || review.trim().length > 1000) {
    throw new ApiError(400, "Review must be between 10 and 1000 characters");
  }
  const ratignNumber = parseInt(rating, 10);

  const eventExists = await Event.findById(eventId);
  if (!eventExists) {
    throw new ApiError(404, "Event not found");
  }

  const booking = await EventBooking.findOne({ 
    eventId: eventId, 
    userId: userId,
    status: "confirmed" 
  });

  if (!booking) {
    throw new ApiError(403, "You can only review events you have booked and attended");
  }

  const currentDate = new Date();
  const eventDate = eventExists.date;
  
  if (!eventDate || new Date(eventDate) > currentDate) {
    throw new ApiError(400, "You can only review events that have already occurred");
  }
 console.log('cross the confirm')
 const existingReview = await Review.findOne({ userId, eventId });
 if (existingReview) {
   throw new ApiError(409, "You have already reviewed this event");
  }
  console.log('cross the exits reveiw')
  
  let uploadedImages: string[] = [];
  
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    if (req.files.length > 4) {
      throw new ApiError(400, "Maximum 4 images allowed per review");
    }
    
    for (const file of req.files) {
      try {
        const uploadResult = await uploadOnCloudinary(file.path);
        if (uploadResult?.url) {
          uploadedImages.push(uploadResult.url);
        }
      } catch (error) {
        for (const imageUrl of uploadedImages) {
          await deleteFromCloudinary(imageUrl);
        }
        throw new ApiError(500, "Failed to upload images");
      }
    }
  }

  console.log('cross the upload')
  try {
    const newReview = await Review.create({
      review: review.trim(),
      rating: ratignNumber,
      images: uploadedImages,
      userId,
      eventId
    });

      console.log('cross the review new',newReview)
    const populatedReview = await Review.findById(newReview._id)
      .populate('userId', 'name email profileImage')
      .populate('eventId', 'title location date');

    res.status(201).json(
      new ApiResponse(201, "Review created successfully", populatedReview)
    );

  } catch (error) {
    for (const imageUrl of uploadedImages) {
      await deleteFromCloudinary(imageUrl);
    }
    throw new ApiError(500, "Failed to create review");
  }
});

const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const userId = (req.user as any)?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const review = await Review.findById(reviewId);
  
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

    if (review.images && review.images.length > 0) {
      for (const imageUrl of review.images) {
        await deleteFromCloudinary(imageUrl);
      }
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json(
      new ApiResponse(200, "Review deleted successfully",{})
    );
});


const getEventReviews = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;


  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const reviews = await Review.find({ eventId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit as string))
    .lean();

  const totalReviews = await Review.countDocuments({ eventId });
  const totalPages = Math.ceil(totalReviews / parseInt(limit as string));

  const ratingStats = await Review.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating"
        }
      }
    }
  ]);

  const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratingDistribution: [] };

  res.status(200).json(
    new ApiResponse(200,"Reviews fetched successfully",{
      reviews,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page as string) < totalPages,
        hasPrevPage: parseInt(page as string) > 1
      },
      stats: {
        averageRating: Math.round(stats.averageRating * 10) / 10,
        totalReviews: stats.totalReviews
      }
    })
  );
});

const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  const { page = 1, limit = 10 } = req.query;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const reviews = await Review.find({ userId })
    .populate('eventId', 'title location date images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit as string))
    .lean();

  const totalReviews = await Review.countDocuments({ userId });
  const totalPages = Math.ceil(totalReviews / parseInt(limit as string));

  res.status(200).json(
    new ApiResponse(200, "User reviews fetched successfully", {
      reviews,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page as string) < totalPages,
        hasPrevPage: parseInt(page as string) > 1
      }
    },)
  );
});

const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { review, rating } = req.body;
  const userId = (req.user as any)?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }
  const existingReview = await Review.findById(reviewId);
  
  if (!existingReview) {
    throw new ApiError(404, "Review not found");
  }

  if (existingReview.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own reviews");
  }

  const updateData: any = {};

  if (review !== undefined) {
    if (review.trim().length < 10 || review.trim().length > 1000) {
      throw new ApiError(400, "Review must be between 10 and 1000 characters");
    }
    updateData.review = review.trim();
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new ApiError(400, "Rating must be an integer between 1 and 5");
    }
    updateData.rating = parseInt(rating);
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "At least one field (review or rating) must be provided for update");
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    updateData,
    { new: true, runValidators: true }
  ).populate('userId', 'name email profileImage')
   .populate('eventId', 'title location date');

  res.status(200).json(
    new ApiResponse(200,"Review updated successfully",{updatedReview})
  );
});

export {
  checkReviewEligibility,
  addReview,
  deleteReview,
  getEventReviews,
  getUserReviews,
  updateReview
}
import express, { Router } from "express";
import verifyJWT from "../middleware/jwtVerify.js";
import upload from "middleware/mutler.js";
import {
  getEventReviews,
  addReview,
  deleteReview,
  getUserReviews,
  updateReview,
} from "controllers/review.controller.js";
const router = Router();

router.get("/:eventId", getEventReviews);

router.post("/", verifyJWT, upload.array("images", 4), addReview);
router.delete("/:reviewId", verifyJWT, deleteReview);
router.get("/my-reviews", verifyJWT, getUserReviews);
router.put("/:reviewId", verifyJWT, updateReview);


export default router;
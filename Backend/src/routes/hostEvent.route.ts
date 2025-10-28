import express, { Router } from "express";
import verifyJWT from "../middleware/jwtVerify.js";
import upload from "../middleware/mutler.js";
import isHost from "../middleware/isHost.js";
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "../controllers/hostEvent.controller.js";


const router = Router();

router.route("/create-event").post(
  verifyJWT,
  isHost,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  createEvent
);
router.route("/update-event/:eventId").patch(
  verifyJWT,
  isHost,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  updateEvent
);
router.route("/delete-event/:eventId").delete(verifyJWT, isHost, deleteEvent);

export default router;

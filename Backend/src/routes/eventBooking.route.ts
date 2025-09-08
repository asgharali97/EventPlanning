import { Router } from "express";
import {
  bookEvent,
  successPay,
  getBookedEvents,
} from "../controllers/eventBooking.controller.js";
import verifyJWT from "../middleware/jwtVerify.js";
const router = Router();

router.post("/", verifyJWT, bookEvent);
router.get("/success/:session_id", verifyJWT, successPay);
router.get("/get-booked-events", verifyJWT, getBookedEvents);

export default router;

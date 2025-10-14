import { Router } from "express";
import { getAllEvents, getAllEventsEnhanced, getEventById } from "../controllers/event.controller.js";

const router = Router();

// router.get("/", getAllEvents);
router.get('/', getAllEventsEnhanced)
router.get("/:eventId", getEventById);

export default router;

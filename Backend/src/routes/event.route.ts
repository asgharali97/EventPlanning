import { Router } from "express";
import { getEventByHostId, getAllEventsEnhanced, getEventById } from "../controllers/event.controller.js";
import verifyJWT from "../middleware/jwtVerify.js";

const router = Router();

router.get("/host/me", verifyJWT,getEventByHostId);
router.get('/', getAllEventsEnhanced)
router.get("/:eventId", getEventById);

export default router;

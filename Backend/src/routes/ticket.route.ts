import { Router } from "express";
import { getUserTickets, validateTicket, cancelTicket } from "../controllers/ticket.controller.js";
import verifyJWT from "../middleware/jwtVerify.js";

const router = Router();

router.route('/mytickets').get(verifyJWT, getUserTickets);

router.route('/validate/:ticketNumber').get(validateTicket);

router.route('/cancel/:bookingId').patch(verifyJWT, cancelTicket);

export default router;

import express, {Router} from 'express';
import { bookEvent, successPay } from '../controllers/eventBooking.controller.js';

const router = Router();

router.post('/', bookEvent)
router.get('/success/:session_id', successPay)

export default router;
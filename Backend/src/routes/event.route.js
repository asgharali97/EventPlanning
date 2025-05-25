import express,{Router} from 'express';
import { getAllEvents,getEventById } from '../controllers/event.controller.js';

const router = Router();

router.get('/', getAllEvents);
router.get('/:eventId', getEventById);

export default router;
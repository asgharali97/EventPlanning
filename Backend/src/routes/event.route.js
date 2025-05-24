import express,{Router} from 'express';
import { getAllEvents } from '../controllers/event.controller.js';

const router = Router();

router.get('/', getAllEvents);

export default router;
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

// middlewares
app.use(
    cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
import authRoutes from './routes/auth.route.js';
import eventRoutes from './routes/event.route.js';
import eventBookingRoutes from './routes/eventBooking.route.js';
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/event-booking', eventBookingRoutes);
export default app;


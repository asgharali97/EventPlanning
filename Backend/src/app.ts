import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Express = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use((req, res, next) => {
  if (req.originalUrl === "/host/verifypayment/webhook") {
    next(); 
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import eventBookingRoutes from "./routes/eventBooking.route.js";
import hostRoutes from './routes/host.route.js';
import hostEventRoutes from './routes/hostEvent.route.js';
import couponsRoutes from './routes/coupons.route.js';
import eventTags from './routes/eventTags.route.js';
import ticketRoutes from './routes/ticket.route.js';
import reviewRoutes from './routes/review.route.js';
import hostDashboardRoutes from './routes/hostDashboard.route.js';

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/booking", eventBookingRoutes);
app.use("/api/host", hostRoutes);
app.use('/api/host/event', hostEventRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/coupon',couponsRoutes);
app.use('/api/tag',eventTags);
app.use('/api/ticket', ticketRoutes);
app.use('/api/host/dashboard', hostDashboardRoutes)


export  {app}

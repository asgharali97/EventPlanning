import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Express = express();

// middlewares
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

// routes
import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import eventBookingRoutes from "./routes/eventBooking.route.js";
import hostRoutes from './routes/host.route.js';
import hostEventRoutes from './routes/hostEvent.route.js';
import couponsRoutes from './routes/coupons.route.js';
import eventTags from './routes/eventTags.route.js';
import ticketRoutes from './routes/ticket.route.js';

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/event-booking", eventBookingRoutes);
app.use("/host", hostRoutes);
app.use('/event', hostEventRoutes);
app.use('/coupon',couponsRoutes);
app.use('/tag',eventTags);
app.use('/ticket', ticketRoutes);


export  {app}

import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Express = express();

// middlewares
console.log(process.env.CORS_ORIGIN)
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
app.use(cookieParser());

// routes
import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import eventBookingRoutes from "./routes/eventBooking.route.js";
import hostRoutes from './routes/host.route.js';

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/event-booking", eventBookingRoutes);
app.use("/host", hostRoutes);
export  {app}

import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env')
});
const app: Express = express();

// middlewares
console.log(process.env.CORS_ORIGIN)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import eventBookingRoutes from "./routes/eventBooking.route.js";
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/event-booking", eventBookingRoutes);

export default app;

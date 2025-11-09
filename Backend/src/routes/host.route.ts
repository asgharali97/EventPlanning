import express, { Router } from "express";
import { verifyHostPaymentwebhook } from "../controllers/host.controller.js";

const router = Router();
router
  .route("/verifypayment/webhook")
  .post(express.raw({ type: "application/json" }), verifyHostPaymentwebhook);

export default router;

import express, { Router } from "express";
import {refundHostDeposit, verifyHostPaymentwebhook} from '../controllers/host.controller.js';
import verifyJWT from "../middleware/jwtVerify.js";
const router = Router();

router.route('/refund').get(verifyJWT, refundHostDeposit);
router.route('/verifypayment/webhook').post(express.raw({type:'application/json'}),verifyHostPaymentwebhook);

export default router;

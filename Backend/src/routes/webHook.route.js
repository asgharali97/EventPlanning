import express, {Router} from "express";
import { webHook } from "../controllers/user.controller.js";

const router = Router();

router.post("/clerk" , webHook)

export default router;
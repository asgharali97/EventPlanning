import express, {Router} from "express";
import { requireAuth } from "@clerk/express";
import { createUser, webHook } from "../controllers/user.controller.js";

const router = Router();

router.post("/sync", requireAuth(), createUser)

export default router;
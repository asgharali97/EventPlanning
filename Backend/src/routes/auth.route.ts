import { Router } from "express";
import {
  createUser,
  getUser,
  handleLogout,
  becomeHost,
  verifyHostPayment,
  getUserById
} from "../controllers/user.controller.js";
import verifyJWT from "../middleware/jwtVerify.js";
const router = Router();

router.post("/sign-in", createUser);
router.post("/logout", verifyJWT, handleLogout);
router.get("/user", verifyJWT, getUser);
router.get("/become/host", verifyJWT, becomeHost);
router.post("/verify/host", verifyJWT, verifyHostPayment);
router.post('/get-userById',verifyJWT,getUserById);

export default router;

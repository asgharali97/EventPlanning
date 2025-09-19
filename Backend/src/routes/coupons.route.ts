import {
  createCoupon,
  deactivateCoupon,
  deleteCoupon,
  getCoupon,
  getEventCoupons,
  updateCoupon,
  validateCoupon,
} from "controllers/coupon.controller.js";
import { Router } from "express";
import isHost from "middleware/isHost.js";
import verifyJWT from "middleware/jwtVerify.js";

const router = Router();

router.route("/create").post(verifyJWT,isHost,createCoupon);
router.route("/get-all/:eventId").get(verifyJWT,isHost,getEventCoupons);
router.route("/get/:couponId").get(verifyJWT,isHost,getCoupon);
router.route("/update/:couponId").patch(verifyJWT,isHost,updateCoupon);
router.route("/validate").post(verifyJWT,isHost,validateCoupon);
router.route("/deactivate/:couponId").get(verifyJWT,isHost,deactivateCoupon);
router.route("/delete/:couponId").delete(verifyJWT,isHost,deleteCoupon);

export default router;

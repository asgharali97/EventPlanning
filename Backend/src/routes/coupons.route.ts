import {
  createCoupon,
  deactivateCoupon,
  deleteCoupon,
  getCoupon,
  getCouponStats,
  getEventCoupons,
  getHostCoupons,
  updateCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";
import { Router } from "express";
import isHost from "../middleware/isHost.js";
import verifyJWT from "../middleware/jwtVerify.js";

const router = Router();

router.route("/create").post(verifyJWT,isHost,createCoupon);
router.route("/validate").post(verifyJWT,isHost,validateCoupon);
router.route('/get-all').get(verifyJWT, isHost, getHostCoupons)
router.route('/stats').get(verifyJWT, isHost, getCouponStats)
router.route("/get-all/:eventId").get(verifyJWT,isHost,getEventCoupons);
router.route("/get/:couponId").get(verifyJWT,isHost,getCoupon);
router.route("/:couponId/update").patch(verifyJWT,isHost,updateCoupon);
router.route("/:couponId/deactivate").get(verifyJWT,isHost,deactivateCoupon);
router.route("/:couponId/delete").delete(verifyJWT,isHost,deleteCoupon);
export default router;

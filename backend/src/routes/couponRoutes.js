const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const coupon = require("../controllers/couponController");

// admin
router.post("/create", protect, adminOnly, coupon.createCoupon);
router.get("/", protect, adminOnly, coupon.getCoupons);
router.put("/:id/toggle", protect, adminOnly, coupon.toggleCoupon);

// user
router.post("/apply", protect, coupon.applyCoupon);

module.exports = router;
const Coupon = require("../models/Coupon");

// ADMIN CREATE COUPON
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json(coupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Coupon already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

// USER APPLY COUPON
exports.applyCoupon = async (req, res) => {
  try {
    const { code, total } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    if (coupon.expiry < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    if (coupon.usedBy.includes(req.user.id)) {
      return res.status(400).json({ message: "Already used" });
    }

    if (total < coupon.minOrder) {
      return res.status(400).json({ message: "Minimum order not met" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    let discount = 0;

    if (coupon.type === "flat") {
      discount = coupon.value;
    } else {
      discount = (total * coupon.value) / 100;
    }

    res.json({
      subtotal: total,
      discount,
      finalTotal: total - discount,
      couponId: coupon._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN GET ALL COUPONS
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN TOGGLE ACTIVE / INACTIVE
exports.toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      message: coupon.isActive ? "Activated" : "Deactivated"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
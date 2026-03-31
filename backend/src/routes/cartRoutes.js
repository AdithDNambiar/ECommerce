const express = require("express");
const router = express.Router();
const cart = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// 🔐 All require login
router.post("/add", protect, cart.addToCart);
router.get("/", protect, cart.getCart);
router.put("/update", protect, cart.updateQuantity);
router.delete("/remove", protect, cart.removeItem);

module.exports = router;
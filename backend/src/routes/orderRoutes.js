const express = require("express");
const router = express.Router();
const order = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
router.post("/checkout", protect, order.checkout);
router.post("/create", protect, order.createOrder);
router.post("/verify", protect, order.verifyPayment);
router.get("/my", protect, order.getMyOrders);

router.put("/cancel/:id", protect, order.cancelOrder);

router.put("/admin/status/:id", protect, adminOnly, order.updateOrderStatus);

router.get("/:id", protect, order.getOrderById);
router.post("/webhook/razorpay", order.razorpayWebhook);

// admin
router.get("/admin/all", protect, adminOnly, order.getAllOrders);

module.exports = router;
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/checkout", protect, orderController.checkout);
router.post("/verify", protect, orderController.verifyPayment);

router.get("/my", protect, orderController.getMyOrders);
router.get("/:id", protect, orderController.getOrderById);
router.put("/cancel/:id", protect, orderController.cancelOrder);

router.get("/admin/all", protect, adminOnly, orderController.getAllOrdersAdmin);
router.put("/admin/status/:id", protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;
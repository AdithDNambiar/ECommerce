const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, notificationController.getAdminNotifications);
router.put("/:id/read", protect, adminOnly, notificationController.markAsRead);

module.exports = router;
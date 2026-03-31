const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const admin = require("../controllers/adminController");

router.get("/dashboard", protect, adminOnly, admin.dashboard);

module.exports = router;
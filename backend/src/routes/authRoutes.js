const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/admin/login", auth.adminLogin);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.get("/me", protect, auth.me);

module.exports = router;
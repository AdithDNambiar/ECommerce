const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const address = require("../controllers/addressController");

router.post("/", protect, address.addAddress);
router.get("/", protect, address.getAddresses);
router.delete("/:id", protect, address.deleteAddress);

module.exports = router;
const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const review = require("../controllers/reviewController");

router.post("/", protect, review.addReview);
router.get("/:productId", review.getProductReviews);

module.exports = router;

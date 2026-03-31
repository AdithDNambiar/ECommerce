const Review = require("../models/Review");
const Order = require("../models/Order");

// ADD / EDIT REVIEW
exports.addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  const deliveredOrder = await Order.findOne({
    user: req.user.id,
    status: "delivered",
    "items.product": productId
  });

  if (!deliveredOrder) {
    return res.status(400).json({ message: "Not eligible" });
  }

  let review = await Review.findOne({
    user: req.user.id,
    product: productId
  });

  if (review) {
    review.rating = rating;
    review.comment = comment;
    await review.save();
  } else {
    review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment
    });
  }

  // ⭐ UPDATE PRODUCT RATING
const Product = require("../models/Product");

const reviews = await Review.find({ product: productId });

const avg =
  reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

await Product.findByIdAndUpdate(productId, {
  rating: avg,
  numReviews: reviews.length
});

res.json(review);
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
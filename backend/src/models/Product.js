const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  price: Number,
  discount: { type: Number, default: 0 },
  stock: Number,
  images: [String],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
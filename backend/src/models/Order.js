const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number
    }
  ],

  totalAmount: Number,

  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  address: {
  name: String,
  phone: String,
  addressLine: String,
  city: String,
  state: String,
  pincode: String
},

  razorpayOrderId: String,
razorpayPaymentId: String,

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
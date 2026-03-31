const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ["flat", "percent"],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  minOrder: {
    type: Number,
    default: 0
  },
  usageLimit: {
    type: Number,
    default: 1
  },
  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  expiry: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedCount: {
     type: Number,
      default: 0
  },
  isActive: {
     type: Boolean,
     default: true
  },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
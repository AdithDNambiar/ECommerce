const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: String,
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Token", tokenSchema);
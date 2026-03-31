const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.dashboard = async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();

  const revenueData = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);

  const lowStock = await Product.find({ stock: { $lt: 5 } });

  res.json({
    totalOrders,
    totalUsers,
    totalRevenue: revenueData[0]?.total || 0,
    lowStock
  });
};
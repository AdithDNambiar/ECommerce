const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const notificationRoutes = require("./routes/notificationRoutes");

app.use(cors({
  origin:true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/address", require("./routes/addressRoutes"));
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/orders/webhook/razorpay", express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

module.exports = app;
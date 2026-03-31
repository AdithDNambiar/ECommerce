const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

const Coupon = require("../models/Coupon");
const Address = require("../models/Address");
const mongoose = require("mongoose");

const finalizePaidOrder = async ({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  address,
  couponCode
}) => {
  const existingOrder = await Order.findOne({ razorpayPaymentId });
  if (existingOrder) {
    return existingOrder;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart empty");
    }

    let orderItems = [];
    let subtotal = 0;

    for (let item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < item.quantity) {
        throw new Error("Stock issue");
      }

      const priceAfterDiscount =
        product.price - (product.price * product.discount) / 100;

      subtotal += priceAfterDiscount * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: priceAfterDiscount
      });

      product.stock -= item.quantity;
      await product.save({ session });
    }

    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase()
      }).session(session);

      if (
        coupon &&
        coupon.isActive &&
        coupon.expiry >= new Date() &&
        !coupon.usedBy.some((id) => id.toString() === userId.toString()) &&
        subtotal >= coupon.minOrder &&
        coupon.usedCount < coupon.usageLimit
      ) {
        if (coupon.type === "flat") {
          discount = coupon.value;
        } else {
          discount = (subtotal * coupon.value) / 100;
        }

        coupon.usedBy.push(userId);
        coupon.usedCount += 1;
        await coupon.save({ session });
      }
    }

    const finalTotal = subtotal - discount;

    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          totalAmount: finalTotal,
          status: "pending",
          paymentStatus: "paid",
          razorpayOrderId,
          razorpayPaymentId,
          address
        }
      ],
      { session }
    );

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
exports.checkout = async (req, res) => {
  try {
    const { addressId, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    const addressDoc = await Address.findById(addressId);

    if (!addressDoc) {
      return res.status(400).json({ message: "Invalid address" });
    }

    let subtotal = 0;

    for (let item of cart.items) {
      const product = item.product;

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: "Stock issue" });
      }

      const priceAfterDiscount =
        product.price - (product.price * product.discount) / 100;

      subtotal += priceAfterDiscount * item.quantity;
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

  if (!coupon || !coupon.isActive) {
    return res.status(400).json({ message: "Invalid coupon" });
  }

  if (coupon.expiry < new Date()) {
    return res.status(400).json({ message: "Expired coupon" });
  }

  if (coupon.usedBy.includes(req.user.id)) {
    return res.status(400).json({ message: "Already used" });
  }

  if (subtotal < coupon.minOrder) {
    return res.status(400).json({ message: "Minimum not met" });
  }

  // 🔥 USAGE LIMIT CHECK
  if (coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ message: "Coupon usage limit reached" });
  }

  if (coupon.type === "flat") {
    discount = coupon.value;
  } else {
    discount = (subtotal * coupon.value) / 100;
  }

  appliedCoupon = coupon.code;
}

    const finalTotal = subtotal - discount;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalTotal * 100),
      currency: "INR"
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      subtotal,
      discount,
      finalTotal,
      couponCode: appliedCoupon,
      address: {
        name: addressDoc.name,
        phone: addressDoc.phone,
        addressLine: addressDoc.addressLine,
        city: addressDoc.city,
        state: addressDoc.state,
        pincode: addressDoc.pincode
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    let orderItems = [];
    let total = 0;

    for (let item of cart.items) {
      const product = item.product;

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: "Stock issue" });
      }

      const priceAfterDiscount =
        product.price - (product.price * product.discount) / 100;

      total += priceAfterDiscount * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: priceAfterDiscount
      });

      // 🔥 Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: total,
      address: req.body.address,
      paymentStatus: "paid"
      
    });

    // 🔥 Clear cart
    cart.items = [];
    await cart.save();

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
      couponCode
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET.trim())
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment" });
    }

    const order = await finalizePaidOrder({
      userId: req.user.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      address,
      couponCode
    });

    res.json({
      message: "Payment verified & order created",
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(orders);
};

// CANCEL ORDER
exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status !== "pending") {
    return res.status(400).json({ message: "Cannot cancel" });
  }

  // restore stock
  for (let item of order.items) {
    const product = item.product;
    product.stock += item.quantity;
    await product.save();
  }

  order.status = "cancelled";
  await order.save();

  res.json({ message: "Order cancelled" });
};

// ADMIN UPDATE STATUS
exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  order.status = req.body.status;
  await order.save();

  res.json(order);
};
exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  res.json({ message: "Status updated" });
};
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
};

exports.razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
      const notes = payment.notes || {};

      await finalizePaidOrder({
        userId: notes.userId,
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        address: notes.address ? JSON.parse(notes.address) : {},
        couponCode: notes.couponCode || ""
      });
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
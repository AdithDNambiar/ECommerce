const crypto = require("crypto");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Address = require("../models/Address");
const Notification = require("../models/Notification");

exports.checkout = async (req, res) => {
  try {
    const { addressId, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({ message: "Product not found in cart" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} left`
        });
      }

      const discountedPrice =
        product.price - (product.price * product.discount) / 100;

      subtotal += discountedPrice * item.quantity;
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true
      });

      if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon" });
      }

      if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
        return res.status(400).json({ message: "Coupon expired" });
      }

      if (coupon.minOrder && subtotal < coupon.minOrder) {
        return res.status(400).json({
          message: `Minimum order should be ₹${coupon.minOrder}`
        });
      }

      if (coupon.usageLimit <= coupon.usedCount) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      const alreadyUsed = coupon.usedBy.some(
        (id) => id.toString() === req.user.id
      );

      if (alreadyUsed) {
        return res.status(400).json({ message: "You already used this coupon" });
      }

      if (coupon.type === "percent") {
        discount = (subtotal * coupon.value) / 100;
      } else if (coupon.type === "flat") {
        discount = coupon.value;
      }

      if (discount > subtotal) {
        discount = subtotal;
      }

      appliedCoupon = coupon;
    }

    const finalTotal = subtotal - discount;

    const razorpay = require("../config/razorpay");

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalTotal * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    res.json({
      subtotal,
      discount,
      finalTotal,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      address
    });
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

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment" });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      const discountedPrice =
        product.price - (product.price * product.discount) / 100;

      subtotal += discountedPrice * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: discountedPrice
      });
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true
      });

      if (coupon) {
        const alreadyUsed = coupon.usedBy.some(
          (id) => id.toString() === req.user.id
        );

        if (!alreadyUsed) {
          if (coupon.type === "percent") {
            discount = (subtotal * coupon.value) / 100;
          } else if (coupon.type === "flat") {
            discount = coupon.value;
          }

          if (discount > subtotal) {
            discount = subtotal;
          }

          coupon.usedCount += 1;
          coupon.usedBy.push(req.user.id);
          await coupon.save();

          appliedCoupon = coupon;
        }
      }
    }

    const finalTotal = subtotal - discount;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: finalTotal,
      subtotal,
      discount,
      coupon: appliedCoupon ? appliedCoupon.code : null,
      address,
      paymentStatus: "paid",
      status: "pending",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    await Notification.create({
      title: "New order placed",
      message: `A new order has been placed. Order ID: ${order._id}`,
      type: "order",
      isRead: false
    });

    cart.items = [];
    await cart.save();

    res.json({
      message: "Payment verified and order created",
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json({ message: "Order cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
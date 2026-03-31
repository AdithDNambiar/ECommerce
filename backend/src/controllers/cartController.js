const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ✅ ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        const newQty = cart.items[itemIndex].quantity + quantity;

        if (newQty > product.stock) {
          return res.status(400).json({ message: "Stock limit reached" });
        }

        cart.items[itemIndex].quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ GET CART
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.json({
        items: [],
        total: 0
      });
    }

    let total = 0;

    const items = cart.items.map((item) => {
      const product = item.product;
      const unitPrice =
        product.price - (product.price * product.discount) / 100;

      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        unitPrice,
        subtotal
      };
    });

    res.json({
      items,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ UPDATE QUANTITY
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product._id.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    const product = await Product.findById(productId);

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: "Stock exceeded" });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ message: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ REMOVE ITEM
exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
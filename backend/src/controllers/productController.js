const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const notDeletedFilter = {
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
};

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ecommerce" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, discount, stock } = req.body;

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      discount,
      stock,
      images: imageUrls
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort, rating } = req.query;

    let filter = { ...notDeletedFilter };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    let query = Product.find(filter);

    if (sort === "low-high") query = query.sort({ price: 1 });
    if (sort === "high-low") query = query.sort({ price: -1 });
    if (sort === "newest") query = query.sort({ createdAt: -1 });
    if (sort === "top-rated") query = query.sort({ rating: -1 });

    const products = await query;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      ...notDeletedFilter
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(404).json({ message: "Product not found" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, discount, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageUrls = product.images || [];

    if (req.files && req.files.length > 0) {
      imageUrls = [];

      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.price = price ?? product.price;
    product.discount = discount ?? product.discount;
    product.stock = stock ?? product.stock;
    product.images = imageUrls;

    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
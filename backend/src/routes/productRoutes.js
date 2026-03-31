const express = require("express");
const router = express.Router();
const product = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  product.createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  product.updateProduct
);

router.delete("/:id", protect, adminOnly, product.deleteProduct);

router.get("/", product.getProducts);
router.get("/:id", product.getProductById);

module.exports = router;
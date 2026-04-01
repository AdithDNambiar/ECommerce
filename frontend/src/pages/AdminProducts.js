import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/adminProducts.css";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    discount: "",
    stock: ""
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "",
      price: "",
      discount: "",
      stock: ""
    });
    setImages([]);
    setPreviewImages([]);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price || "",
      discount: product.discount || "",
      stock: product.stock || ""
    });
    setPreviewImages(product.images || []);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const saveProduct = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("discount", form.discount);
      formData.append("stock", form.stock);

      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }

      if (editingId) {
        await API.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Product updated");
      } else {
        await API.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Product created");
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
      alert("Product deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="admin-products-page">
      <h2>Manage Products</h2>

      <div className="admin-product-form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
        <input name="discount" placeholder="Discount %" value={form.discount} onChange={handleChange} />
        <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <input type="file" multiple onChange={handleImageChange} />

        {previewImages.length > 0 && (
          <div className="admin-image-preview-row">
            {previewImages.map((img, index) => (
              <img key={index} src={img} alt={`preview-${index}`} className="admin-image-preview" />
            ))}
          </div>
        )}

        <button onClick={saveProduct}>
          {editingId ? "Update Product" : "Add Product"}
        </button>

        {editingId && (
          <button className="cancel-btn" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </div>

      <div className="admin-product-list">
        {products.map((product) => (
          <div key={product._id} className="admin-product-card">
            <div className="admin-product-left">
              <img
                src={
                  product.images?.[0] ||
                  "https://via.placeholder.com/80x80?text=No+Image"
                }
                alt={product.name}
                className="admin-product-image"
              />

              <div className="admin-product-info">
                <p><strong>{product.name}</strong></p>
                <p>₹{product.price}</p>
                <p>Stock: {product.stock}</p>
                <p>Rating: {product.rating || 0}</p>
              </div>
            </div>

            <div className="admin-product-actions">
              <button className="edit-btn" onClick={() => editProduct(product)}>
                Edit
              </button>

              <button className="delete-btn" onClick={() => deleteProduct(product._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProducts;
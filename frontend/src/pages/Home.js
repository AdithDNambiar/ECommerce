import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaHeart } from "react-icons/fa";
import API from "../api/axios";
import "../styles/home.css";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { LoginModalContext } from "../context/LoginModalContext";
import { WishlistContext } from "../context/WishlistContext";
import Toast from "../components/Toast";

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { openLoginModal } = useContext(LoginModalContext);
  const { toggleWishlist, isWishlisted } = useContext(WishlistContext);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products?search=${search}`);
      setProducts(res.data || []);
    } catch (err) {
      setProducts([]);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 2000);
  };

  const addToCart = async (id, e) => {
    e.stopPropagation();

    if (!user) {
      openLoginModal();
      return;
    }

    try {
      await API.post("/cart/add", {
        productId: id,
        quantity: 1
      });

      await fetchCartCount();
      showSuccessToast("Added to cart");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      showSuccessToast(msg);
    }
  };

  return (
    <div className="home-page">
      <Toast message={toastMessage} show={showToast} />

      <div className="home-hero">
        <h1>Discover your next favorite product</h1>
        <p>
          A premium shopping experience with curated products, smooth checkout,
          and a clean modern design.
        </p>
      </div>

      <div className="search-bar-wrap">
        <input
          className="search-bar"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="home-empty-state">
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="home-empty-state">
          <FaSearch className="home-empty-icon" />
          <h2>Nothing found</h2>
          <p>Try a different product name.</p>
        </div>
      ) : (
        <div className="products-container">
          {products.map((p) => {
            const discountedPrice =
              p.price - (p.price * p.discount) / 100;

            return (
              <div
                key={p._id}
                className="product-card"
                onClick={() => navigate(`/product/${p._id}`)}
              >
                <button
                  className={`wishlist-btn ${isWishlisted(p._id) ? "wishlisted" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p);
                  }}
                >
                  <FaHeart />
                </button>

                <img
                  src={
                    p.images && p.images.length > 0
                      ? p.images[0]
                      : "https://via.placeholder.com/250x220?text=No+Image"
                  }
                  alt={p.name}
                  className="product-image-home"
                />

                <div className="product-title">{p.name}</div>

                <div className="product-price-row">
                  <span className="product-price">₹{discountedPrice}</span>
                  {p.discount > 0 && (
                    <span className="product-old-price">₹{p.price}</span>
                  )}
                </div>

                <div className="product-stock">
                  {p.stock > 0 ? "In Stock" : "Out of Stock"}
                </div>

                <button
                  className="add-btn"
                  disabled={p.stock === 0}
                  onClick={(e) => addToCart(p._id, e)}
                >
                  {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Home;
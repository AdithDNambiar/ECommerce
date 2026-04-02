import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaBoxOpen } from "react-icons/fa";
import API from "../api/axios";
import "../styles/home.css";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { LoginModalContext } from "../context/LoginModalContext";
import { WishlistContext } from "../context/WishlistContext";
import Toast from "../components/Toast";

function Home() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartQuantities, setCartQuantities] = useState({});

  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { openLoginModal } = useContext(LoginModalContext);
  const { toggleWishlist, isWishlisted } = useContext(WishlistContext);

  const banners = [
    {
      title: "Discover your next favorite product",
      subtitle: "Premium products, smooth shopping, and a clean modern experience."
    },
    {
      title: "Style, tech, and essentials in one place",
      subtitle: "Shop curated picks with fast browsing and elegant design."
    },
    {
      title: "Find deals you’ll actually love",
      subtitle: "Discounted products, better choices, and easy checkout."
    },
    {
      title: "Built for a smarter shopping experience",
      subtitle: "Wishlist, cart, checkout, reviews, and beautiful product pages."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [banners.length]);

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

  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await API.get("/products");
      setAllProducts(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchCartData = useCallback(async () => {
    if (!user) {
      setCartQuantities({});
      return;
    }

    try {
      const res = await API.get("/cart");
      const map = {};

      (res.data.items || []).forEach((item) => {
        map[item.product._id] = item.quantity;
      });

      setCartQuantities(map);
    } catch (err) {
      console.log(err);
      setCartQuantities({});
    }
  }, [user]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    return allProducts
      .filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      )
      .slice(0, 6);
  }, [search, allProducts]);

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 2000);
  };

  const increaseCartQty = async (productId, e) => {
    e.stopPropagation();

    if (!user) {
      openLoginModal();
      return;
    }

    try {
      await API.post("/cart/add", {
        productId,
        quantity: 1
      });

      await fetchCartData();
      await fetchCartCount();
      showSuccessToast("Cart updated");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      showSuccessToast(msg);
    }
  };

  const decreaseCartQty = async (productId, e) => {
    e.stopPropagation();

    if (!user) {
      openLoginModal();
      return;
    }

    const currentQty = cartQuantities[productId] || 0;

    try {
      if (currentQty <= 1) {
        await API.delete("/cart/remove", {
          data: { productId }
        });
      } else {
        await API.put("/cart/update", {
          productId,
          quantity: currentQty - 1
        });
      }

      await fetchCartData();
      await fetchCartCount();
      showSuccessToast("Cart updated");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      showSuccessToast(msg);
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setSearch("");
    navigate(`/product/${productId}`);
  };

  return (
    <div className="home-page">
      <Toast message={toastMessage} show={showToast} />

      <div className="home-banner-slider">
        <div
          className="home-banner-track"
          style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div className="home-banner-slide" key={index}>
              <div className="home-hero">
                <h1>{banner.title}</h1>
                <p>{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="search-toolbar">
        <div className="search-autocomplete-wrap">
          <input
            className="search-bar"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions-box">
              {suggestions.map((item) => (
                <div
                  key={item._id}
                  className="search-suggestion-item"
                  onClick={() => handleSuggestionClick(item._id)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="home-empty-state">
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="home-empty-state">
          <FaBoxOpen className="home-empty-icon" />
          <h2>No products found</h2>
          <p>Try another keyword.</p>
        </div>
      ) : (
        <div className="products-container">
          {products.map((p) => {
            const discountedPrice =
              p.price - (p.price * p.discount) / 100;

            const currentQty = cartQuantities[p._id]+1 || 1;

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

                <div className="home-card-actions">
                  <div className="home-qty-box">
                    <button onClick={(e) => decreaseCartQty(p._id, e)}>-</button>
                    <span>{currentQty}</span>
                    <button
                      onClick={(e) => increaseCartQty(p._id, e)}
                      disabled={p.stock === 0}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="add-btn"
                    disabled={p.stock === 0}
                    onClick={(e) => increaseCartQty(p._id, e)}
                  >
                    {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Home;
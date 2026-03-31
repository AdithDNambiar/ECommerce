import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/home.css";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import Toast from "../components/Toast";

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async () => {
    try {
      const res = await API.get(`/products?search=${search}`);
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

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
  navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
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
      const msg = err.response?.data?.message || "";

      if (
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        msg.toLowerCase().includes("token")
      ) {
        navigate("/login");
        return;
      }

      showSuccessToast(msg || "Something went wrong");
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
    </div>
  );
}

export default Home;
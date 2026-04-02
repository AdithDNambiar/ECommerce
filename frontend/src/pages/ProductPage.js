import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaBolt, FaTruck, FaShieldAlt } from "react-icons/fa";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { LoginModalContext } from "../context/LoginModalContext";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import "../styles/product.css";
import Toast from "../components/Toast";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { openLoginModal } = useContext(LoginModalContext);
  const { toggleWishlist, isWishlisted } = useContext(WishlistContext);
  const { fetchCartCount } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [pageError, setPageError] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [cartQty, setCartQty] = useState(0);

  const fetchProduct = useCallback(async () => {
    try {
      setPageError("");
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setActiveImage(
        res.data?.images?.length > 0
          ? res.data.images[0]
          : "https://via.placeholder.com/400x400?text=No+Image"
      );
    } catch (err) {
      setPageError(err.response?.data?.message || "Product not found");
      setProduct(null);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await API.get(`/reviews/${id}`);
      setReviews(res.data || []);
    } catch (err) {
      setReviews([]);
      console.log(err);
    }
  }, [id]);

  const fetchCartQty = useCallback(async () => {
    if (!user) {
      setCartQty(0);
      return;
    }

    try {
      const res = await API.get("/cart");
      const found = (res.data.items || []).find(
        (item) => item.product._id === id
      );
      setCartQty(found ? found.quantity : 0);
    } catch (err) {
      setCartQty(0);
      console.log(err);
    }
  }, [id, user]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [fetchProduct, fetchReviews]);

  useEffect(() => {
    fetchCartQty();
  }, [fetchCartQty]);

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 2000);
  };

  const increaseCartQty = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    try {
      await API.post("/cart/add", {
        productId: product._id,
        quantity: 1
      });

      await fetchCartQty();
      await fetchCartCount();
      showSuccessToast("Cart updated");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      showSuccessToast(msg);
    }
  };

  const decreaseCartQty = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    try {
      if (cartQty <= 1) {
        await API.delete("/cart/remove", {
          data: { productId: product._id }
        });
      } else {
        await API.put("/cart/update", {
          productId: product._id,
          quantity: cartQty - 1
        });
      }

      await fetchCartQty();
      await fetchCartCount();
      showSuccessToast("Cart updated");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      showSuccessToast(msg);
    }
  };

  const submitReview = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    try {
      setReviewError("");

      await API.post("/reviews", {
        productId: id,
        rating: Number(rating),
        comment
      });

      showSuccessToast("Review submitted");
      setComment("");
      setRating(5);
      setHoveredRating(0);

      fetchReviews();
      fetchProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Error");
    }
  };

  if (pageError) {
    return (
      <div className="product-page-wrapper">
        <div className="product-error-box">
          <h2>Product not available</h2>
          <p>{pageError}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="product-page-wrapper">Loading...</div>;
  }

  const discountedPrice =
    product.price - (product.price * product.discount) / 100;

  return (
    <div className="product-page-wrapper">
      <Toast message={toastMessage} show={showToast} />

      <div className="product-page">
        <div className="product-image-box">
          <div className="product-image-top-actions">
            <button
              className={`wishlist-btn product-wishlist-btn ${isWishlisted(product._id) ? "wishlisted" : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              <FaHeart />
            </button>
          </div>

          <img
            src={activeImage}
            alt={product.name}
            className="product-main-image"
          />

          {product.images && product.images.length > 1 && (
            <div className="product-thumb-row">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`thumb-${index}`}
                  className={`product-thumb ${
                    activeImage === img ? "product-thumb-active" : ""
                  }`}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-details">
          <span className="product-detail-badge">
            {product.category || "Featured"}
          </span>

          <h2>{product.name}</h2>
          <p>{product.description}</p>

          <div className="price-row">
            <span className="price">₹{discountedPrice}</span>
            {product.discount > 0 && (
              <span className="old-price">₹{product.price}</span>
            )}
            {product.discount > 0 && (
              <span className="discount-chip">{product.discount}% OFF</span>
            )}
          </div>

          <div className="stock">
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </div>

          <div className="rating-text">
            Rating: {product.rating || 0} ({product.numReviews || 0} reviews)
          </div>

          <div className="product-detail-qty">
            <button onClick={decreaseCartQty}>-</button>
            <span>{cartQty}</span>
            <button onClick={increaseCartQty} disabled={product.stock === 0}>+</button>
          </div>

          <button
            className="buy-btn"
            disabled={product.stock === 0}
            onClick={increaseCartQty}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          <div className="product-feature-boxes">
            <div className="product-feature-item">
              <FaBolt />
              <span>Fast checkout</span>
            </div>
            <div className="product-feature-item">
              <FaTruck />
              <span>Quick delivery</span>
            </div>
            <div className="product-feature-item">
              <FaShieldAlt />
              <span>Secure shopping</span>
            </div>
          </div>
        </div>
      </div>

      <div className="review-section">
        <h3>Reviews</h3>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="review-card">
              <p><strong>{r.user?.name || "User"}</strong></p>
              <p>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              <p>{r.comment}</p>
            </div>
          ))
        )}

        <div className="review-form">
          <h4>Write a Review</h4>

          {reviewError && <p className="review-error">{reviewError}</p>}

          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= (hoveredRating || rating)
                    ? "star filled-star"
                    : "star"
                }
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button className="buy-btn" onClick={submitReview}>
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/product.css";
import Toast from "../components/Toast";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await API.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [fetchProduct, fetchReviews]);

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 2000);
  };

  const addToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    try {
      await API.post("/cart/add", {
        productId: product._id,
        quantity: 1
      });

      showSuccessToast("Added to cart");
    } catch (err) {
      const msg = err.response?.data?.message || "";

      if (
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        msg.toLowerCase().includes("token")
      ) {
        navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
        return;
      }

      showSuccessToast(msg || "Something went wrong");
    }
  };

  const submitReview = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
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
      const msg = err.response?.data?.message || "Error";

      if (
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        msg.toLowerCase().includes("token")
      ) {
        navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
        return;
      }

      setReviewError(msg);
    }
  };

  if (!product) return <div>Loading...</div>;

  const discountedPrice =
    product.price - (product.price * product.discount) / 100;

  return (
    <div className="product-page-wrapper">
      <Toast message={toastMessage} show={showToast} />

      <div className="product-page">
        <div className="product-image-box">
          <img
            src={
              product.images && product.images.length > 0
                ? product.images[0]
                : "https://via.placeholder.com/400x400?text=No+Image"
            }
            alt={product.name}
            className="product-main-image"
          />
        </div>

        <div className="product-details">
          <h2>{product.name}</h2>
          <p>{product.description}</p>

          <div className="price-row">
            <span className="price">₹{discountedPrice}</span>
            {product.discount > 0 && (
              <span className="old-price">₹{product.price}</span>
            )}
          </div>

          <div className="stock">
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </div>

          <div className="rating-text">
            Rating: {product.rating || 0} ({product.numReviews || 0} reviews)
          </div>

          <button
            className="buy-btn"
            disabled={product.stock === 0}
            onClick={addToCart}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
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

          {reviewError && (
            <p className="review-error">{reviewError}</p>
          )}

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
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import "../styles/wishlist.css";

function Wishlist() {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  return (
    <div className="wishlist-page">
      <h1>Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <h2>No wishlist items yet</h2>
          <p>Save products you like and find them here.</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="wishlist-card"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img
                src={
                  product.images?.[0] ||
                  "https://via.placeholder.com/250x220?text=No+Image"
                }
                alt={product.name}
                className="wishlist-image"
              />

              <h3>{product.name}</h3>
              <p>₹{product.price}</p>

              <button
                className="wishlist-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
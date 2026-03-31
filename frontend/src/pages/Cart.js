import React, { useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "../styles/cart.css";

function Cart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await API.put("/cart/update", {
        productId,
        quantity
      });
      await fetchCart();
      await fetchCartCount();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const removeItem = async (productId) => {
    try {
      await API.delete("/cart/remove", {
        data: { productId }
      });
      await fetchCart();
      await fetchCartCount();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const checkout = () => {
    navigate("/checkout");
  };

  if (!cart) return <div className="cart-loading">Loading...</div>;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <h1>Your Cart</h1>
          <p>Review your items before checkout</p>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add some products and come back here.</p>
          <button className="cart-shop-btn" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-panel">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item-card">
                <div className="cart-item-left">
                  <img
                    src={
                      item.product.images && item.product.images.length > 0
                        ? item.product.images[0]
                        : "https://via.placeholder.com/120x120?text=No+Image"
                    }
                    alt={item.product.name}
                    className="cart-item-image"
                  />

                  <div className="cart-item-info">
                    <h3>{item.product.name}</h3>
                    <p className="cart-unit-price">
                      Unit Price: ₹{item.unitPrice}
                    </p>

                    <div className="cart-qty-row">
                      <span className="qty-label">Quantity</span>

                      <div className="qty-controls">
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-right">
                  <span className="cart-subtotal-label">Subtotal</span>
                  <span className="cart-subtotal-value">₹{item.subtotal}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-panel">
            <div className="cart-summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items</span>
                <span>{cart.items.length}</span>
              </div>

              <div className="summary-row">
                <span>Grand Total</span>
                <span className="summary-total">₹{cart.total}</span>
              </div>

              <button className="checkout-btn" onClick={checkout}>
                Proceed to Checkout
              </button>

              <button
                className="continue-btn"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
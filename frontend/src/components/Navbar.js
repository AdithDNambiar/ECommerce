import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaShoppingCart,
  FaCreditCard,
  FaBoxOpen,
  FaSignInAlt,
  FaUserShield,
  FaTags,
  FaClipboardList,
  FaSignOutAlt,
  FaBox,
  FaHeart
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { LoginModalContext } from "../context/LoginModalContext";
import "../styles/navbar.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { openLoginModal } = useContext(LoginModalContext);

  const isAdmin = user?.role === "admin";

  return (
    <div className="navbar">
      <div className="navbar-brand">ShopX</div>

      <div className="nav-icons">
        <Link to="/" className="nav-icon" title="Home">
          <FaHome />
        </Link>

        <Link to="/wishlist" className="nav-icon" title="Wishlist">
          <FaHeart />
        </Link>

        <Link to="/cart" className="nav-icon" title={`Cart (${cartCount})`}>
          <div className="icon-badge-wrap">
            <FaShoppingCart />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </div>
        </Link>

        <Link to="/checkout" className="nav-icon" title="Checkout">
          <FaCreditCard />
        </Link>

        <Link to="/orders" className="nav-icon" title="Orders">
          <FaBoxOpen />
        </Link>

        {!user && (
          <button className="nav-icon nav-logout-btn" title="Login" onClick={openLoginModal}>
            <FaSignInAlt />
          </button>
        )}

        {isAdmin && (
          <>
            <Link to="/admin" className="nav-icon" title="Admin Dashboard">
              <FaUserShield />
            </Link>

            <Link to="/admin/products" className="nav-icon" title="Products">
              <FaBox />
            </Link>

            <Link to="/admin/orders" className="nav-icon" title="Manage Orders">
              <FaClipboardList />
            </Link>

            <Link to="/admin/coupons" className="nav-icon" title="Coupons">
              <FaTags />
            </Link>
          </>
        )}

        {user && (
          <button className="nav-icon nav-logout-btn" title="Logout" onClick={logout}>
            <FaSignOutAlt />
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
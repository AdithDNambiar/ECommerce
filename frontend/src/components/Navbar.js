import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  FaHeart,
  FaBell
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { LoginModalContext } from "../context/LoginModalContext";
import ConfirmLogoutModal from "./ConfirmLogoutModal";
import API from "../api/axios";
import "../styles/navbar.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { openLoginModal } = useContext(LoginModalContext);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);
  const [showNotificationBox, setShowNotificationBox] = useState(false);

  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;

    fetchLatestNotification();

    const interval = setInterval(() => {
      fetchLatestNotification();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchLatestNotification = async () => {
    try {
      const res = await API.get("/notifications");
      const unread = (res.data || []).filter((n) => !n.isRead);

      if (unread.length > 0) {
        setLatestNotification(unread[0]);
      } else {
        setLatestNotification(null);
        setShowNotificationBox(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleReadNotification = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setLatestNotification(null);
      setShowNotificationBox(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          ShopX
        </div>

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
            <button
              className="nav-icon nav-logout-btn"
              title="Login"
              onClick={openLoginModal}
            >
              <FaSignInAlt />
            </button>
          )}

          {isAdmin && (
            <>
              <div className="nav-icon notification-wrapper" title="Notifications">
                <div onClick={() => setShowNotificationBox(!showNotificationBox)}>
                  <div className="icon-badge-wrap">
                    <FaBell />
                    {latestNotification && <span className="icon-badge">1</span>}
                  </div>
                </div>

                {showNotificationBox && latestNotification && (
                  <div className="notification-dropdown">
                    <h4>Notification</h4>

                    <div className="notification-item unread">
                      <strong>{latestNotification.title}</strong>
                      <p>{latestNotification.message}</p>

                      <button
                        className="mark-read-btn"
                        onClick={() => handleReadNotification(latestNotification._id)}
                      >
                        Mark as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
            <button
              className="nav-icon nav-logout-btn"
              title="Logout"
              onClick={() => setShowLogoutModal(true)}
            >
              <FaSignOutAlt />
            </button>
          )}
        </div>
      </div>

      <ConfirmLogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

export default Navbar;
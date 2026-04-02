import React from "react";
import "../styles/confirmLogoutModal.css";

function ConfirmLogoutModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="confirm-logout-overlay" onClick={onClose}>
      <div
        className="confirm-logout-box"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Logout</h3>
        <p>Are you sure you want to logout?</p>

        <div className="confirm-logout-actions">
          <button className="confirm-no-btn" onClick={onClose}>
            No
          </button>
          <button className="confirm-yes-btn" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmLogoutModal;
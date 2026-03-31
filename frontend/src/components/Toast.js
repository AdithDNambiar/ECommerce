import React from "react";
import "../styles/toast.css";

function Toast({ message, show }) {
  if (!show) return null;

  return (
    <div className="toast-box">
      {message}
    </div>
  );
}

export default Toast;
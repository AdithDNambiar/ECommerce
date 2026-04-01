import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { LoginModalContext } from "../context/LoginModalContext";
import "../styles/loginModal.css";

function LoginModal() {
  const { login, user } = useContext(AuthContext);
  const { isLoginOpen, closeLoginModal } = useContext(LoginModalContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user && isLoginOpen) {
      closeLoginModal();
    }
  }, [user, isLoginOpen, closeLoginModal]);

  if (!isLoginOpen) return null;

  const handleLogin = async () => {
    try {
      await login(email, password);
      closeLoginModal();
      setEmail("");
      setPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-modal-overlay" onClick={closeLoginModal}>
      <div className="login-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={closeLoginModal}>
          ×
        </button>

        <h2>Login</h2>

        <input
          className="login-modal-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-modal-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-modal-btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
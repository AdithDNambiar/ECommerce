import React, { useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { LoginModalContext } from "../context/LoginModalContext";
import "../styles/loginModal.css";

function LoginModal() {
  const { login, user } = useContext(AuthContext);
  const { isLoginOpen, closeLoginModal } = useContext(LoginModalContext);

  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user && isLoginOpen) {
      closeLoginModal();
      resetFields();
      setMode("login");
    }
  }, [user, isLoginOpen, closeLoginModal]);

  const resetFields = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  if (!isLoginOpen) return null;

  const handleLogin = async () => {
    try {
      await login(email, password);
      closeLoginModal();
      resetFields();
      setMode("login");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async () => {
    try {
      await API.post("/auth/register", {
        name,
        email,
        password
      });

      await login(email, password);
      closeLoginModal();
      resetFields();
      setMode("login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="login-modal-overlay" onClick={closeLoginModal}>
      <div className="login-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={closeLoginModal}>
          ×
        </button>

        <div className="login-modal-switch">
          <button
            className={mode === "login" ? "login-switch-btn active-switch" : "login-switch-btn"}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={mode === "signup" ? "login-switch-btn active-switch" : "login-switch-btn"}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>

        {mode === "signup" && (
          <input
            className="login-modal-input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

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

        {mode === "login" ? (
          <button className="login-modal-btn" onClick={handleLogin}>
            Login
          </button>
        ) : (
          <button className="login-modal-btn" onClick={handleSignup}>
            Create Account
          </button>
        )}

        <p className="login-modal-footer-text">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <span
                className="login-modal-link"
                onClick={() => setMode("signup")}
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="login-modal-link"
                onClick={() => setMode("login")}
              >
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
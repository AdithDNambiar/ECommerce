import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LoginModalProvider } from "./context/LoginModalContext";
import { WishlistProvider } from "./context/WishlistContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <CartProvider>
      <LoginModalProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </LoginModalProvider>
    </CartProvider>
  </AuthProvider>
);
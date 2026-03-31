import { createContext, useEffect, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = async () => {
    try {
      await API.post("/auth/refresh");
      const res = await API.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    await API.post("/auth/login", { email, password });
    const res = await API.get("/auth/me");
    setUser(res.data.user);
  };

  const adminLogin = async (email, password) => {
    await API.post("/auth/admin/login", { email, password });
    const res = await API.get("/auth/me");
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, adminLogin, logout, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
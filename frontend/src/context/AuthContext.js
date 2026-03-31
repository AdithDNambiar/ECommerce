import { createContext, useEffect, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const res = await API.get("/auth/me");
        if (mounted) {
          setUser(res.data.user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
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
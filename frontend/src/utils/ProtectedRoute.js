import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" state={{ from: location }} />;
};

export default ProtectedRoute;
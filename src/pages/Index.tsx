
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  useEffect(() => {
    document.title = "PhotoCanvas - Upload & Manage Photos";
  }, []);

  // Check if user is logged in and redirect accordingly
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
};

export default Index;

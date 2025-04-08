
import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams] = useSearchParams();
  const guestParam = searchParams.get('guest');
  
  useEffect(() => {
    document.title = "PhotoCanvas - Upload & Manage Photos";
    
    // Handle guest mode parameter
    if (guestParam === 'true') {
      localStorage.setItem('userMode', 'guest');
      localStorage.setItem('isLoggedIn', 'true');
    }
  }, [guestParam]);

  // Check if user is logged in and redirect accordingly
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  // If they're coming in as a guest via URL parameter, send them to the home page
  if (guestParam === 'true') {
    return <Navigate to="/" replace />;
  }
  
  return isLoggedIn ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
};

export default Index;

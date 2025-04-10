import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileImage, Files, Home, Upload, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      const userMode = localStorage.getItem("userMode");
      
      setIsLoggedIn(loginStatus);
      setIsGuest(userMode === "guest");
    };
    
    checkLoginStatus();
    
    // Add event listener for storage changes
    window.addEventListener("storage", checkLoginStatus);
    
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userMode");
    window.location.href = "/login";
  };

  // Don't show navbar on login, signup, and reset-password pages
  if (["/login", "/signup", "/reset-password", "/index"].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-10 border-b bg-background shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <FileImage className="h-6 w-6 text-brand-500" />
            <span>Govigyan-CloudBase</span>
          </Link>
        </div>
        
        {isLoggedIn && (
          <div className="flex space-x-1">
            <Button variant="ghost" asChild className="flex items-center gap-2">
              <Link to="/" className={location.pathname === "/" ? "text-brand-600" : ""}>
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="flex items-center gap-2">
              <Link to="/upload" className={location.pathname === "/upload" ? "text-brand-600" : ""}>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="flex items-center gap-2">
              <Link to="/all-files" className={location.pathname === "/all-files" ? "text-brand-600" : ""}>
                <Files className="h-4 w-4" />
                <span className="hidden sm:inline">All Files</span>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="flex items-center gap-2">
              <Link to="/spreadsheets" className={location.pathname === "/spreadsheets" ? "text-brand-600" : ""}>
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Spreadsheets</span>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="flex items-center gap-2">
              <Link to="/profile" className={location.pathname === "/profile" ? "text-brand-600" : ""}>
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </Button>
            
            <Link to="/saved-csvs" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Saved CSVs</span>
            </Link>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isLoggedIn && (
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="hidden sm:flex"
            >
              {isGuest ? "Exit Guest Mode" : "Logout"}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

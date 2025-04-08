
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ImageIcon, LogOut } from "lucide-react";

const Navbar = () => {
  const handleLogout = () => {
    // In a real app, this would handle logout logic
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/login";
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-700">
          <ImageIcon className="h-6 w-6 text-brand-500" />
          <span>PhotoCanvas</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/gallery">
            <Button variant="ghost">My Gallery</Button>
          </Link>
          <Link to="/upload">
            <Button>Upload Photo</Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

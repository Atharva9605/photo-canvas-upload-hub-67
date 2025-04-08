
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ImageIcon, 
  LogOut, 
  User,
  Settings,
  Upload as UploadIcon,
  GalleryHorizontal,
  Menu,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    // In a real app, this would handle logout logic
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userMode");
    window.location.href = "/login";
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-background"
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-700">
          <ImageIcon className="h-6 w-6 text-brand-500" />
          <span>PhotoCanvas</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/gallery">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <GalleryHorizontal className="h-4 w-4" />
              Gallery
            </Button>
          </Link>
          <Link to="/upload">
            <Button size="sm" className="flex items-center gap-1">
              <UploadIcon className="h-4 w-4" />
              Upload
            </Button>
          </Link>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1"
              >
                <User className="h-4 w-4" />
                Profile
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex w-full cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile?tab=settings" className="flex w-full cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex cursor-pointer items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-9 w-9 rounded-full p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col space-y-3">
            <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <GalleryHorizontal className="mr-2 h-4 w-4" />
                Gallery
              </Button>
            </Link>
            <Link to="/upload" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </Link>
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

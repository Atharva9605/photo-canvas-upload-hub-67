
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, X } from "lucide-react";

const GuestBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isGuest = localStorage.getItem("userMode") === "guest";
  
  useEffect(() => {
    // Check if user is in guest mode
    if (!isGuest) {
      setIsVisible(false);
    }
  }, [isGuest]);
  
  if (!isVisible) return null;
  
  return (
    <div className="relative bg-primary/10 px-4 py-3 text-center text-sm">
      <button 
        className="absolute right-2 top-2 rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </button>
      <p className="mb-2">
        You're using <strong>Guest Mode</strong> with limited features. 
        Sign in to access your upload history and more.
      </p>
      <Button size="sm" variant="outline" asChild>
        <Link to="/login" className="inline-flex items-center">
          <LogIn className="mr-1 h-4 w-4" />
          Sign In
        </Link>
      </Button>
    </div>
  );
};

export default GuestBanner;

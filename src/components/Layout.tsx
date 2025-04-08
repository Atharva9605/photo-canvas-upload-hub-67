
import { ReactNode } from "react";
import Navbar from "./Navbar";
import GuestBanner from "./GuestBanner";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <GuestBanner />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto flex items-center justify-between px-4">
          <p>© {new Date().getFullYear()} PhotoCanvas. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

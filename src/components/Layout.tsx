
import { ReactNode } from "react";
import Navbar from "./Navbar";
import GuestBanner from "./GuestBanner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <GuestBanner />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} PhotoCanvas. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

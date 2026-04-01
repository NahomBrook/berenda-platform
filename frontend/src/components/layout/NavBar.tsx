// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { Globe, User, MessageCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onSearchClick?: () => void;
  showSearchButton?: boolean;
}

export default function Navbar({ onSearchClick, showSearchButton = false }: NavbarProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check for authenticated user on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : { fullName: "User" });
      fetchUnreadCount();
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Poll for unread messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const handleHostClick = () => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/auth/login");
    else router.push("/properties/host"); 
  };

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    }
  };

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-sm sticky top-0 z-40 transition-all duration-300">
      {/* Left: Logo */}
      <div
        className="flex items-center gap-2 font-bold text-xl cursor-pointer"
        onClick={() => router.push("/")}
      >
        <div className="w-8 h-8 bg-red-600 rounded-full" />
        <span>Berenda</span>
      </div>

      {/* Center: Nav Links */}
      <div className="hidden md:flex gap-6 font-medium text-gray-700">
        <span 
          className="cursor-pointer hover:text-gray-900 transition-colors" 
          onClick={() => router.push("/")}
        >
          Home
        </span>
        
        {/* Search Link - Appears when scrolled */}
        {showSearchButton && (
          <span 
            className="cursor-pointer hover:text-red-600 transition-colors flex items-center gap-1 animate-fadeIn"
            onClick={handleSearchClick}
          >
            <Search className="w-4 h-4" />
            Search
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 relative">
        {/* Search Button - Mobile */}
        {showSearchButton && (
          <button
            onClick={handleSearchClick}
            className="md:hidden p-1 hover:bg-gray-100 rounded-full transition"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Host Button */}
        <span
          className="hidden md:block cursor-pointer hover:text-gray-900 transition-colors"
          onClick={handleHostClick}
        >
          Host a berenda
        </span>

        {/* Chat Button */}
        <button
          onClick={() => router.push("/chat")}
          className="relative p-1 hover:bg-gray-100 rounded-full transition"
        >
          <MessageCircle className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile / Auth Dropdown */}
        <div
          className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-medium cursor-pointer hover:bg-red-700 transition-colors"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {user ? user.fullName[0].toUpperCase() : <User className="w-5 h-5" />}
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 top-12 bg-white border shadow-md rounded-md w-40 flex flex-col z-50 animate-slideDown">
            {!user ? (
              <>
                <button
                  className="px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  onClick={() => router.push("/auth/register")}
                >
                  Register
                </button>
                <button
                  className="px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  onClick={() => router.push("/auth/login")}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  onClick={() => router.push("/profile")}
                >
                  Profile
                </button>
                <button
                  className="px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
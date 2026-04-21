import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-dark border-b border-dark-border sticky top-0 z-50" style={{backgroundColor: "#0f0f0f"}}>
      <div className="px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-white font-bold text-xl">
            GrandTix
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className="text-gray-400 hover:text-white transition">
                  My Bookings
                </Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className="text-gray-400 hover:text-white transition">
                    Dashboard
                  </Link>
                )}
                <span className="text-gray-400">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-brand text-white px-6 py-2 rounded-btn font-medium hover:bg-red-500 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-brand text-brand px-6 py-2 rounded-btn font-medium hover:bg-brand hover:text-white transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4 border-t border-dark-border">
            {isAuthenticated ? (
              <>
                <Link
                  to="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-400 hover:text-white transition py-2"
                >
                  My Bookings
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-400 hover:text-white transition py-2"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="block text-gray-400 py-2">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="w-full bg-brand text-white px-6 py-2 rounded-btn font-medium hover:bg-red-500 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-400 hover:text-white transition py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block border border-brand text-brand px-6 py-2 rounded-btn font-medium hover:bg-brand hover:text-white transition text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}


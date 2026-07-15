import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">Care<span className="text-accent">Wise</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/doctors" className="hover:text-primary transition">Doctors</Link>
          <Link to="/hospitals" className="hover:text-primary transition">Hospitals</Link>
          <Link to="/assistant" className="hover:text-primary transition">AI Assistant</Link>
          {user && <Link to="/appointments" className="hover:text-primary transition">Appointments</Link>}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-slate-700 hover:text-primary">
                👤 {user.name.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-primary">Login</Link>
              <Link to="/signup" className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 flex flex-col gap-3 text-sm">
          <Link to="/doctors" onClick={() => setMenuOpen(false)} className="py-2 text-slate-700">Doctors</Link>
          <Link to="/hospitals" onClick={() => setMenuOpen(false)} className="py-2 text-slate-700">Hospitals</Link>
          <Link to="/assistant" onClick={() => setMenuOpen(false)} className="py-2 text-slate-700">AI Assistant</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 text-slate-700">Dashboard</Link>
              <button onClick={handleLogout} className="text-left py-2 text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-slate-700">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="py-2 text-primary font-semibold">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
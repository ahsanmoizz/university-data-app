import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined") return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  // ✅ Listen for login/logout changes from anywhere in the app
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw || raw === "undefined") {
          setUser(null);
          return;
        }
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also custom event (for same-tab updates)
    window.addEventListener("userUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleStorageChange);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white flex justify-between px-8 py-3">
      <h1
        className="font-bold text-lg cursor-pointer"
        onClick={() => navigate("/")}
      >
        University Data App
      </h1>

      <div className="space-x-4 flex items-center">
        <Link to="/public" className="hover:text-gray-400">
          Public
        </Link>

        {user?.role === "student" && (
          <>
            <Link to="/upload" className="hover:text-gray-400">
              Upload
            </Link>
            <Link to="/payment" className="hover:text-gray-400">
              Payment
            </Link>
            <Link to="/calendar" className="hover:text-gray-400">
              Calendar
            </Link>
          </>
        )}

        {user?.role === "professor" && (
          <Link to="/professor" className="hover:text-gray-400">
            Professor Panel
          </Link>
        )}

        {user?.role === "admin" && (
          <Link to="/admin" className="hover:text-gray-400">
            Admin Panel
          </Link>
        )}

        {!user ? (
          <>
            <Link to="/login" className="hover:text-gray-400">
              Login
            </Link>
            <Link to="/register" className="hover:text-gray-400">
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

import React, { useState, useEffect, useRef } from "react";
import "./Customer_Navbar.css";
import Customer_Login from "./Customer_Login";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Customer_Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Load login state from localStorage when component mounts
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // ✅ When user logs in
  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("customerUser", JSON.stringify(user));
    setShowLogin(false);
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // 📤 Tell backend to log out
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // 🧹 Clear local storage and frontend state
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user"); // optional: clear user data if stored
      setIsLoggedIn(false);
      setShowDropdown(false);

      // Redirect to home
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/customer-account-sett");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="customer_navbar">
        <div className="customer_navbar_left">
          <h3>Blessed R&C</h3>
          <p>Reality Development Corporation</p>
        </div>

        <div className="customer_navbar_right">
          {!isLoggedIn ? (
            <>
              <a href="#">BUY</a>
              <a href="#">AGENTS</a>
              <a href="#" onClick={() => setShowLogin(true)}>
                SIGN-UP
              </a>
            </>
          ) : (
            <div className="customer_navbar_profile" ref={dropdownRef}>
              <FaUserCircle
                className="customer_navbar_profileIcon"
                onClick={() => setShowDropdown((prev) => !prev)}
              />
              {showDropdown && (
                <div className="customer_navbar_dropdown">
                  <ul>
                    <li onClick={handleProfileClick}>My Profile</li>
                    <li>Settings</li>
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Login Popup */}
      {showLogin && (
        <Customer_Login
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Customer_Navbar;

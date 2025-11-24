import React, { useState, useEffect, useRef } from "react";
import "./Customer_Navbar.css";
import Customer_Login from "./Customer_Login";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const Customer_Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load login state from localStorage when component mounts
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // When user logs in
  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("customerUser", JSON.stringify(user));
    setShowLogin(false);
  };

  const handleLogout = async () => {
    try {
      // Tell backend to log out
      await fetch("https://reality-corporation.onrender.com/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // Clear local storage and frontend state
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("customerUser");
      setIsLoggedIn(false);
      setShowDropdown(false);

      // Redirect to home
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = (e) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    navigate("/customer-account-sett");
  };

  const handleAppointmentsClick = (e) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    navigate("/customer-appointment-sett");
  };

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    navigate("/");
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

  // Check current page
  const isLandingPage = location.pathname === "/";
  const isProfilePage = location.pathname === "/customer-account-sett";
  const isAppointmentsPage = location.pathname === "/customer-appointment-sett";

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
              <span
                className="customer_navbar_signup"
                onClick={() => setShowLogin(true)}
                style={{ cursor: "pointer" }}
              >
                SIGN-UP
              </span>
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
                    {!isLandingPage && <li onClick={handleHomeClick}>Home</li>}
                    {!isProfilePage && <li onClick={handleProfileClick}>My Profile</li>}
                    {!isAppointmentsPage && (
                      <li onClick={handleAppointmentsClick}>My Appointments</li>
                    )}
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

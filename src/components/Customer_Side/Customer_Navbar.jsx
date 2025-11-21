import React, { useState, useRef } from "react";
import "./Customer_Navbar.css";
import Customer_Login from "./Customer_Login";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Customer_Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isLoggedIn, handleLoginSuccess, handleLogout } = useAuth();

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    handleLogout();
    setShowDropdown(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    if (location.pathname === "/customer-account-sett") {
      navigate("/");
    } else {
      navigate("/customer-account-sett");
    }
  };

  const handleAppointmentsClick = () => {
    setShowDropdown(false);
    if (location.pathname === "/customer-appointment-sett") {
      navigate("/customer-account-sett");
    } else {
      navigate("/customer-appointment-sett");
    }
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                    <li onClick={handleProfileClick}>
                      {isProfilePage ? "Home" : "My Profile"}
                    </li>
                    <li onClick={handleAppointmentsClick}>
                      {isAppointmentsPage ? "My Profile" : "My Appointments"}
                    </li>
                    <li onClick={handleLogoutClick}>Logout</li>
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
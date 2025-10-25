import React, { useState } from "react";
import "./Customer_Login.css";

const Customer_Login = ({ onClose, onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(""); // clear message when user types
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignup) {
      // Simple validation
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        setMessageType("error");
        setMessage("⚠️ Please complete all fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessageType("error");
        setMessage("⚠️ Passwords do not match.");
        return;
      }

      // Signup success
      setMessageType("success");
      setMessage("✅ Signup successful! Logging you in...");
      setTimeout(() => setIsSignup(false), 1500);

    } else {
      // Login success
      setMessageType("success");
      setMessage("✅ Logged in successfully!");
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="customer_login_overlay">
      <div className="customer_login_card">
        {/* LEFT SIDE - LOGO */}
        <div className="customer_login_left">
          <img src="/logo.png" alt="Company Logo" className="customer_login_logo" />
          <h2 className="customer_login_companyName">Blessed R&C</h2>
          <p className="customer_login_tagline">Realty Development Corporation</p>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="customer_login_right">
          <button className="customer_login_close" onClick={onClose}>✕</button>

          <div className={`customer_login_slider ${isSignup ? "customer_login_slide_signup" : ""}`}>
            {/* LOGIN FORM */}
            <div className="customer_login_panel">
              <h2 className="customer_login_title">Welcome Back</h2>
              <p className="customer_login_subtitle">Login to continue exploring your dream home</p>

              <form onSubmit={handleSubmit} className="customer_login_form">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                />
                <button type="submit" className="customer_login_button">
                  Login
                </button>

                {/* Message display (only for login) */}
                {!isSignup && message && (
                  <p className={`customer_login_message ${messageType}`}>{message}</p>
                )}
              </form>

              <p className="customer_login_toggle">
                Don’t have an account?{" "}
                <span onClick={() => setIsSignup(true)}>Sign Up</span>
              </p>
            </div>

            {/* SIGN-UP FORM */}
            <div className="customer_login_panel">
              <h2 className="customer_login_title">Create Account</h2>
              <p className="customer_login_subtitle">Join us and start your real estate journey</p>

              <form onSubmit={handleSubmit} className="customer_login_form">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                />

                {/* Message below confirm password */}
                {isSignup && message && (
                  <p className={`customer_login_message ${messageType}`}>{message}</p>
                )}

                <button type="submit" className="customer_login_button">
                  Sign Up
                </button>
              </form>

              <p className="customer_login_toggle">
                Already have an account?{" "}
                <span onClick={() => setIsSignup(false)}>Login</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer_Login;

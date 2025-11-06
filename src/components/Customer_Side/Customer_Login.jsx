import React, { useState } from "react";
import "./Customer_Login.css";

const Customer_Login = ({ onClose, onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // 🔍 Basic Validation
        if (
          !formData.name ||
          !formData.email ||
          !formData.phone ||
          !formData.address ||
          !formData.username ||
          !formData.password
        ) {
          setMessageType("error");
          setMessage("⚠️ Please fill out all fields.");
          setLoading(false);
          return;
        }

        // 📤 Send signup data to backend
        const res = await fetch("http://localhost:5000/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessageType("success");
          setMessage("✅ Signup successful! Logging you in...");
          setTimeout(() => setIsSignup(false), 1500);
        } else {
          setMessageType("error");
          setMessage("⚠️ " + data.msg);
        }
      } else {
        // 📤 Send login data to backend
        const res = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: "Customer",
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessageType("success");
          setMessage("✅ Logged in successfully!");
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess(data.user);
            onClose();
          }, 1500);
        } else {
          setMessageType("error");
          setMessage("⚠️ " + data.msg);
        }
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("⚠️ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer_login_overlay">
      <div className="customer_login_card">
        {/* LEFT SIDE */}
        <div className="customer_login_left">
          <img src="/logo.png" alt="Company Logo" className="customer_login_logo" />
          <h2 className="customer_login_companyName">Blessed R&C</h2>
          <p className="customer_login_tagline">Realty Development Corporation</p>
        </div>

        {/* RIGHT SIDE */}
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
                <button type="submit" className="customer_login_button" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>

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
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
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
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
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

                {isSignup && message && (
                  <p className={`customer_login_message ${messageType}`}>{message}</p>
                )}

                <button type="submit" className="customer_login_button" disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
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

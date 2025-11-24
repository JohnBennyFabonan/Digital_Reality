import React, { useState } from "react";
import "./Customer_Login.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Customer_Login = ({ onClose, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    dateofbirth: "",
    address: "",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);

  const switchForm = (toSignup) => {
    setIsSignup(toSignup);
    setMessage("");
    setMessageType("");
    setFormData({
      firstname: "",
      lastname: "",
      phonenumber: "",
      email: "",
      dateofbirth: "",
      address: "",
      username: "",
      password: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setMessageType("");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (isSignup) {
    // ... existing signup code ...
  } else {
    const { email, password } = formData;

    if (!email || !password) {
      setMessageType("error");
      setMessage("⚠️ Please enter email and password.");
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setMessageType("error");
      setMessage("⚠️ Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://reality-corporation.onrender.com/api/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store login status and customer ID
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("customer_token", "loggedin");
        
        // ✅ CRITICAL: Store the customer ID from the response
        if (data.user && data.user.customer_id) {
          localStorage.setItem("customerId", data.user.customer_id.toString());
          console.log("✅ Customer ID stored in localStorage:", data.user.customer_id);
        } else {
          console.error("❌ No customer_id found in login response:", data);
          setMessageType("error");
          setMessage("⚠️ Login failed: Missing user data");
          setLoading(false);
          return;
        }

        setMessageType("success");
        setMessage("✅ Logged in successfully!");

        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(data.user);
          onClose();
          navigate("/"); // ✅ redirect to homepage
        }, 1200);
      } else {
        setMessageType("error");
        setMessage(`⚠️ ${data.msg || "Invalid credentials"}`);
      }
    } catch (err) {
      setMessageType("error");
      setMessage("⚠️ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }
};
  return (
    <div className="customer_login_overlay" role="dialog" aria-modal="true">
      <div className="customer_login_card">
        {/* LEFT SIDE */}
        <aside className="customer_login_left">
          <img src={logo} alt="Company Logo" className="customer_login_logo" />
          <h2 className="customer_login_companyName">Blessed R&C</h2>
          <p className="customer_login_tagline">
            Realty Development Corporation
          </p>
        </aside>

        {/* RIGHT SIDE */}
        <section className="customer_login_right">
          <button
            className="customer_login_close"
            onClick={onClose}
            aria-label="Close login form"
          >
            ✕
          </button>

          <div
            className={`customer_login_slider ${
              isSignup ? "customer_login_slide_signup" : ""
            }`}
          >
            {/* LOGIN FORM */}
            <div className="customer_login_panel" aria-hidden={isSignup}>
              <h2 className="customer_login_title">Welcome Back</h2>
              <p className="customer_login_subtitle">
                Login to continue exploring your dream home
              </p>

              <form
                onSubmit={handleSubmit}
                className="customer_login_form"
                noValidate
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                  autoComplete="username"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="submit"
                  className="customer_login_button"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                {!isSignup && message && (
                  <p
                    className={`customer_login_message ${messageType}`}
                    role={messageType === "error" ? "alert" : undefined}
                  >
                    {message}
                  </p>
                )}
              </form>

              <p className="customer_login_toggle">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchForm(true)}
                  className="link-button"
                >
                  Sign Up
                </button>
              </p>
            </div>

            {/* SIGN-UP FORM */}
            <div className="customer_login_panel" aria-hidden={!isSignup}>
              <h2 className="customer_login_title">Create Account</h2>
              <p className="customer_login_subtitle">
                Join us and start your real estate journey
              </p>

              <form
                onSubmit={handleSubmit}
                className="customer_login_form"
                noValidate
              >
                <input
                  type="text"
                  name="firstname"
                  placeholder="First Name"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                  autoComplete="given-name"
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last Name"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                  autoComplete="family-name"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                  autoComplete="email"
                />
                <input
                  type="date"
                  name="dateofbirth"
                  placeholder="Date of Birth"
                  value={formData.dateofbirth}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                  autoComplete="bday"
                />
                <input
                  type="tel"
                  name="phonenumber"
                  placeholder="Phone Number"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                  maxLength={15}
                  autoComplete="tel"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="customer_login_input"
                  required
                  autoComplete="street-address"
                />
                <div className="customer_login_row">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="customer_login_input"
                    required
                    autoComplete="username"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="customer_login_input"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {isSignup && message && (
                  <p
                    className={`customer_login_message ${messageType}`}
                    role={messageType === "error" ? "alert" : undefined}
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="customer_login_button"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </button>
              </form>

              <p className="customer_login_toggle">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchForm(false)}
                  className="link-button"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Customer_Login;

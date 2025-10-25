import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RealState_Login.css";

const RealState_Login = () => {
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setError(data.msg || "Invalid credentials");
        return;
      }

      // Save user info in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      switch (data.user.role.toLowerCase()) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "staff":
          navigate("/staff-dashboard");
          break;
        case "agent":
          navigate("/agent-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server not reachable");
    }
  };

  return (
    <div className="realstate_login_container">
      <div className="realstate_login_left">
        <img src="/logo.png" alt="Company Logo" className="realstate_login_logo" />
        <h2 className="realstate_login_companyName">Blessed R&C</h2>
        <p className="realstate_login_tagline">Realty Development Corporation</p>
      </div>

      <div className="realstate_login_right">
        <div className="realstate_login_card">
          <h2 className="realstate_login_title">Welcome Back</h2>
          <p className="realstate_login_subtitle">Please login to your account</p>

          <div className="realstate_login_roles">
            {["Admin", "Staff", "Agent"].map((r) => (
              <button
                key={r}
                type="button"
                className={`realstate_login_roleButton ${role === r ? "active" : ""}`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="realstate_login_form">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="realstate_login_input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="realstate_login_input"
            />

            {error && <p className="realstate_login_error">{error}</p>}

            <button type="submit" className="realstate_login_button">
              Login as {role}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RealState_Login;

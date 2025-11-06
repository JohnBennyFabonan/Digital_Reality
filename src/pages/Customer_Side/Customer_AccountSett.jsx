import React, { useEffect, useState } from "react";
import "./Customer_AccountSett.css";
import Customer_Navbar from "../../components/Customer_Side/Customer_Navbar";

const Customer_AccountSett = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    phone: "",
    username: "",
    password: "",
  });

  // 🧠 Load user info from localStorage when page loads
  useEffect(() => {
    const storedUser = localStorage.getItem("customerUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Split full name into first/last (if available)
      const nameParts = parsedUser.name ? parsedUser.name.split(" ") : ["", ""];
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: parsedUser.email || "",
        dob: parsedUser.dob || "",
        phone: parsedUser.phone || "",
        username: parsedUser.username || "",
        password: parsedUser.password || "",
      });
    }
  }, []);

  // ✍️ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💾 Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:5000/api/customers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("✅ Account updated successfully!");
      } else {
        const data = await res.json();
        alert("⚠️ " + data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Failed to update account.");
    }
  };

  return (
    <div className="customer-acc-sett-container">
      <Customer_Navbar />

      <main className="customer-acc-sett-content">
        {/* Sidebar */}
        <aside className="customer-acc-sett-sidebar">
          <button className="customer-acc-sett-sidebar-btn">
            Account Settings
          </button>
          <div className="customer-acc-sett-profile-card">
            <div className="customer-acc-sett-avatar"></div>
            <h3 className="customer-acc-sett-fullname">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="customer-acc-sett-username">@{formData.username}</p>
          </div>
        </aside>

        {/* Form Section */}
        <section className="customer-acc-sett-form-section">
          <form className="customer-acc-sett-form" onSubmit={handleSave}>
            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="customer-acc-sett-input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
              <div className="customer-acc-sett-input-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="customer-acc-sett-input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="customer-acc-sett-actions">
              <button type="submit" className="customer-acc-sett-save-btn">
                Save
              </button>
              <button type="button" className="customer-acc-sett-cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Customer_AccountSett;

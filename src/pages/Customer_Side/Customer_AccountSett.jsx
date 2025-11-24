import React, { useEffect, useState } from "react";
import "./Customer_AccountSett.css";
import Customer_Navbar from "../../components/Customer_Side/Customer_Navbar";
import { useNavigate } from "react-router-dom";

const Customer_AccountSett = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    dateofbirth: "",
    phonenumber: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const navigate = useNavigate();

  // 🧠 Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    try {
      // Handle different date formats from database
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString);
        return "";
      }
      
      // Format to YYYY-MM-DD for input[type="date"]
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "";
    }
  };

  // 🧠 Load user info from localStorage when page loads
  useEffect(() => {
    console.log("🔍 Customer_AccountSett mounted");
    
    const loadUserData = () => {
      const storedUser = localStorage.getItem("customerUser");
      console.log("📦 Stored user data:", storedUser);
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("✅ Parsed user:", parsedUser);
          setUser(parsedUser);

          // Format the date of birth properly
          const formattedDob = formatDateForInput(
            parsedUser.dateofbirth || parsedUser.dob || parsedUser.dateOfBirth
          );

          console.log("📅 Original DOB:", parsedUser.dateofbirth || parsedUser.dob);
          console.log("📅 Formatted DOB:", formattedDob);

          // Map the user data to form fields based on your database schema
          setFormData({
            firstname: parsedUser.firstname || parsedUser.firstName || "",
            lastname: parsedUser.lastname || parsedUser.lastName || "",
            email: parsedUser.email || "",
            dateofbirth: formattedDob,
            phonenumber: parsedUser.phonenumber || parsedUser.phone || "",
            username: parsedUser.username || "",
            password: "", // Don't pre-fill password for security
          });
        } catch (error) {
          console.error("❌ Error parsing user data:", error);
          showMessage("Error loading user data. Please login again.", "error");
          localStorage.removeItem("customerUser");
          setTimeout(() => navigate("/customer-login"), 2000);
        }
      } else {
        console.log("❌ No customerUser found in localStorage");
        showMessage("Please login to access account settings", "error");
        navigate("/customer-login");
      }
      setLoading(false);
    };

    loadUserData();
  }, [navigate]);

  // ✍️ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear message when user starts typing
    if (message.text) setMessage({ text: "", type: "" });
  };

  // 💾 Show message helper
  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // 💾 Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      // Prepare update data
      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        dateofbirth: formData.dateofbirth, // This should now be in correct format
        phonenumber: formData.phonenumber,
        username: formData.username,
      };

      console.log("💾 Saving data:", updateData);

      // Only include password if it's not empty
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const res = await fetch(`https://reality-corporation.onrender.com/api/customers/${user.customer_id || user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = data.user || data;
        
        // Update localStorage with new data
        const newUserData = {
          ...user,
          ...updatedUser,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          dateofbirth: formData.dateofbirth, // Store in correct format
          phonenumber: formData.phonenumber,
          username: formData.username,
        };
        
        localStorage.setItem("customerUser", JSON.stringify(newUserData));
        setUser(newUserData);
        
        showMessage("✅ Account updated successfully!", "success");
        
        // Clear password field after successful save
        setFormData(prev => ({ ...prev, password: "" }));
      } else {
        showMessage(`⚠️ ${data.msg || "Failed to update account"}`, "error");
      }
    } catch (err) {
      console.error("❌ Update error:", err);
      showMessage("⚠️ Failed to update account. Please check your connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  // 🚪 Handle Cancel - Reset form to original values
  const handleCancel = () => {
    if (user) {
      const formattedDob = formatDateForInput(
        user.dateofbirth || user.dob || user.dateOfBirth
      );
      
      setFormData({
        firstname: user.firstname || user.firstName || "",
        lastname: user.lastname || user.lastName || "",
        email: user.email || "",
        dateofbirth: formattedDob,
        phonenumber: user.phonenumber || user.phone || "",
        username: user.username || "",
        password: "", // Always clear password on cancel
      });
      showMessage("Changes discarded", "info");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="customer-acc-sett-container">
        <Customer_Navbar />
        <div className="loading">Loading your account information...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="customer-acc-sett-container">
        <Customer_Navbar />
        <div className="error-message">
          Unable to load user data. Please try logging in again.
        </div>
      </div>
    );
  }

  return (
    <div className="customer-acc-sett-container">
      <Customer_Navbar />

      <main className="customer-acc-sett-content">
        {/* Sidebar */}
        <aside className="customer-acc-sett-sidebar">
          <button className="customer-acc-sett-sidebar-btn active">
            Account Settings
          </button>
          <div className="customer-acc-sett-profile-card">
            <div className="customer-acc-sett-avatar">
              {formData.firstname.charAt(0)}{formData.lastname.charAt(0)}
            </div>
            <h3 className="customer-acc-sett-fullname">
              {formData.firstname} {formData.lastname}
            </h3>
            <p className="customer-acc-sett-username">@{formData.username}</p>
            <p className="customer-acc-sett-email">{formData.email}</p>
          </div>
        </aside>

        {/* Form Section */}
        <section className="customer-acc-sett-form-section">
          <div className="customer-acc-sett-header">
            <h2>Account Settings</h2>
            <p>Manage your account information and preferences</p>
          </div>

          {message.text && (
            <div className={`customer-acc-sett-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form className="customer-acc-sett-form" onSubmit={handleSave}>
            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label htmlFor="firstname">First Name</label>
                <input
                  id="firstname"
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="customer-acc-sett-input-group">
                <label htmlFor="lastname">Last Name</label>
                <input
                  id="lastname"
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label htmlFor="dateofbirth">Date of Birth</label>
                <input
                  id="dateofbirth"
                  type="date"
                  name="dateofbirth"
                  value={formData.dateofbirth}
                  onChange={handleChange}
                />
                {!formData.dateofbirth && (
                  <small className="field-hint">
                    No date of birth set. Please add your date of birth.
                  </small>
                )}
              </div>
              <div className="customer-acc-sett-input-group">
                <label htmlFor="phonenumber">Phone Number</label>
                <input
                  id="phonenumber"
                  type="tel"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="customer-acc-sett-input-group">
                <label htmlFor="password">New Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password to change"
                  minLength="6"
                />
                <small className="field-hint">
                  Leave blank to keep current password
                </small>
              </div>
            </div>

            <div className="customer-acc-sett-actions">
              <button 
                type="submit" 
                className="customer-acc-sett-save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button 
                type="button" 
                className="customer-acc-sett-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
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
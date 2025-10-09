import React from "react";
import "./Customer_AccountSett.css";
import Customer_Navbar from "../../components/Customer_Side/Customer_Navbar";

const Customer_AccountSettings = () => {
  return (
    <div className="customer-acc-sett-container">
      <Customer_Navbar />

      {/* Content */}
      <main className="customer-acc-sett-content">
        {/* Sidebar */}
        <aside className="customer-acc-sett-sidebar">
          <button className="customer-acc-sett-sidebar-btn">
            Account Settings
          </button>
          <div className="customer-acc-sett-profile-card">
            <div className="customer-acc-sett-avatar"></div>
            <h3 className="customer-acc-sett-fullname">Full Name</h3>
            <p className="customer-acc-sett-username">User</p>
          </div>
        </aside>

        {/* Form Section */}
        <section className="customer-acc-sett-form-section">
          <form className="customer-acc-sett-form">
            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label>First Name</label>
                <input type="text" />
              </div>
              <div className="customer-acc-sett-input-group">
                <label>Last Name</label>
                <input type="text" />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label>Email</label>
                <input type="email" />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label>Date of Birth</label>
                <input type="date" />
              </div>
              <div className="customer-acc-sett-input-group">
                <label>Phone Number</label>
                <input type="text" />
              </div>
            </div>

            <div className="customer-acc-sett-row">
              <div className="customer-acc-sett-input-group">
                <label>Username</label>
                <input type="text" />
              </div>
              <div className="customer-acc-sett-input-group">
                <label>Password</label>
                <input type="password" />
              </div>
            </div>

            {/* Buttons */}
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

export default Customer_AccountSettings;

import React, { useState } from "react";
import "./Admin_Dashboard.css";

const Admin_Dashboard = () => {
  const [activeTable, setActiveTable] = useState("users"); // "users", "properties", "transactions"

  // Sample data for tables
  const tableData = {
    users: [
      { id: 1, name: "John Doe", email: "john@example.com", status: "Active", joinDate: "2024-01-15" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive", joinDate: "2024-02-20" },
      { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "Active", joinDate: "2024-03-10" }
    ],
    properties: [
      { id: 1, title: "Beach House", type: "Villa", price: "$500,000", status: "Available" },
      { id: 2, title: "Mountain Cabin", type: "Cabin", price: "$300,000", status: "Sold" },
      { id: 3, title: "City Apartment", type: "Apartment", price: "$250,000", status: "Available" }
    ],
    transactions: [
      { id: 1, property: "Beach House", client: "John Doe", amount: "$500,000", date: "2024-03-15" },
      { id: 2, property: "Mountain Cabin", client: "Jane Smith", amount: "$300,000", date: "2024-03-10" },
      { id: 3, property: "City Apartment", client: "Mike Johnson", amount: "$250,000", date: "2024-03-05" }
    ]
  };

  return (
    <div className="admin_dashboard">
      <main className="admin_dashboard_main">
        {/* Top Stats Boxes */}
        <div className="admin_dashboard_stats">
          <div className="admin_dashboard_stat_box">
            <div className="admin_dashboard_stat_icon">👥</div>
            <div className="admin_dashboard_stat_content">
              <h3>Total Users</h3>
              <p className="admin_dashboard_stat_number">1,234</p>
              <span className="admin_dashboard_stat_change">+12% from last month</span>
            </div>
          </div>

          <div className="admin_dashboard_stat_box">
            <div className="admin_dashboard_stat_icon">🏠</div>
            <div className="admin_dashboard_stat_content">
              <h3>Properties</h3>
              <p className="admin_dashboard_stat_number">567</p>
              <span className="admin_dashboard_stat_change">+8% from last month</span>
            </div>
          </div>

          <div className="admin_dashboard_stat_box">
            <div className="admin_dashboard_stat_icon">💰</div>
            <div className="admin_dashboard_stat_content">
              <h3>Revenue</h3>
              <p className="admin_dashboard_stat_number">$2.5M</p>
              <span className="admin_dashboard_stat_change">+15% from last month</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="admin_dashboard_table_section">
          <div className="admin_dashboard_table_header">
            <div className="admin_dashboard_table_tabs">
              <button
                className={`admin_dashboard_table_tab ${activeTable === "users" ? "admin_dashboard_table_tab_active" : ""}`}
                onClick={() => setActiveTable("users")}
              >
                Users
              </button>
              <button
                className={`admin_dashboard_table_tab ${activeTable === "properties" ? "admin_dashboard_table_tab_active" : ""}`}
                onClick={() => setActiveTable("properties")}
              >
                Properties
              </button>
              <button
                className={`admin_dashboard_table_tab ${activeTable === "transactions" ? "admin_dashboard_table_tab_active" : ""}`}
                onClick={() => setActiveTable("transactions")}
              >
                Transactions
              </button>
            </div>

            <button className="admin_dashboard_export_btn">
              Export Data
            </button>
          </div>

          {/* Table */}
          <div className="admin_dashboard_table_container">
            <table className="admin_dashboard_table">
              <thead>
                <tr>
                  {activeTable === "users" && (
                    <>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </>
                  )}
                  {activeTable === "properties" && (
                    <>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </>
                  )}
                  {activeTable === "transactions" && (
                    <>
                      <th>ID</th>
                      <th>Property</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {tableData[activeTable].map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name || item.title || item.property}</td>
                    <td>{item.email || item.type || item.client}</td>
                    <td>
                      <span className={`admin_dashboard_status admin_dashboard_status_${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.price || item.amount || item.joinDate || item.date}</td>
                    <td>
                      <div className="admin_dashboard_action_icons">
                        <span className="admin_dashboard_action_icon">👁️</span>
                        <span className="admin_dashboard_action_icon">✏️</span>
                        <span className="admin_dashboard_action_icon">🗑️</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin_Dashboard;
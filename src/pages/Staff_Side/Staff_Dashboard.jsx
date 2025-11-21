import React, { useState } from "react";
import { FaEye, FaPen, FaTrash } from "react-icons/fa";
import "./Staff_Dashboard.css";

const Staff_Dashboard = () => {
  // Sample booking data
  const bookings = [
    { id: 1, user: "John Doe", property: "Beachfront Paradise", date: "2025-10-01", status: "Confirmed" },
    { id: 2, user: "Jane Smith", property: "Mountain Retreat", date: "2025-10-12", status: "Pending" },
    { id: 3, user: "Mike Johnson", property: "City Apartment", date: "2025-10-20", status: "Cancelled" },
  ];

  // Sample properties data for count only
  const propertiesCount = 12;

  return (
    <div className="staff_dashboard">

      {/* Top summary boxes */}
      <div className="staff_dashboard_summary_cards">
        <div className="staff_dashboard_card">
          <div className="staff_dashboard_card_icon">
            <img
              alt="Bookings"
              src="https://cdn-icons-png.flaticon.com/512/833/833472.png"
              style={{ width: "40px", height: "40px" }}
            />
          </div>
          <div className="staff_dashboard_card_content">
            <small>Total Bookings</small>
            <h3>{bookings.length}</h3>
          </div>
        </div>

        <div className="staff_dashboard_card">
          <div className="staff_dashboard_card_icon">
            <img
              alt="Properties"
              src="https://cdn-icons-png.flaticon.com/512/3238/3238695.png"
              style={{ width: "40px", height: "40px" }}
            />
          </div>
          <div className="staff_dashboard_card_content">
            <small>Properties</small>
            <h3>{propertiesCount}</h3>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="staff_dashboard_table_container">
        <table className="staff_dashboard_table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Property</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.user}</td>
                <td>{b.property}</td>
                <td>{b.date}</td>
                <td>
                  <span className={`status ${b.status.toLowerCase()}`}>
                    {b.status}
                  </span>
                </td>
                <td className="actions">
                  <FaEye title="View" className="action_icon" />
                  <FaPen title="Edit" className="action_icon" />
                  <FaTrash title="Delete" className="action_icon" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Staff_Dashboard;

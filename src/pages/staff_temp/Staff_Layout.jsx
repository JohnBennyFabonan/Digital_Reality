import React from "react";
import { Outlet } from "react-router-dom";
import Staff_Sidebar from "../../components/Staff_Side/Staff_Sidebar";
import "./Staff_Layout.css";

const Staff_Layout = () => {
  return (
    <div className="staff_dashboard_layout">
      {/* Sidebar */}
      <Staff_Sidebar />

      {/* Main Content */}
      <main className="staff_dashboard_main">
        {/* Header */}
        <div className="staff_dashboard_header">
          <div className="staff_dashboard_profile">
            <div className="staff_dashboard_profile_text">
              <p className="staff_dashboard_profile_name">John Doe</p>
              <p className="staff_dashboard_profile_role">Staff</p>
            </div>
            <div className="staff_dashboard_toggle"></div>
          </div>
        </div>

        {/* Nested routes render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default Staff_Layout;

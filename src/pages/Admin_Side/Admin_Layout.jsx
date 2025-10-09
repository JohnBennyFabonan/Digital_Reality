// src/pages/Admin_Side/Admin_Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Admin_Sidebar from "../../components/Admin_Side/Admin_Sidebar";
import "./Admin_Layout.css";

const AdminLayout = () => {
  return (
    <div className="admin_layout">
      {/* Sidebar */}
      <Admin_Sidebar />

      {/* Main Content */}
      <main className="admin_layout_main">
        {/* Header */}
        <div className="admin_layout_header">
          <div className="admin_layout_profile">
            <div className="admin_layout_profile_text">
              <p className="admin_layout_profile_name">John Doe</p>
              <p className="admin_layout_profile_role">Manager</p>
            </div>
            <div className="admin_layout_toggle"></div>
          </div>
        </div>

        {/* Nested routes render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

import React from "react";
import { Outlet } from "react-router-dom";
import Agent_Sidebar from "../../components/Agent_Side/Agent_Sidebar";
import "./Agent_Layout.css";

const Agent_Layout = () => {
  return (
    <div className="agent_dashboard_layout">
      {/* Sidebar */}
      <Agent_Sidebar />

      {/* Main Content */}
      <main className="agent_dashboard_main">
        {/* Header */}
        <div className="agent_dashboard_header">
          <div className="agent_dashboard_profile">
            <div className="agent_dashboard_profile_text">
              <p className="agent_dashboard_profile_name">John Doe</p>
              <p className="agent_dashboard_profile_role">Staff</p>
            </div>
            <div className="agent_dashboard_toggle"></div>
          </div>
        </div>

        {/* Nested routes render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default Agent_Layout;

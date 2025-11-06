import React, { useState } from "react";
import Sidebar from "../../components/Admin_Side/Admin_Sidebar";
import Admin_AddStaffModal from "../../components/Admin_Side/Admin_AddStaffModal";
import Admin_StaffTable from "../../components/Admin_Side/Admin_StaffTable";
import Admin_AgentTable from "../../components/Admin_Side/Admin_AgentTable";
import "./Admin_Dashboard.css";

const Admin_Dashboard = () => {
  const [activeTab, setActiveTab] = useState("staff");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="admin_dashboard">
      <main className="admin_dashboard_main">
        {/* Tabs */}
        <div className="admin_dashboard_tabs">
          <div className="admin_dashboard_acc">
            <button
              className={activeTab === "staff" ? "active" : ""}
              onClick={() => setActiveTab("staff")}
            >
              Staff
            </button>
            <button
              className={activeTab === "agent" ? "active" : ""}
              onClick={() => setActiveTab("agent")}
            >
              Agents
            </button>
          </div>

          <div className="admin_dashboard_addBtn_wrapper">
            <button
              className="admin_dashboard_addBtn"
              onClick={() => setIsModalOpen(true)}
            >
              {activeTab === "staff" ? "ADD STAFF" : "ADD AGENT"}
            </button>
          </div>
        </div>

        {/* Render different tables */}
        {activeTab === "staff" ? <Admin_StaffTable /> : <Admin_AgentTable />}
      </main>

      {/* Modal: pass roleType */}
      {isModalOpen && (
        <Admin_AddStaffModal
          onClose={() => setIsModalOpen(false)}
          roleType={activeTab === "staff" ? "Staff" : "Agent"}
        />
      )}
    </div>
  );
};

export default Admin_Dashboard;

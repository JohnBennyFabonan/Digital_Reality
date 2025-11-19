import React, { useState } from "react";
import Admin_AddStaffModal from "../../components/Admin_Side/Admin_AddStaffModal";
import Admin_StaffTable from "../../components/Admin_Side/Admin_StaffTable";
import Admin_AgentTable from "../../components/Admin_Side/Admin_AgentTable";
import "./Admin_UserManagement.css";

const Admin_UserManagement = () => {
  const [activeTab, setActiveTab] = useState("staff"); // "staff" or "agent"
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="admin_user_management">
      <main className="admin_user_management_main">
        <div className="admin_user_management_tabs">
          <div className="admin_user_management_acc">
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

          <div className="admin_user_management_addBtn_wrapper">
            <button
              className="admin_user_management_addBtn"
              onClick={() => setIsModalOpen(true)}
            >
              {activeTab === "staff" ? "ADD STAFF" : "ADD AGENT"}
            </button>
          </div>
        </div>

        {activeTab === "staff" ? <Admin_StaffTable /> : <Admin_AgentTable />}
      </main>

      {isModalOpen && (
        <Admin_AddStaffModal
          onClose={() => setIsModalOpen(false)}
          roleType={activeTab === "staff" ? "Staff" : "Agent"}
        />
      )}
    </div>
  );
};

export default Admin_UserManagement;

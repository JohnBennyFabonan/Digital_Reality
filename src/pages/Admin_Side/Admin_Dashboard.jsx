import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../../components/Admin_Side/Admin_Sidebar";
import Admin_AddStaffModal from "../../components/Admin_Side/Admin_AddStaffModal";
import "./Admin_Dashboard.css";

const Admin_Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const staffData = [
    { location: "Cuta, Batangas City", sqm: 2000, agent: "Agent 1" },
    { location: "Calicanto, Batangas City", sqm: 2000, agent: "Agent 2" },
    { location: "Alangilan, Batangas City", sqm: 2000, agent: "Agent 3" },
    { location: "Diversion, Batangas City", sqm: 2000, agent: "Agent 4" },
    { location: "Libjo, Batangas City", sqm: 2000, agent: "Agent 5" },
  ];

  return (
    <div className="admin_dashboard">
      <main className="admin_dashboard_main">
        {/* Tabs */}
        <div className="admin_dashboard_tabs">
          <div className="admin_dashboard_acc">
            <button className="active">Staff</button>
            <button>Agents</button>
          </div>

          <div className="admin_dashboard_addBtn_wrapper">
            <button
              className="admin_dashboard_addBtn"
              onClick={() => setIsModalOpen(true)}
            >
              ADD STAFF
            </button>
          </div>
        </div>

        {/* Table with Admin_Reports design */}
        <div className="admin_reports_table_container">
          <table className="admin_reports_table">
            <thead>
              <tr>
                <th>LOCATION</th>
                <th>SQUARE METERS</th>
                <th>AGENTS</th>
                <th>IMAGE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((row, index) => (
                <tr key={index}>
                  <td>{row.location}</td>
                  <td>{row.sqm}</td>
                  <td>{row.agent}</td>
                  <td>image.png</td>
                  <td>
                    <span className="admin_reports_action_icon">
                      <FaEdit />
                    </span>
                    <span className="admin_reports_action_icon">
                      <FaTrash />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <Admin_AddStaffModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Admin_Dashboard;

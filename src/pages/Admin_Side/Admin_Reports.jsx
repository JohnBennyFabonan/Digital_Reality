// Admin_Reports.js
import React from "react";
import "./Admin_Reports.css";
import { FaFilter } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";

const Admin_Reports = () => {
  return (
    <div className="admin_reports_container">
      {/* Header Section */}
      <div className="admin_reports_header">
        <h2 className="admin_reports_title">LIST OF REPORTS</h2>

        <div className="admin_reports_actions">
          <button className="admin_reports_btn filter">
            <FaFilter className="admin_reports_icon" />
            Filter
          </button>
          <button className="admin_reports_btn csv">
            <FaFileCsv className="admin_reports_icon" />
            CSV
          </button>
        </div>
      </div>

      {/* Table */}
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
            <tr>
              <td>Cuta, Batangas City</td>
              <td>2000</td>
              <td>Agent 1</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon">✏️</span>
                <span className="admin_reports_action_icon">🗑️</span>
              </td>
            </tr>
            <tr>
              <td>Calicanto, Batangas City</td>
              <td>2000</td>
              <td>Agent 2</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon">✏️</span>
                <span className="admin_reports_action_icon">🗑️</span>
              </td>
            </tr>
            <tr>
              <td>Alangilan, Batangas City</td>
              <td>2000</td>
              <td>Agent 3</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon">✏️</span>
                <span className="admin_reports_action_icon">🗑️</span>
              </td>
            </tr>
            <tr>
              <td>Diversion, Batangas City</td>
              <td>2000</td>
              <td>Agent 4</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon">✏️</span>
                <span className="admin_reports_action_icon">🗑️</span>
              </td>
            </tr>
            <tr>
              <td>Libjo, Batangas City</td>
              <td>2000</td>
              <td>Agent 5</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon">✏️</span>
                <span className="admin_reports_action_icon">🗑️</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin_Reports;

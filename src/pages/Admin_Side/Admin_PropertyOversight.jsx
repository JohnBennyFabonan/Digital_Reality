import React from "react";
import "./Admin_PropertyOversight.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const Admin_PropertyOversight = () => {
  return (
    <div className="admin_property_container">
      {/* Header */}
      <div className="admin_property_header">
        <h2 className="admin_property_title">LIST OF PROPERTIES</h2>
        <button className="admin_property_addButton">ADD PROPERTY</button>
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
            <tr>
              <td>Cuta, Batangas City</td>
              <td>2000</td>
              <td>Agent 1</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon"><FaEdit /></span>
                <span className="admin_reports_action_icon"><FaTrash /></span>
              </td>
            </tr>
            <tr>
              <td>Calicanto, Batangas City</td>
              <td>2000</td>
              <td>Agent 2</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon"><FaEdit /></span>
                <span className="admin_reports_action_icon"><FaTrash /></span>
              </td>
            </tr>
            <tr>
              <td>Alangilan, Batangas City</td>
              <td>2000</td>
              <td>Agent 3</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon"><FaEdit /></span>
                <span className="admin_reports_action_icon"><FaTrash /></span>
              </td>
            </tr>
            <tr>
              <td>Diversion, Batangas City</td>
              <td>2000</td>
              <td>Agent 4</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon"><FaEdit /></span>
                <span className="admin_reports_action_icon"><FaTrash /></span>
              </td>
            </tr>
            <tr>
              <td>Libjo, Batangas City</td>
              <td>2000</td>
              <td>Agent 5</td>
              <td>image.png</td>
              <td>
                <span className="admin_reports_action_icon"><FaEdit /></span>
                <span className="admin_reports_action_icon"><FaTrash /></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin_PropertyOversight;

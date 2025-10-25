import React from "react";
import "./Agent_Clients.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const Agent_Appointments = () => {
  return (
    <div className="agent_client_details_container">
      {/* Header */}
      <div className="agent_client_details_header">
        <h2 className="agent_client_details_title">AGENT APPOINTMENTS</h2>
      </div>

      {/* Table */}
      <div className="agent_client_details_table_container">
        <table className="agent_client_details_table">
          <thead>
            <tr>
              <th>CLIENT NAME</th>
              <th>CONTACT</th>
              <th>EMAIL</th>
              <th>ADDRESS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Juan Dela Cruz</td>
              <td>09123456789</td>
              <td>juan@email.com</td>
              <td>Cuta, Batangas City</td>
              <td>
                <span className="agent_client_details_action_icon">
                  <FaEdit />
                </span>
                <span className="agent_client_details_action_icon">
                  <FaTrash />
                </span>
              </td>
            </tr>
            <tr>
              <td>Maria Santos</td>
              <td>09987654321</td>
              <td>maria@email.com</td>
              <td>Calicanto, Batangas City</td>
              <td>
                <span className="agent_client_details_action_icon">
                  <FaEdit />
                </span>
                <span className="agent_client_details_action_icon">
                  <FaTrash />
                </span>
              </td>
            </tr>
            <tr>
              <td>Pedro Garcia</td>
              <td>09221234567</td>
              <td>pedro@email.com</td>
              <td>Alangilan, Batangas City</td>
              <td>
                <span className="agent_client_details_action_icon">
                  <FaEdit />
                </span>
                <span className="agent_client_details_action_icon">
                  <FaTrash />
                </span>
              </td>
            </tr>
            <tr>
              <td>Ana Dizon</td>
              <td>09334445555</td>
              <td>ana@email.com</td>
              <td>Diversion, Batangas City</td>
              <td>
                <span className="agent_client_details_action_icon">
                  <FaEdit />
                </span>
                <span className="agent_client_details_action_icon">
                  <FaTrash />
                </span>
              </td>
            </tr>
            <tr>
              <td>Mark Reyes</td>
              <td>09443332211</td>
              <td>mark@email.com</td>
              <td>Libjo, Batangas City</td>
              <td>
                <span className="agent_client_details_action_icon">
                  <FaEdit />
                </span>
                <span className="agent_client_details_action_icon">
                  <FaTrash />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Agent_Appointments;

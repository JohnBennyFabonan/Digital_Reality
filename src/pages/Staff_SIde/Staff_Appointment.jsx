import React from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./Staff_Appointment.css";

const Staff_Appointment = () => {
  const data = [
    { location: "Cuta, Batangas City", sqm: 2000, agent: "Agent 1", image: "image.png" },
    { location: "Calicanto, Batangas City", sqm: 2000, agent: "Agent 2", image: "image.png" },
    { location: "Alangilan, Batangas City", sqm: 2000, agent: "Agent 3", image: "image.png" },
    { location: "Diversion, Batangas City", sqm: 2000, agent: "Agent 4", image: "image.png" },
    { location: "Libjo, Batangas City", sqm: 2000, agent: "Agent 5", image: "image.png" },
  ];

  return (
    <div className="staff_appointment_list_container">

      {/* Main Content */}
      <main className="staff_appointment_list_main">

        {/* Action Bar */}
        <div className="staff_appointment_list_actionbar">
          <button className="staff_appointment_list_addBtn">RESCHEDULED AGENTS</button>
        </div>

        {/* Table */}
        <div className="staff_appointment_list_table_wrapper">
          <table className="staff_appointment_list_table">
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
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.location}</td>
                  <td>{row.sqm}</td>
                  <td>{row.agent}</td>
                  <td>{row.image}</td>
                  <td>
                    <button className="staff_appointment_list_iconBtn"><FaEdit /></button>
                    <button className="staff_appointment_list_iconBtn"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Staff_Appointment;

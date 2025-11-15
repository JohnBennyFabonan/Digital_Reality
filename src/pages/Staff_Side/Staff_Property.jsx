import React, { useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./Staff_Property.css";
import Staff_Popup_Listing from "../../components/Staff_Side/Staff_Popup_Listing";

const Staff_Property = () => {
  const [showPopup, setShowPopup] = useState(false);

  const data = [
    { location: "Cuta, Batangas City", sqm: 2000, agent: "Agent 1", image: "image.png" },
    { location: "Calicanto, Batangas City", sqm: 2000, agent: "Agent 2", image: "image.png" },
    { location: "Alangilan, Batangas City", sqm: 2000, agent: "Agent 3", image: "image.png" },
    { location: "Diversion, Batangas City", sqm: 2000, agent: "Agent 4", image: "image.png" },
    { location: "Libjo, Batangas City", sqm: 2000, agent: "Agent 5", image: "image.png" },
  ];

  return (
    <div className="staff_property_container">

      <main className="staff_property_main">

        {/* Add Listing Button */}
        <div className="staff_property_actionbar">
          <button
            className="staff_property_addBtn"
            onClick={() => setShowPopup(true)}
          >
            ADD LISTING
          </button>
        </div>

        {/* Table */}
        <div className="staff_property_table_wrapper">
          <table className="staff_property_table">
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
                    <button className="staff_property_iconBtn"><FaEdit /></button>
                    <button className="staff_property_iconBtn"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popup */}
        {showPopup && (
          <Staff_Popup_Listing onClose={() => setShowPopup(false)} />
        )}

      </main>
    </div>
  );
};

export default Staff_Property;

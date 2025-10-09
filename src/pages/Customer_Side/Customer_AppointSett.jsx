import React, { useState } from "react";
import "./Customer_AppointSett.css";
import Customer_Navbar from "../../components/Customer_Side/Customer_Navbar";

const Customer_AppointSett = () => {
  const [activeTab, setActiveTab] = useState("Pending");

  const lots = [
    {
      id: 1,
      name: "LOT 1",
      location: "Rosario Batangas City",
      sqm: "1000sqm",
      price: "₱2000 per Square Meter",
      agent: "Agent",
    },
    {
      id: 2,
      name: "LOT 1",
      location: "Rosario Batangas City",
      sqm: "1000sqm",
      price: "₱2000 per Square Meter",
      agent: "Agent",
    },
    {
      id: 3,
      name: "LOT 1",
      location: "Rosario Batangas City",
      sqm: "1000sqm",
      price: "₱2000 per Square Meter",
      agent: "Agent",
    },
    {
      id: 4,
      name: "LOT 1",
      location: "Rosario Batangas City",
      sqm: "1000sqm",
      price: "₱2000 per Square Meter",
      agent: "Agent",
    },
  ];

  return (
    <div className="customer_appoint-sett-container">
      <Customer_Navbar />

      {/* Title */}
      <div className="customer_appoint-sett-title">
        <button className="customer_appoint-sett-main-btn">
          My Appointments
        </button>
      </div>

      {/* Tabs */}
      <div className="customer_appoint-sett-tabs">
        {["Pending", "Confirmed", "Done"].map((tab) => (
          <button
            key={tab}
            className={`customer_appoint-sett-tab ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="customer_appoint-sett-cards">
        {lots.map((lot) => (
          <div key={lot.id} className="customer_appoint-sett-card">
            <div className="customer_appoint-sett-image">
              <span className="customer_appoint-sett-rotate">360</span>
            </div>
            <div className="customer_appoint-sett-card-body">
              <h3>{lot.name}</h3>
              <ul>
                <li>Location: {lot.location}</li>
                <li>Square Meter: {lot.sqm}</li>
                <li>Price: {lot.price}</li>
                <li>{lot.agent}</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customer_AppointSett;

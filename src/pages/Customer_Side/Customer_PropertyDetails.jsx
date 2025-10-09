// src/components/Customer_Side/Customer_PropertyDetails.jsx
import React, { useState } from "react";
import './Customer_PropertyDetails.css';
import AppointmentModal from '../../components/Customer_Side/Customer_AppointmentPopup';
import Customer_Navbar from '../../components/Customer_Side/Customer_Navbar';

const Customer_PropertyDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="property-details">
      <Customer_Navbar />
      <main className="customer_prop-det_content">
        {/* Image / 360 View */}
        <div className="customer_prop-det_image-box">
          <span className="customer_prop-det_image-label">360 ↺</span>
        </div>

        {/* Info Section */}
        <div className="customer_prop-det_info-section">
          {/* Description Card */}
          <div className="customer_prop-det_card">
            <h2 className="customer_prop-det_card-title">DESCRIPTION</h2>
            <ul className="customer_prop-det_card-list">
              <li>• Location: Rosario Batangas City</li>
              <li>• Square Meter: 1000sqm</li>
              <li>• Price: P2000 per Square Meter</li>
            </ul>
            <button className="customer_prop-det_card-btn" onClick={() => setIsModalOpen(true)}>BOOK</button>
          </div>
          {isModalOpen && <AppointmentModal onClose={() => setIsModalOpen(false)} />}

          {/* Agent Info Card */}
          <div className="customer_prop-det_card">
            <h2 className="customer_prop-det_card-title">AGENT INFO</h2>
            <ul className="customer_prop-det_card-list">
              <li>• JAMES ANDREI D. NALUZ</li>
              <li>• 0921-345-6789</li>
              <li>• Malitam, Batangas City</li>
              <li>• 3 years of service</li>
              <li>• JAMESNALUZ@gmail.com</li>
            </ul>
            <button className="customer_prop-det_card-btn">CONTACT AGENT</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Customer_PropertyDetails;

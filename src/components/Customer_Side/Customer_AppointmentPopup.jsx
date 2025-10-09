import React from "react";
import "./Customer_AppointmentPopup.css";

const AppointmentModal = ({ onClose }) => {
  return (
    <div className="customer_app-modal-overlay">
      <div className="customer_app-modal-content">
        <button className="customer_app-close-btn" onClick={onClose}>
          &times;
        </button>

        <h3 className="customer_app-modal-title">APPOINTMENT</h3>

        <form className="customer_app-appointment-form">
          <div className="customer_app-form-row">
            <input type="email" placeholder="EMAIL" required />
            <input type="date" required />
          </div>
          <div className="customer_app-form-row">
            <input type="text" placeholder="PHONE NUMBER" required />
            <input type="time" required />
          </div>
          <div className="customer_app-form-row">
            <input type="text" placeholder="AGENT" required />
          </div>
          <div className="customer_app-form-actions">
            <button type="submit" className="customer_app-confirm-btn">
              CONFIRM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;

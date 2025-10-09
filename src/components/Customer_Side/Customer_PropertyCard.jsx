import React from 'react';
import './Customer_PropertyCard.css';
import { useNavigate } from 'react-router-dom';

const Customer_PropertyCard = () => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate('/customer-property-details');
  };

  return (
    <div className="property-card">
      <div className="customer_prop-card_image-placeholder">
        <span>360 ↺</span>
      </div>
      <h4>LOT 1</h4>
      <ul>
        <ol>Location: Rosario Batangas City</ol>
        <ol>Square Meter: 1000sqm</ol>
        <ol>Price: ₱2000 per Square Meter</ol>
      </ul>
      <button className="customer_prop-card_btn" onClick={handleBookClick}>BOOK</button>
    </div>
  );
};

export default Customer_PropertyCard;

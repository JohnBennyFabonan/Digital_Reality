// src/components/Customer_Side/Customer_PropertyDetails.jsx
import React, { useState, useEffect } from "react";
import './Customer_PropertyDetails.css';
import AppointmentModal from '../../components/Customer_Side/Customer_AppointmentPopup';
import Customer_Navbar from '../../components/Customer_Side/Customer_Navbar';
import { useParams } from 'react-router-dom';

const Customer_PropertyDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchPropertyData(id);
    } else {
      setError('No property ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchPropertyData = async (listingId) => {
    try {
      console.log('Fetching property data for ID:', listingId);

      const response = await fetch(`http://localhost:5000/api/properties/${listingId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Property data received:', data);
      
      setPropertyData(data);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error fetching property data');
    } finally {
      setLoading(false);
    }
  };

  // Function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If the URL is already absolute, use it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // If it's a relative path, prepend the server URL
    return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="property-details">
        <Customer_Navbar />
        <div className="loading">Loading property details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-details">
        <Customer_Navbar />
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="property-details">
        <Customer_Navbar />
        <div className="error">No property data found</div>
      </div>
    );
  }

  return (
    <div className="property-details">
      <Customer_Navbar />
      <main className="customer_prop-det_content">
        {/* Image Section */}
        <div className="customer_prop-det_image-container">
          <div className="customer_prop-det_image-box">
            {propertyData.images && propertyData.images.length > 0 ? (
              <div className="customer_prop-det_image-grid">
                {propertyData.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="customer_prop-det_image-wrapper">
                    <img 
                      src={getImageUrl(image.image_url)} 
                      alt={`Property view ${index + 1}`}
                      className="customer_prop-det_image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="customer_prop-det_image-fallback" style={{ display: 'none' }}>
                      Image not available
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-images">No images available</div>
            )}
          </div>
          
          {/* Virtual Tour Link - Placed under the image container */}
          {propertyData.virtual_tour_link && (
            <a 
              href={propertyData.virtual_tour_link} 
              className="customer_prop-det_virtual-tour-link"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Virtual Tour Link: {propertyData.virtual_tour_link}
            </a>
          )}
        </div>

        {/* Info Section */}
        <div className="customer_prop-det_info-section">
          {/* Description Card */}
          <div className="customer_prop-det_card">
            <h2 className="customer_prop-det_card-title">DESCRIPTION</h2>
            <ul className="customer_prop-det_card-list">
              <li>• Location: {propertyData.location || 'Not specified'}</li>
              <li>• Square Meter: {propertyData.lot_area || 'Not specified'}</li>
              <li>• Price: P{propertyData.price || 'Not specified'} per Square Meter</li>
              {propertyData.lot_name && <li>• Lot Name: {propertyData.lot_name}</li>}
              {propertyData.lot_type && <li>• Lot Type: {propertyData.lot_type}</li>}
            </ul>
            <button 
              className="customer_prop-det_card-btn" 
              onClick={() => setIsModalOpen(true)}
            >
              BOOK
            </button>
          </div>
          {isModalOpen && <AppointmentModal onClose={() => setIsModalOpen(false)} />}

          {/* Agent Info Card */}
          <div className="customer_prop-det_card">
            <h2 className="customer_prop-det_card-title">AGENT INFO</h2>
            <ul className="customer_prop-det_card-list">
              <li>• {propertyData.agent_info.name}</li>
              <li>• {propertyData.agent_info.phone}</li>
              <li>• {propertyData.agent_info.email}</li>
            </ul>
            <button className="customer_prop-det_card-btn">CONTACT AGENT</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Customer_PropertyDetails;
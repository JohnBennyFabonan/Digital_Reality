// src/components/Customer_Side/Customer_PropertyDetails.jsx
import React, { useState, useEffect, useCallback } from "react";
import "./Customer_PropertyDetails.css";
import Customer_AppointmentPopup from "../../components/Customer_Side/Customer_AppointmentPopup";
import Customer_Navbar from "../../components/Customer_Side/Customer_Navbar";
import { useParams } from "react-router-dom";

const Customer_PropertyDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  const { id } = useParams();

  // Define fetchPropertyData with useCallback to prevent unnecessary recreations
  const fetchPropertyData = useCallback(async (listingId) => {
    try {
      console.log("Fetching property data for ID:", listingId);

      const response = await fetch(
        `https://reality-corporation.onrender.com/api/properties/${listingId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Property not found");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Property data received:", data);

      setPropertyData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Error fetching property data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get customer ID from localStorage
        const savedId = localStorage.getItem("customerId");
        console.log("Retrieved customerId from localStorage:", savedId);

        if (!savedId) {
          setError("No customer ID found. Please log in again.");
          setLoading(false);
          return;
        }

        setCustomerId(savedId);

        // Fetch property data if ID is available
        if (id) {
          await fetchPropertyData(id);
        } else {
          setError("No property ID provided");
          setLoading(false);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize page data");
        setLoading(false);
      }
    };

    initializeData();
  }, [id, fetchPropertyData]);

  // Rest of your component remains the same...
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    return `https://reality-corporation.onrender.com${
      imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
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
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div
                      className="customer_prop-det_image-fallback"
                      style={{ display: "none" }}
                    >
                      Image not available
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-images">No images available</div>
            )}
          </div>

          {/* Virtual Tour Link */}
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
              <li>• Location: {propertyData.location || "Not specified"}</li>
              <li>
                • Square Meter: {propertyData.lot_area || "Not specified"}
              </li>
              <li>
                • Price: P{propertyData.price || "Not specified"} per Square
                Meter
              </li>
              {propertyData.lot_name && (
                <li>• Lot Name: {propertyData.lot_name}</li>
              )}
              {propertyData.lot_type && (
                <li>• Lot Type: {propertyData.lot_type}</li>
              )}
            </ul>
            <button
              className="customer_prop-det_card-btn"
              onClick={() => {
                if (!customerId) {
                  alert("Please log in to book an appointment");
                  return;
                }
                setIsModalOpen(true);
              }}
            >
              BOOK
            </button>
          </div>
          
          {isModalOpen && customerId && (
            <Customer_AppointmentPopup
              onClose={() => setIsModalOpen(false)}
              customerId={customerId}
              propertyId={propertyData.listing_id}
              propertyData={propertyData}
            />
          )}

          {/* Agent Info Card */}
          <div className="customer_prop-det_card">
            <h2 className="customer_prop-det_card-title">AGENT INFO</h2>
            <ul className="customer_prop-det_card-list">
              <li>• {propertyData.agent_info?.name || "Not specified"}</li>
              <li>• {propertyData.agent_info?.phone || "Not specified"}</li>
              <li>• {propertyData.agent_info?.email || "Not specified"}</li>
            </ul>
            <button className="customer_prop-det_card-btn">
              CONTACT AGENT
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Customer_PropertyDetails;
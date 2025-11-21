import React, { useState, useEffect } from 'react';
import './Customer_PropertyCard.css';
import { useNavigate } from 'react-router-dom';
import Customer_Login from '../Customer_Side/Customer_Login';
import { useAuth } from '../../context/AuthContext';

const Customer_PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, handleLoginSuccess } = useAuth();

  // Fetch images for this property
  useEffect(() => {
    const fetchPropertyImages = async () => {
      if (!property?.listing_id) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:5000/api/property-images/${property.listing_id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (response.ok) {
          // Get up to 4 images
          setImageUrls(data.images.slice(0, 4));
        } else {
          console.error('Failed to fetch images:', data.message);
        }
      } catch (error) {
        console.error('Error fetching property images:', error);
        // If images fail to load, use main_image from property if available
        if (property.main_image) {
          setImageUrls([property.main_image]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyImages();
  }, [property]);

  const handleBookClick = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    // Navigate with the property ID in the URL
    navigate(`/customer-property-details/${property.listing_id}`);
  };

  // Format price to Philippine Peso format
  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Handle image error - fixed version without optional chaining assignment
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const placeholder = e.target.nextElementSibling;
    if (placeholder && placeholder.style) {
      placeholder.style.display = 'flex';
    }
  };

  const handleThumbnailError = (e) => {
    e.target.style.display = 'none';
  };

  // Fallback if no property data
  if (!property) {
    return (
      <div className="customer-property-card customer-property-card-loading">
        <div className="customer-property-card-image-placeholder">Loading property...</div>
        <div className="customer-property-card-content">
          <h4>Loading...</h4>
          <ul className="customer-property-card-details">
            <li><strong>Location:</strong> Loading...</li>
            <li><strong>Lot Area:</strong> Loading...</li>
            <li><strong>Price:</strong> Loading...</li>
          </ul>
          <button className="customer-property-card-btn" disabled>
            LOADING...
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="customer-property-card">
        {/* Property Images */}
        <div className="customer-property-card-images">
          {loading ? (
            <div className="customer-property-card-image-placeholder">Loading images...</div>
          ) : imageUrls.length > 0 ? (
            <div className="customer-property-card-image-gallery">
              {/* Main image */}
              <img 
                src={`http://localhost:5000${imageUrls[0]}`} 
                alt={`${property.lot_name || 'Property'} - ${property.lot_number || ''}`}
                className="customer-property-card-main-image"
                onError={handleImageError}
              />
              {/* Thumbnail images */}
              {imageUrls.length > 1 && (
                <div className="customer-property-card-thumbnails">
                  {imageUrls.slice(1, 4).map((imageUrl, index) => (
                    <img 
                      key={index}
                      src={`http://localhost:5000${imageUrl}`}
                      alt={`${property.lot_name || 'Property'} - ${index + 2}`}
                      className="customer-property-card-thumbnail"
                      onError={handleThumbnailError}
                    />
                  ))}
                </div>
              )}
              {/* Fallback if main image fails to load */}
              <div className="customer-property-card-image-placeholder" style={{ display: 'none' }}>
                No image available
              </div>
            </div>
          ) : (
            <div className="customer-property-card-image-placeholder">No images available</div>
          )}
        </div>

        <h4>{property.lot_name || `LOT ${property.lot_number || 'N/A'}`}</h4>

        <ul className="customer-property-card-details">
          <li><strong>Location:</strong> {property.location || 'Location not specified'}</li>
          <li><strong>Lot Area:</strong> {property.lot_area || 'N/A'} {property.lot_area && 'sqm'}</li>
          <li><strong>Price:</strong> {formatPrice(property.price)}</li>
          {property.lot_type && <li><strong>Type:</strong> {property.lot_type}</li>}
        </ul>

        <button 
          className="customer-property-card-btn"
          onClick={handleBookClick}
          disabled={loading}
        >
          {loading ? 'LOADING...' : 'BOOK VIEWING'}
        </button>
      </div>

      {/* LOGIN POPUP */}
      {showLogin && (
        <Customer_Login 
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Customer_PropertyCard;
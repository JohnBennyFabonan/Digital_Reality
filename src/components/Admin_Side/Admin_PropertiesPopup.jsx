import React from "react";
import "./Admin_PropertiesPopup.css";
import { FaTimes } from "react-icons/fa";

const Admin_PropertiesPopup = ({ property, onClose }) => {
  if (!property) return null;

  return (
    <div className="admin_propertiespopup_overlay">
      <div className="admin_propertiespopup_container">

        <div className="admin_propertiespopup_header">
          <h3>Property Details</h3>
          <FaTimes
            className="admin_propertiespopup_close"
            onClick={onClose}
          />
        </div>

        <div className="admin_propertiespopup_body admin_propertiespopup_flex">

          {/* LEFT SIDE: Image and Link */}
          <div className="admin_propertiespopup_left">
            {property.imageUrl && (
              <div className="admin_propertiespopup_image_container">
                <img 
                  src={property.imageUrl} 
                  alt={property.lot_name} 
                  className="admin_propertiespopup_image"
                />
              </div>
            )}

            {property.linkUrl && (
              <p>
                <strong>More Info: </strong>
                <a 
                  href={property.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="admin_propertiespopup_link"
                >
                  View Listing
                </a>
              </p>
            )}
          </div>

          {/* RIGHT SIDE: Other info */}
          <div className="admin_propertiespopup_right">
            <p><strong>Lot Name:</strong> {property.lot_name}</p>
            <p><strong>Location:</strong> {property.location}</p>
            <p><strong>Type:</strong> {property.lot_type}</p>
            <p><strong>Price:</strong> ₱{parseFloat(property.price).toLocaleString()}</p>
            <p><strong>Area:</strong> {property.lot_area} {property.area_unit}</p>
            <p><strong>Description:</strong> {property.description}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin_PropertiesPopup;

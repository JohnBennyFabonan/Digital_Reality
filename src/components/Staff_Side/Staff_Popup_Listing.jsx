import React from "react";
import "./Staff_Popup_Listing.css";

const Staff_Popup_Listing = ({ onClose }) => {
  return (
    <div className="staff_popup_listing_overlay" onClick={onClose}>
      <div
        className="staff_popup_listing_modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="staff_popup_listing_title">Add Property Listing</h2>

        <div className="staff_popup_listing_form">

          <div className="staff_popup_listing_row">
            <div className="staff_popup_listing_group">
              <label>Name</label>
              <input type="text" />
            </div>

            <div className="staff_popup_listing_group">
              <label>Type</label>
              <input type="text" />
            </div>
          </div>

          <div className="staff_popup_listing_row">
            <div className="staff_popup_listing_group">
              <label>Price</label>
              <input type="number" />
            </div>

            <div className="staff_popup_listing_group">
              <label>Province</label>
              <input type="text" />
            </div>
          </div>

          <div className="staff_popup_listing_row">
            <div className="staff_popup_listing_group">
              <label>Beds</label>
              <input type="number" />
            </div>

            <div className="staff_popup_listing_group">
              <label>Toilet & Bath</label>
              <input type="number" />
            </div>
          </div>

          <div className="staff_popup_listing_row">
            <div className="staff_popup_listing_group">
              <label>Lot Area</label>
              <input type="number" />
            </div>

            <div className="staff_popup_listing_group">
              <label>Floor Area</label>
              <input type="number" />
            </div>
          </div>

          <div className="staff_popup_listing_group_full">
            <label>Location</label>
            <input type="text" />
          </div>

          <div className="staff_popup_listing_group_full">
            <label>Description</label>
            <textarea></textarea>
          </div>

          <div className="staff_popup_listing_group_full">
            <label>Thumbnail</label>
            <input type="file" />
          </div>

        </div>

        <div className="staff_popup_listing_buttons">
          <button className="staff_popup_listing_cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="staff_popup_listing_save">
            Save Listing
          </button>
        </div>
      </div>
    </div>
  );
};

export default Staff_Popup_Listing;

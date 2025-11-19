import React, { useState } from "react";
import "./Staff_AddPropertyModal.css";

const Staff_AddPropertyModal = ({ onClose, isEdit = false, propertyData = null }) => {
  const [formData, setFormData] = useState({
    lot_name: propertyData?.lot_name || "",
    lot_number: propertyData?.lot_number || "",
    lot_type: propertyData?.lot_type || "residential",
    price: propertyData?.price || "",
    province: propertyData?.province || "",
    lot_area: propertyData?.lot_area || "",
    area_unit: propertyData?.area_unit || "sqm",
    location: propertyData?.location || "",
    description: propertyData?.description || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Property Data:", formData);
    // Here you would typically send data to your backend
    onClose(); // Close modal after submission
  };

  const lotTypes = [
    "residential",
    "commercial", 
    "agricultural",
    "industrial",
    "vacant",
    "beachfront",
    "mountain"
  ];

  const provinces = [
    "Batangas",
    "Cavite",
    "Laguna",
    "Rizal",
    "Quezon",
    "Metro Manila",
    "Bulacan",
    "Pampanga"
  ];

  return (
    <div className="staff_property_modal_overlay">
      <div className="staff_property_modal">
        <div className="staff_property_modal_header">
          <h2>{isEdit ? "EDIT PROPERTY" : "ADD PROPERTY"}</h2>
          <button className="staff_property_modal_close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="staff_property_modal_form">
          <div className="staff_property_modal_row">
            <div className="staff_property_modal_field">
              <label>Lot Name *</label>
              <input
                type="text"
                name="lot_name"
                value={formData.lot_name}
                onChange={handleChange}
                placeholder="Enter lot name"
                required
              />
            </div>

            <div className="staff_property_modal_field">
              <label>Lot Number</label>
              <input
                type="text"
                name="lot_number"
                value={formData.lot_number}
                onChange={handleChange}
                placeholder="Enter lot number"
              />
            </div>
          </div>

          <div className="staff_property_modal_row">
            <div className="staff_property_modal_field">
              <label>Lot Type *</label>
              <select
                name="lot_type"
                value={formData.lot_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Lot Type</option>
                {lotTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="staff_property_modal_field">
              <label>Price *</label>
              <div className="staff_property_price_input">
                <span className="staff_property_currency">₱</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div className="staff_property_modal_row">
            <div className="staff_property_modal_field">
              <label>Location/ Address *</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
              >
                <option value="">Select Province</option>
                {provinces.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div className="staff_property_modal_field">
              <label>Lot Area *</label>
              <div className="staff_property_area_input">
                <input
                  type="number"
                  name="lot_area"
                  value={formData.lot_area}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
                <select
                  name="area_unit"
                  value={formData.area_unit}
                  onChange={handleChange}
                >
                  <option value="sqm">Square Meters</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>
          </div>

          <div className="staff_property_modal_field">
            <label>Link</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter the link of your virtual tour"
              rows="4"
            />
          </div>

          <div className="staff_property_modal_actions">
            <button 
              type="button" 
              className="staff_property_modal_cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="staff_property_modal_submit"
            >
              {isEdit ? "UPDATE PROPERTY" : "ADD PROPERTY"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Staff_AddPropertyModal;
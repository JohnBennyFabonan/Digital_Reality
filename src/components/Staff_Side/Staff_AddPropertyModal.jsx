import React, { useState } from "react";
import "./Staff_AddPropertyModal.css";

const Staff_AddPropertyModal = ({
  onClose,
  isEdit = false,
  propertyData = null,
}) => {
  const [formData, setFormData] = useState({
    lot_name: propertyData?.lot_name || "",
    lot_number: propertyData?.lot_number || "",
    lot_type: propertyData?.lot_type || "residential",
    price: propertyData?.price || "",
    province: propertyData?.province || "",
    lot_area: propertyData?.lot_area || "",
    area_unit: propertyData?.area_unit || "sqm",
    location: propertyData?.location || "",
    description: propertyData?.description || "",
    images: [], // multiple images
  });

  // Errors state
  const [errors, setErrors] = useState({});

  const lotTypes = [
    "residential",
    "commercial",
    "agricultural",
    "industrial",
    "vacant",
    "beachfront",
    "mountain",
  ];

  const provinces = [
    "Batangas",
    "Cavite",
    "Laguna",
    "Rizal",
    "Quezon",
    "Metro Manila",
    "Bulacan",
    "Pampanga",
  ];

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: null }));

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload handler - exactly 4 images required
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length !== 4) {
      setErrors((prev) => ({
        ...prev,
        images: "Please upload exactly 4 images.",
      }));
      return;
    }

    // Clear image error if any
    setErrors((prev) => ({ ...prev, images: null }));

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  // Validate all inputs before submit
  const validate = () => {
    const newErrors = {};

    if (!formData.lot_name.trim()) newErrors.lot_name = "Lot Name is required";
    // lot_number optional
    if (!formData.lot_type) newErrors.lot_type = "Lot Type is required";
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0)
      newErrors.price = "Valid Price is required";
    if (!formData.province) newErrors.province = "Province is required";
    if (!formData.lot_area || isNaN(formData.lot_area) || Number(formData.lot_area) <= 0)
      newErrors.lot_area = "Valid Lot Area is required";
    if (formData.images.length !== 4)
      newErrors.images = "Please upload exactly 4 images.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data = new FormData();

    data.append("lot_name", formData.lot_name);
    data.append("lot_number", formData.lot_number);
    data.append("lot_type", formData.lot_type);
    data.append("price", formData.price);
    data.append("province", formData.province);
    data.append("lot_area", formData.lot_area);
    data.append("area_unit", formData.area_unit);
    data.append("location", formData.location);
    data.append("description", formData.description);

    formData.images.forEach((imageFile) => {
      data.append("images", imageFile);
    });

    try {
      const res = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        body: data,
      });

      const response = await res.json();

      if (!res.ok) {
        alert(response.msg || "Failed to add property");
        return;
      }

      alert("Property added successfully! ID: " + response.listing_id);
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error submitting property");
    }
  };

  return (
    <div className="staff_addproperty_modal_overlay">
      <div className="staff_addproperty_modal">
        <div className="staff_addproperty_modal_header">
          <h2>{isEdit ? "EDIT PROPERTY" : "ADD PROPERTY"}</h2>
          <button className="staff_addproperty_modal_close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="staff_addproperty_modal_form" noValidate>
          <div className="staff_addproperty_split">
            {/* LEFT PANEL */}
            <div className="staff_addproperty_left">
              {/* MULTI IMAGE UPLOAD */}
              <div className="staff_addproperty_modal_field">
                <label>Upload Images (exactly 4) *</label>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  required={!isEdit}
                />
                {errors.images && (
                  <small className="staff_addproperty_modal_error_text">{errors.images}</small>
                )}
              </div>

              {/* PREVIEW */}
              {formData.images.length > 0 && (
                <div className="staff_addproperty_image_preview">
                  {formData.images.map((img, i) => (
                    <img key={i} src={URL.createObjectURL(img)} alt="preview" />
                  ))}
                </div>
              )}

              {/* Virtual Tour */}
              <div className="staff_addproperty_modal_field">
                <label>Virtual Tour / Video Link</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter virtual tour link"
                  rows="6"
                />
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="staff_addproperty_right">
              <div className="staff_addproperty_modal_row">
                <div className="staff_addproperty_modal_field">
                  <label>Lot Name *</label>
                  <input
                    type="text"
                    name="lot_name"
                    value={formData.lot_name}
                    onChange={handleChange}
                    required
                    aria-invalid={!!errors.lot_name}
                    aria-describedby="error-lot_name"
                  />
                  {errors.lot_name && (
                    <small id="error-lot_name" className="staff_addproperty_modal_error_text">
                      {errors.lot_name}
                    </small>
                  )}
                </div>

                <div className="staff_addproperty_modal_field">
                  <label>Lot Number</label>
                  <input
                    type="text"
                    name="lot_number"
                    value={formData.lot_number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="staff_addproperty_modal_row">
                <div className="staff_addproperty_modal_field">
                  <label>Lot Type *</label>
                  <select
                    name="lot_type"
                    value={formData.lot_type}
                    onChange={handleChange}
                    required
                    aria-invalid={!!errors.lot_type}
                    aria-describedby="error-lot_type"
                  >
                    {lotTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {errors.lot_type && (
                    <small id="error-lot_type" className="staff_addproperty_modal_error_text">
                      {errors.lot_type}
                    </small>
                  )}
                </div>

                <div className="staff_addproperty_modal_field">
                  <label>Price *</label>
                  <div className="staff_addproperty_price_input">
                    <span className="staff_addproperty_currency">₱</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      aria-invalid={!!errors.price}
                      aria-describedby="error-price"
                    />
                  </div>
                  {errors.price && (
                    <small id="error-price" className="staff_addproperty_modal_error_text">
                      {errors.price}
                    </small>
                  )}
                </div>
              </div>

              <div className="staff_addproperty_modal_row">
                <div className="staff_addproperty_modal_field">
                  <label>Province *</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    aria-invalid={!!errors.province}
                    aria-describedby="error-province"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province}>{province}</option>
                    ))}
                  </select>
                  {errors.province && (
                    <small id="error-province" className="staff_addproperty_modal_error_text">
                      {errors.province}
                    </small>
                  )}
                </div>

                <div className="staff_addproperty_modal_field">
                  <label>Lot Area *</label>
                  <div className="staff_addproperty_area_input">
                    <input
                      type="number"
                      name="lot_area"
                      value={formData.lot_area}
                      onChange={handleChange}
                      min="0"
                      required
                      aria-invalid={!!errors.lot_area}
                      aria-describedby="error-lot_area"
                    />
                    <select
                      name="area_unit"
                      value={formData.area_unit}
                      onChange={handleChange}
                    >
                      <option value="sqm">Sqm</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>
                  {errors.lot_area && (
                    <small id="error-lot_area" className="staff_addproperty_modal_error_text">
                      {errors.lot_area}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="staff_addproperty_modal_actions">
            <button
              type="button"
              className="staff_addproperty_modal_cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="staff_addproperty_modal_submit">
              {isEdit ? "UPDATE PROPERTY" : "ADD PROPERTY"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Staff_AddPropertyModal;

import React, { useState } from "react";
import "./Admin_PropertyOversight.css";
import { FaEye } from "react-icons/fa";
import Admin_PropertiesPopup from "../../components/Admin_Side/Admin_PropertiesPopup";

const Admin_PropertyOversight = () => {
  const [filterStatus, setFilterStatus] = useState("pending"); // default filter
  const [selectedProperty, setSelectedProperty] = useState(null); // for popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // SAMPLE DATA (with status)
  const properties = [
    {
      id: 1,
      lot_name: "Beachfront Paradise",
      location: "Cuta, Batangas City",
      lot_type: "beachfront",
      price: "5000000",
      lot_area: "2000",
      area_unit: "sqm",
      status: "pending",
      description: "Beautiful beachfront property with stunning ocean views",
      imageUrl: "https://example.com/image1.jpg",
      linkUrl: "https://example.com/property/1",
    },
    {
      id: 2,
      lot_name: "Mountain Retreat",
      location: "Calicanto, Batangas City",
      lot_type: "mountain",
      price: "3500000",
      lot_area: "1500",
      area_unit: "sqm",
      status: "approved",
      description: "Peaceful mountain property perfect for vacation home",
    },
    {
      id: 3,
      lot_name: "Cliffside Lot",
      location: "Mabini, Batangas",
      lot_type: "mountain",
      price: "2500000",
      lot_area: "1800",
      area_unit: "sqm",
      status: "declined",
      description: "Lot overlooking the cliff with beautiful views",
    },
  ];

  // Filter listings based on status
  const filteredProperties = properties.filter(
    (property) => property.status === filterStatus
  );

  // Approve and decline handlers (you can expand these)
  const handleApprove = (property) => {
    console.log("Approved:", property);
  };

  const handleDecline = (property) => {
    console.log("Declined:", property);
  };

  // When eye icon clicked, open popup and set selected property
  const openPopup = (property) => {
    setSelectedProperty(property);
    setIsPopupOpen(true);
  };

  // Close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div className="admin_property_container">
      {/* Header with filter words on right */}
      <div className="admin_property_header">
        <h2 className="admin_property_title">LIST OF PROPERTIES</h2>

        <div className="admin_property_status_filter">
          <span
            className={`filter_item ${
              filterStatus === "pending" ? "active_filter" : ""
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </span>

          <span
            className={`filter_item ${
              filterStatus === "approved" ? "active_filter" : ""
            }`}
            onClick={() => setFilterStatus("approved")}
          >
            Approved
          </span>

          <span
            className={`filter_item ${
              filterStatus === "declined" ? "active_filter" : ""
            }`}
            onClick={() => setFilterStatus("declined")}
          >
            Declined
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="admin_reports_table_container">
        <table className="admin_reports_table">
          <thead>
            <tr>
              <th>LOT NAME</th>
              <th>LOCATION</th>
              <th>TYPE</th>
              <th>PRICE</th>
              <th>AREA</th>
              <th>AGENT</th>
              {filterStatus === "pending" && <th>ACTIONS</th>}
            </tr>
          </thead>

          <tbody>
            {filteredProperties.length === 0 ? (
              <tr>
                <td
                  colSpan={filterStatus === "pending" ? 7 : 6}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No listings found for this category.
                </td>
              </tr>
            ) : (
              filteredProperties.map((property) => (
                <tr key={property.id}>
                  <td>{property.lot_name}</td>
                  <td>{property.location}</td>
                  <td>
                    <span
                      className={`admin_property_type admin_property_type_${property.lot_type}`}
                    >
                      {property.lot_type}
                    </span>
                  </td>
                  <td>₱{parseFloat(property.price).toLocaleString()}</td>
                  <td>
                    {property.lot_area} {property.area_unit}
                  </td>
                  <td>Agent 1</td>

                  {/* Show ACTION buttons ONLY if status = pending */}
                  {filterStatus === "pending" && (
                    <td>
                      <button
                        className="admin_action_button_view"
                        onClick={() => openPopup(property)}
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        className="admin_action_button_approve_button"
                        onClick={() => handleApprove(property)}
                      >
                        Approve
                      </button>

                      <button
                        className="admin_action_button_decline_button"
                        onClick={() => handleDecline(property)}
                      >
                        Decline
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Component */}
      {isPopupOpen && selectedProperty && (
        <Admin_PropertiesPopup
          property={selectedProperty}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default Admin_PropertyOversight;

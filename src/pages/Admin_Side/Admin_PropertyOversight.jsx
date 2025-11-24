  import React, { useState, useEffect } from "react";
  import "./Admin_PropertyOversight.css";
  import { FaEye } from "react-icons/fa";
  import Admin_PropertiesPopup from "../../components/Admin_Side/Admin_PropertiesPopup";

  const Admin_PropertyOversight = () => {
    const [filterStatus, setFilterStatus] = useState("Pending"); // default filter
    const [selectedProperty, setSelectedProperty] = useState(null); // for popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sample data as fallback
    const sampleProperties = [
      {
        listing_id: 1,
        lot_name: "Beachfront Paradise",
        location: "Cuta, Batangas City",
        lot_type: "beachfront",
        price: "5000000",
        lot_area: "2000",
        status: "Pending",
        assigned_agent_id: 1,
      },
      {
        listing_id: 2,
        lot_name: "Mountain Retreat",
        location: "Calicanto, Batangas City",
        lot_type: "mountain",
        price: "3500000",
        lot_area: "1500",
        status: "Available",
        assigned_agent_id: 2,
      },
      {
        listing_id: 3,
        lot_name: "Cliffside Lot",
        location: "Mabini, Batangas",
        lot_type: "mountain",
        price: "2500000",
        lot_area: "1800",
        status: "Declined",
        assigned_agent_id: 3,
      },
    ];

    // Fetch properties from API
    useEffect(() => {
      fetchProperties();
    }, []);

    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://reality-corporation.onrender.com/api/admin-properties"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();
        // Format status to have first letter uppercase
        const formattedData = data.map(property => ({
          ...property,
          status: formatStatus(property.status)
        }));
        setProperties(formattedData);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(err.message);
        // Use sample data if API fails
        setProperties(sampleProperties);
      } finally {
        setLoading(false);
      }
    };

    // Format status to have first letter uppercase
    const formatStatus = (status) => {
      if (!status) return '';
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    // Filter listings based on status
    const filteredProperties = properties.filter(
      (property) => property.status === filterStatus
    );

    // Approve and decline handlers
    const handleApprove = async (property) => {
      try {
        console.log("Approving property:", property.listing_id);

        const response = await fetch(
          `https://reality-corporation.onrender.com/api/admin-properties/${property.listing_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "Available",
            }),
          }
        );

        console.log("Response status:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("Update successful:", result);
          fetchProperties(); // Refresh the data
        } else {
          const errorText = await response.text();
          console.error("Update failed:", errorText);
          // Fallback to local update
          const updatedProperties = properties.map((p) =>
            p.listing_id === property.listing_id
              ? { ...p, status: "Available" }
              : p
          );
          setProperties(updatedProperties);
        }
      } catch (err) {
        console.error("Error approving property:", err);
        const updatedProperties = properties.map((p) =>
          p.listing_id === property.listing_id ? { ...p, status: "Available" } : p
        );
        setProperties(updatedProperties);
      }
    };

    const handleDecline = async (property) => {
      try {
        console.log(
          "Declining property:",
          property.listing_id,
          "with status:",
          "Declined"
        );

        const response = await fetch(
          `https://reality-corporation.onrender.com/api/admin-properties/${property.listing_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "Declined",
            }),
          }
        );

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (response.ok) {
          const result = await response.json();
          console.log("Decline successful:", result);
          fetchProperties(); // Refresh the data
        } else {
          const errorText = await response.text();
          console.error(
            "Decline failed - Status:",
            response.status,
            "Response:",
            errorText
          );
          // Fallback to local update
          const updatedProperties = properties.map((p) =>
            p.listing_id === property.listing_id
              ? { ...p, status: "Declined" }
              : p
          );
          setProperties(updatedProperties);
          console.log("Updated locally to Declined");
        }
      } catch (err) {
        console.error("Error declining property:", err);
        const updatedProperties = properties.map((p) =>
          p.listing_id === property.listing_id ? { ...p, status: "Declined" } : p
        );
        setProperties(updatedProperties);
        console.log("Updated locally to Declined after error");
      }
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

    // Format price with commas
    const formatPrice = (price) => {
      return parseFloat(price || 0).toLocaleString();
    };

    // Format lot area (remove unit if included in the string)
    const formatLotArea = (lotArea) => {
      if (typeof lotArea === "string") {
        return lotArea.split(" ")[0]; // Get only the number part
      }
      return lotArea;
    };

    // Format lot type for display
    const formatLotType = (lotType) => {
      if (!lotType) return '';
      return lotType.charAt(0).toUpperCase() + lotType.slice(1).toLowerCase();
    };

    return (
      <div className="admin_property_container">
        {/* Header with filter words on right */}
        <div className="admin_property_header">
          <h2 className="admin_property_title">LIST OF PROPERTIES</h2>

          <div className="admin_property_status_filter">
            <span
              className={`filter_item ${
                filterStatus === "Pending" ? "active_filter" : ""
              }`}
              onClick={() => setFilterStatus("Pending")}
            >
              Pending
            </span>

            <span
              className={`filter_item ${
                filterStatus === "Available" ? "active_filter" : ""
              }`}
              onClick={() => setFilterStatus("Available")}
            >
              Available
            </span>

            <span
              className={`filter_item ${
                filterStatus === "Declined" ? "active_filter" : ""
              }`}
              onClick={() => setFilterStatus("Declined")}
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
                {filterStatus === "Pending" && <th>ACTIONS</th>}
              </tr>
            </thead>

            <tbody>
              {filteredProperties.length === 0 ? (
                <tr>
                  <td
                    colSpan={filterStatus === "Pending" ? 7 : 6}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No listings found for this category.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr key={property.listing_id}>
                    <td>{property.lot_name}</td>
                    <td>{property.location}</td>
                    <td>
                      <span
                        className={`admin_property_type admin_property_type_${property.lot_type}`}
                      >
                        {formatLotType(property.lot_type)}
                      </span>
                    </td>
                    <td>₱{formatPrice(property.price)}</td>
                    <td>{formatLotArea(property.lot_area)} sqm</td>
                    <td>Agent {property.assigned_agent_id}</td>

                    {/* Show ACTION buttons ONLY if status = Pending */}
                    {filterStatus === "Pending" && (
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
import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./Staff_Property.css";
import Staff_AddPropertyModal from "../../components/Staff_Side/Staff_AddPropertyModal";

const Staff_Property = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch properties with agent names from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("https://reality-corporation.onrender.com/api/get/properties");
        if (!res.ok) {
          throw new Error("Failed to fetch properties");
        }
        const result = await res.json();
        
        // Transform data to only include what's needed for the table
        const minimalData = result.map(property => ({
          id: property.listing_id,
          location: property.location,
          sqm: property.lot_area,
          agent_id: property.assigned_agent_id,
          agent_name: property.agent_name, // Using the agent's name
          image: property.image
        }));
        
        setData(minimalData);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="staff_property_container">
      <main className="staff_property_main">
        {/* Add Listing Button */}
        <div className="staff_property_actionbar">
          <button
            className="staff_property_addBtn"
            onClick={() => setShowPopup(true)}
          >
            ADD LISTING
          </button>
        </div>

        {/* Loading & Error */}
        {loading && <p>Loading properties...</p>}
        {error && <p className="error_text">Error: {error}</p>}

        {/* Table */}
        {!loading && !error && (
          <div className="staff_property_table_wrapper">
            <table className="staff_property_table">
              <thead>
                <tr>
                  <th>LOCATION</th>
                  <th>SQUARE METERS</th>
                  <th>AGENTS</th>
                  <th>IMAGE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No properties found.
                    </td>
                  </tr>
                )}
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.location || "-"}</td>
                    <td>{row.sqm || "-"}</td>
                    <td>{row.agent_name || "Unassigned"}</td>
                    <td>
                      {row.image ? (
                        <img
                          src={row.image}
                          alt={`Property at ${row.location}`}
                          style={{ width: "80px", height: "auto" }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>
                      <button className="staff_property_iconBtn">
                        <FaEdit />
                      </button>
                      <button className="staff_property_iconBtn">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Popup */}
        {showPopup && (
          <Staff_AddPropertyModal onClose={() => setShowPopup(false)} />
        )}
      </main>
    </div>
  );
};

export default Staff_Property;
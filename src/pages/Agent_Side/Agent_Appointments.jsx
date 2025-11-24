import React, { useState, useEffect } from "react";
import "./Agent_Appointments.css";

const Agent_Appointments = () => {
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showLotDetails, setShowLotDetails] = useState(false);
  const [lotDetails, setLotDetails] = useState(null);
  const [lotImage, setLotImage] = useState(null);
  const [loadingLotDetails, setLoadingLotDetails] = useState(false);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "https://reality-corporation.onrender.com/api/agent/appointments",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();
      console.log("📋 Appointments data:", data); // Debug log to check structure
      setAllAppointments(data);
      filterAppointmentsByStatus(data, activeTab);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lot details by booking ID - PRIMARY METHOD
  const fetchLotDetailsByBooking = async (bookingId) => {
    try {
      console.log("🔍 Fetching lot details for booking ID:", bookingId);
      setLoadingLotDetails(true);
      setLotDetails(null);
      setLotImage(null);

      // First, try to get lot details using the booking ID endpoint
      const lotResponse = await fetch(
        `https://reality-corporation.onrender.com/api/agent/bookings/${bookingId}/lot`
      );
      
      console.log("📦 Lot details response status:", lotResponse.status);
      
      if (lotResponse.ok) {
        const lotData = await lotResponse.json();
        console.log("✅ Lot details received:", lotData);
        setLotDetails(lotData);

        // Fetch images using the listing_id from lot data
        if (lotData.listing_id) {
          await fetchLotImages(lotData.listing_id);
        } else {
          console.warn("⚠️ No listing_id found in lot details");
        }
      } else {
        console.warn("⚠️ Failed to fetch lot details via booking endpoint");
        // If booking endpoint fails, try to find listing_id in appointment data
        await findListingIdFromAppointment(bookingId);
      }
    } catch (err) {
      console.error("❌ Error fetching lot details:", err);
      await findListingIdFromAppointment(bookingId);
    } finally {
      setLoadingLotDetails(false);
    }
  };

  // Find listing_id from appointment data
  const findListingIdFromAppointment = async (bookingId) => {
    try {
      console.log("🔍 Looking for listing_id in appointment data for booking:", bookingId);
      
      // Find the appointment in our existing data
      const appointment = allAppointments.find(appt => appt.booking_id == bookingId);
      console.log("📋 Found appointment:", appointment);
      
      if (appointment) {
        // Check different possible field names for listing_id
        const listingId = appointment.listing_id || appointment.property_id || appointment.lot_id;
        
        if (listingId) {
          console.log("✅ Found listing_id:", listingId);
          await fetchPropertyDetails(listingId);
        } else {
          console.warn("❌ No listing_id found in appointment. Available fields:", Object.keys(appointment));
          // Show what fields are available for debugging
          console.log("📊 Appointment fields:", appointment);
        }
      } else {
        console.warn("❌ Appointment not found for booking ID:", bookingId);
      }
    } catch (error) {
      console.error("❌ Error finding listing_id:", error);
    }
  };

  // Fetch property details directly by listing_id
  const fetchPropertyDetails = async (listingId) => {
    try {
      console.log("🏠 Fetching property details for listing:", listingId);
      const response = await fetch(
        `https://reality-corporation.onrender.com/api/properties/${listingId}`
      );
      
      if (response.ok) {
        const propertyData = await response.json();
        console.log("✅ Property details received:", propertyData);
        setLotDetails(propertyData);
        await fetchLotImages(listingId);
      } else {
        console.warn("⚠️ Failed to fetch property details, status:", response.status);
      }
    } catch (error) {
      console.error("❌ Error fetching property details:", error);
    }
  };

  // Fetch lot images with CORRECT URL formatting
  const fetchLotImages = async (listingId) => {
    try {
      console.log("🖼️ Fetching images for listing:", listingId);
      
      // Try the last image endpoint first
      try {
        const lastImageResponse = await fetch(
          `https://reality-corporation.onrender.com/api/agent/properties/${listingId}/images/last`
        );
        
        if (lastImageResponse.ok) {
          const imageData = await lastImageResponse.json();
          console.log("✅ Last image received:", imageData);
          
          if (imageData.image_url) {
            const imageUrl = formatImageUrl(imageData.image_url);
            console.log("🖼️ Formatted image URL:", imageUrl);
            setLotImage({
              ...imageData,
              image_url: imageUrl
            });
            return;
          }
        }
      } catch (imageError) {
        console.warn("⚠️ Last image endpoint failed:", imageError);
      }
      
      // Fallback: try all images endpoint
      try {
        console.log("🔄 Trying all images endpoint...");
        const allImagesResponse = await fetch(
          `https://reality-corporation.onrender.com/api/properties/${listingId}/images`
        );
        
        if (allImagesResponse.ok) {
          const allImages = await allImagesResponse.json();
          console.log("✅ All images received:", allImages);
          
          if (allImages.length > 0) {
            // Find first image with image_url
            const firstImageWithUrl = allImages.find(img => img.image_url);
            if (firstImageWithUrl) {
              const imageUrl = formatImageUrl(firstImageWithUrl.image_url);
              console.log("🖼️ Using image from all images:", imageUrl);
              setLotImage({
                ...firstImageWithUrl,
                image_url: imageUrl
              });
              return;
            }
          }
          console.warn("⚠️ No images with image_url found");
        }
      } catch (allImagesError) {
        console.warn("⚠️ All images endpoint failed:", allImagesError);
      }
      
      // If we reach here, no images were found
      console.warn("❌ No images found for listing:", listingId);
      setLotImage(null);
      
    } catch (error) {
      console.error("❌ Error in fetchLotImages:", error);
      setLotImage(null);
    }
  };

  // Format image URL properly - FIXED for backend paths
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    console.log("🔧 Formatting image URL:", imageUrl);
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it starts with /uploads, it's probably from the backend
    if (imageUrl.startsWith('/uploads/')) {
      return `https://reality-corporation.onrender.com${imageUrl}`;
    }
    
    // If it's just a filename, assume it's in uploads
    if (!imageUrl.includes('/')) {
      return `https://reality-corporation.onrender.com/uploads/${imageUrl}`;
    }
    
    // Default: prepend backend URL
    return `https://reality-corporation.onrender.com/${imageUrl}`;
  };

  // Filter appointments by status
  const filterAppointmentsByStatus = (appointmentsData, status) => {
    let filteredAppointments = [];

    switch (status) {
      case "pending":
        filteredAppointments = appointmentsData.filter(
          (appointment) => appointment.bookingstatus === "pending"
        );
        break;
      case "approved":
        filteredAppointments = appointmentsData.filter(
          (appointment) => appointment.bookingstatus === "approved"
        );
        break;
      case "declined":
        filteredAppointments = appointmentsData.filter(
          (appointment) => appointment.bookingstatus === "declined"
        );
        break;
      default:
        filteredAppointments = appointmentsData.filter(
          (appointment) => appointment.bookingstatus === "pending"
        );
    }

    setAppointments(filteredAppointments);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterAppointmentsByStatus(allAppointments, tab);
    setShowDetails(false);
    setShowLotDetails(false);
    setSelectedAppointment(null);
    setLotDetails(null);
    setLotImage(null);
  };

  // Handle approve appointment
  const handleApprove = async (bookingId) => {
    try {
      const response = await fetch(
        `https://reality-corporation.onrender.com/api/agent/appointments/${bookingId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve appointment");
      }

      await fetchAppointments();
      alert("Appointment approved successfully!");
    } catch (err) {
      alert("Error approving appointment: " + err.message);
      console.error("Error approving appointment:", err);
    }
  };

  // Handle decline appointment
  const handleDecline = async (bookingId) => {
    try {
      const response = await fetch(
        `https://reality-corporation.onrender.com/api/agent/appointments/${bookingId}/decline`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to decline appointment");
      }

      await fetchAppointments();
      alert("Appointment declined successfully!");
    } catch (err) {
      alert("Error declining appointment: " + err.message);
      console.error("Error declining appointment:", err);
    }
  };

  // Handle view details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  // Handle view lot details - UPDATED
  const handleViewLotDetails = async (appointment) => {
    console.log("📋 Opening lot details for appointment:", appointment);
    setSelectedAppointment(appointment);
    setShowLotDetails(true);

    // Always use booking ID to fetch lot details
    if (appointment.booking_id) {
      await fetchLotDetailsByBooking(appointment.booking_id);
    } else {
      console.error("❌ No booking_id found in appointment:", appointment);
    }
  };

  // Handle close details
  const handleCloseDetails = () => {
    setShowDetails(false);
    setShowLotDetails(false);
    setSelectedAppointment(null);
    setLotDetails(null);
    setLotImage(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      if (typeof timeString === "string" && 
          (timeString.includes("AM") || timeString.includes("PM"))) {
        return timeString;
      }
      const timeParts = timeString.split(":");
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="agent_appointments_container">
        <div className="agent_appointments_loading">
          Loading appointments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent_appointments_container">
        <div className="agent_appointments_error">
          Error: {error}
          <button
            onClick={fetchAppointments}
            className="agent_appointments_retry_btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="agent_appointments_container">
      {/* Header */}
      <div className="agent_appointments_header">
        <h2 className="agent_appointments_title">AGENT APPOINTMENTS</h2>
      </div>

      {/* Tabs */}
      <div className="agent_appointments_tabs">
        <button
          className={`agent_appointments_tab ${
            activeTab === "pending" ? "agent_appointments_tab_active" : ""
          }`}
          onClick={() => handleTabChange("pending")}
        >
          Pending
        </button>
        <button
          className={`agent_appointments_tab ${
            activeTab === "approved" ? "agent_appointments_tab_active" : ""
          }`}
          onClick={() => handleTabChange("approved")}
        >
          Approved
        </button>
        <button
          className={`agent_appointments_tab ${
            activeTab === "declined" ? "agent_appointments_tab_active" : ""
          }`}
          onClick={() => handleTabChange("declined")}
        >
          Declined
        </button>
      </div>

      {/* Table */}
      <div className="agent_appointments_table_container">
        {appointments.length === 0 ? (
          <div className="agent_appointments_no_data">
            No {activeTab} appointments found.
          </div>
        ) : (
          <table className="agent_appointments_table">
            <thead>
              <tr>
                <th>CLIENT NAME</th>
                <th>CONTACT</th>
                <th>EMAIL</th>
                <th>ADDRESS</th>
                <th>APPOINTMENT DATE</th>
                <th>APPOINTMENT TIME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.booking_id}>
                  <td>
                    {appointment.firstname} {appointment.lastname}
                  </td>
                  <td>{appointment.phonenumber}</td>
                  <td>{appointment.email}</td>
                  <td>{appointment.address}</td>
                  <td>{formatDate(appointment.appointment_date)}</td>
                  <td>{formatTime(appointment.appointment_time)}</td>
                  <td>
                    <div className="agent_appointments_buttons">
                      {activeTab === "pending" && (
                        <>
                          <button
                            onClick={() => handleViewLotDetails(appointment)}
                            className="agent_appointments_btn agent_appointments_btn_lot"
                          >
                            Lot Details
                          </button>
                          <button
                            onClick={() => handleApprove(appointment.booking_id)}
                            className="agent_appointments_btn agent_appointments_btn_approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecline(appointment.booking_id)}
                            className="agent_appointments_btn agent_appointments_btn_decline"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {(activeTab === "approved" || activeTab === "declined") && (
                        <button
                          onClick={() => handleViewDetails(appointment)}
                          className="agent_appointments_btn agent_appointments_btn_view"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="agent_appointments_modal_overlay">
          <div className="agent_appointments_modal">
            <div className="agent_appointments_modal_header">
              <h3>Appointment Details</h3>
              <button
                onClick={handleCloseDetails}
                className="agent_appointments_modal_close"
              >
                ×
              </button>
            </div>
            <div className="agent_appointments_modal_content">
              <div className="agent_appointments_detail_row">
                <span className="agent_appointments_detail_label">Client Name:</span>
                <span className="agent_appointments_detail_value">
                  {selectedAppointment.firstname} {selectedAppointment.lastname}
                </span>
              </div>
              <div className="agent_appointments_detail_row">
                <span className="agent_appointments_detail_label">Contact:</span>
                <span className="agent_appointments_detail_value">
                  {selectedAppointment.phonenumber}
                </span>
              </div>
              <div className="agent_appointments_detail_row">
                <span className="agent_appointments_detail_label">Email:</span>
                <span className="agent_appointments_detail_value">
                  {selectedAppointment.email}
                </span>
              </div>
              <div className="agent_appointments_detail_row">
                <span className="agent_appointments_detail_label">Address:</span>
                <span className="agent_appointments_detail_value">
                  {selectedAppointment.address}
                </span>
              </div>
              <div className="agent_appointments_detail_row">
                <span className="agent_appointments_detail_label">Appointment Date:</span>
                <span className="agent_appointments_detail_value">
                  {formatDate(selectedAppointment.appointment_date)}
                </span>
              </div>
              <div className="agent_appointments_detail_row">
                <span className="agent_appointments_detail_label">Appointment Time:</span>
                <span className="agent_appointments_detail_value">
                  {formatTime(selectedAppointment.appointment_time)}
                </span>
              </div>
              <div className="agent_appointments_detail_row">
                <span className="agent_appointments_detail_label">Status:</span>
                <span className="agent_appointments_detail_value">
                  {selectedAppointment.bookingstatus}
                </span>
              </div>
            </div>
            <div className="agent_appointments_modal_footer">
              <button
                onClick={handleCloseDetails}
                className="agent_appointments_btn agent_appointments_btn_close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lot Details Modal */}
      {showLotDetails && selectedAppointment && (
        <div className="agent_appointments_modal_overlay">
          <div className="agent_appointments_modal agent_appointments_modal_large">
            <div className="agent_appointments_modal_header">
              <h3>Lot Details</h3>
              <button
                onClick={handleCloseDetails}
                className="agent_appointments_modal_close"
              >
                ×
              </button>
            </div>
            <div className="agent_appointments_modal_content">
              {loadingLotDetails ? (
                <div className="agent_appointments_loading">
                  Loading lot details...
                </div>
              ) : (
                <>
                  {/* Lot Image Section */}
                  <div className="agent_appointments_lot_image_container">
                    {lotImage && lotImage.image_url ? (
                      <>
                        <img
                          src={lotImage.image_url}
                          alt={lotDetails?.lot_name || "Lot Image"}
                          className="agent_appointments_lot_image"
                          onError={(e) => {
                            console.error("❌ Image failed to load:", e.target.src);
                            e.target.style.display = 'none';
                            const container = e.target.parentElement;
                            const fallback = document.createElement('div');
                            fallback.className = 'agent_appointments_image_fallback';
                            fallback.textContent = 'Image failed to load';
                            container.appendChild(fallback);
                          }}
                          onLoad={(e) => {
                            console.log("✅ Image loaded successfully:", e.target.src);
                          }}
                        />
                        {lotImage.link && (
                          <a
                            href={lotImage.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="agent_appointments_360_link"
                          >
                            View 360° Tour
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="agent_appointments_image_fallback">
                        No image available for this lot
                      </div>
                    )}
                  </div>

                  {/* Lot Details Section */}
                  {lotDetails ? (
                    <div className="agent_appointments_details_grid">
                      {/* Client Information */}
                      <div className="agent_appointments_details_section">
                        <h4>Client Information</h4>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Name:</span>
                          <span className="agent_appointments_detail_value">
                            {selectedAppointment.firstname} {selectedAppointment.lastname}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Contact:</span>
                          <span className="agent_appointments_detail_value">
                            {selectedAppointment.phonenumber}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Email:</span>
                          <span className="agent_appointments_detail_value">
                            {selectedAppointment.email}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Address:</span>
                          <span className="agent_appointments_detail_value">
                            {selectedAppointment.address}
                          </span>
                        </div>
                      </div>

                      {/* Appointment Information */}
                      <div className="agent_appointments_details_section">
                        <h4>Appointment Information</h4>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Date:</span>
                          <span className="agent_appointments_detail_value">
                            {formatDate(selectedAppointment.appointment_date)}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Time:</span>
                          <span className="agent_appointments_detail_value">
                            {formatTime(selectedAppointment.appointment_time)}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Status:</span>
                          <span className="agent_appointments_detail_value">
                            {selectedAppointment.bookingstatus}
                          </span>
                        </div>
                      </div>

                      {/* Lot Information */}
                      <div className="agent_appointments_details_section">
                        <h4>Lot Information</h4>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Lot Name:</span>
                          <span className="agent_appointments_detail_value">
                            {lotDetails.lot_name || "N/A"}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Lot Number:</span>
                          <span className="agent_appointments_detail_value">
                            {lotDetails.lot_number || "N/A"}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Lot Type:</span>
                          <span className="agent_appointments_detail_value">
                            {lotDetails.lot_type || "N/A"}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Price:</span>
                          <span className="agent_appointments_detail_value">
                            {lotDetails.price ? `₱${lotDetails.price.toLocaleString()}` : "N/A"}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Location:</span>
                          <span className="agent_appointments_detail_value">
                            {lotDetails.location || "N/A"}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Lot Area:</span>
                          <span className="agent_appointments_detail_value">
                            {lotDetails.lot_area ? `${lotDetails.lot_area} sqm` : "N/A"}
                          </span>
                        </div>
                        <div className="agent_appointments_detail_row">
                          <span className="agent_appointments_detail_label">Status:</span>
                          <span className="agent_appointments_detail_value">
                            {lotDetails.status || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="agent_appointments_no_data">
                      No lot details found for this appointment.
                      <br />
                      <small>Booking ID: {selectedAppointment.booking_id}</small>
                      <br />
                      <small>Check the console for detailed error information</small>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="agent_appointments_modal_footer">
              <div className="agent_appointments_lot_actions">
                <button
                  onClick={() => handleApprove(selectedAppointment.booking_id)}
                  className="agent_appointments_btn agent_appointments_btn_approve"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecline(selectedAppointment.booking_id)}
                  className="agent_appointments_btn agent_appointments_btn_decline"
                >
                  Decline
                </button>
                <button
                  onClick={handleCloseDetails}
                  className="agent_appointments_btn agent_appointments_btn_close"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agent_Appointments;
import React, { useState, useEffect } from "react";
import "./Customer_AppointSett.css";
import Customer_Navbar from "../../components/Customer_Side/Customer_Navbar";

// Date formatting utility function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  } catch {
    return "Invalid Date";
  }
};

// Time formatting utility function
const formatTime = (timeString) => {
  if (!timeString) return "N/A";

  try {
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours);
    const period = h >= 12 ? "PM" : "AM";
    const displayHours = h % 12 || 12;

    return `${displayHours}:${minutes} ${period}`;
  } catch {
    return timeString;
  }
};

const Customer_AppointSett = () => {
  const customerId = localStorage.getItem("customerId"); // <-- FIXED (dynamic ID)

  const [activeTab, setActiveTab] = useState("Pending");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) {
      setError("Customer ID not found. Please log in again.");
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `https://reality-corporation.onrender.com/api/bookings/${customerId}?status=${activeTab.toLowerCase()}`;
        console.log("Fetching:", url);

        const res = await fetch(url);

        if (!res.ok)
          throw new Error(`Failed to fetch bookings: ${res.status}`);

        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [activeTab, customerId]);

  return (
    <div className="customer_appoint-sett-container">
      <Customer_Navbar />

      <div className="customer_appoint-sett-title">
        <button className="customer_appoint-sett-main-btn">
          My Appointments
        </button>
      </div>

      {error && (
        <div style={{ color: "red", padding: "10px", margin: "10px" }}>
          Error: {error}
        </div>
      )}

      {loading && <div>Loading...</div>}

      {/* Tabs */}
      <div className="customer_appoint-sett-tabs">
        {["Pending", "Confirmed", "Done"].map((tab) => (
          <button
            key={tab}
            className={`customer_appoint-sett-tab ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="customer_appoint-sett-cards">
        {!loading && bookings.length === 0 ? (
          <p>No {activeTab.toLowerCase()} bookings for customer {customerId}.</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking.booking_id} className="customer_appoint-sett-card">
              <div className="customer_appoint-sett-image">
                <span className="customer_appoint-sett-rotate">360</span>
              </div>

              <div className="customer_appoint-sett-card-body">
                <h3>{booking.lot_name}</h3>
                <ul>
                  <li>Location: {booking.location}</li>
                  <li>Square Meter: {booking.lot_area}</li>
                  <li>Price: {booking.price}</li>
                  <li>
                    Agent: {booking.agent_first_name}{" "}
                    {booking.agent_last_name}
                  </li>
                  <li>Visit Date: {formatDate(booking.visitdate)}</li>
                  <li>Visit Time: {formatTime(booking.visittime)}</li>
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Customer_AppointSett;

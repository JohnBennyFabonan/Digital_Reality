import React, { useEffect, useState } from "react";
import "./Customer_AppointmentPopup.css";

const Customer_AppointmentPopup = ({
  onClose,
  customerId,
  propertyId,
  propertyData,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    agent: "",
    employee_id: "",
    date: "",
    time: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [dateAvailability, setDateAvailability] = useState({});

  // Generate available dates starting 2 days from now (60 days)
  const generateAvailableDates = () => {
    const dates = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2);

    for (let i = 0; i < 60; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Generate hourly time slots excluding lunch (12:00 to 13:00)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 11; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
        "en-US",
        { hour: "numeric", minute: "2-digit", hour12: true }
      );
      slots.push({ value: timeString, display: displayTime });
    }
    for (let hour = 13; hour <= 17; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
        "en-US",
        { hour: "numeric", minute: "2-digit", hour12: true }
      );
      slots.push({ value: timeString, display: displayTime });
    }
    return slots;
  };

  // Fetch employee appointments for a date
  const getEmployeeAppointments = async (employeeId, date) => {
    try {
      const response = await fetch(
        `https://reality-corporation.onrender.com/api/employee-appointments?employee_id=${employeeId}&date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.appointments || {};
      }
      return {};
    } catch (error) {
      console.error("Error fetching employee appointments:", error);
      return {};
    }
  };

  // Get available time slots by filtering out booked ones
  const getAvailableTimeSlots = async (date, employeeId) => {
    if (!date || !employeeId) return [];

    const allSlots = generateTimeSlots();
    const existing = await getEmployeeAppointments(employeeId, date);
    setExistingAppointments(existing);

    const availableSlots = allSlots.filter((slot) => !existing[slot.value]);
    return availableSlots;
  };

  // Update date availability (whether at least one slot is free)
  const updateDateAvailability = async () => {
    if (!formData.employee_id) return;
    const daysInMonth = getDaysInMonth(currentMonth);
    const availability = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dateString = date.toISOString().split("T")[0];

      if (availableDates.includes(dateString)) {
        const slots = await getAvailableTimeSlots(dateString, formData.employee_id);
        availability[dateString] = slots.length > 0;
      } else {
        availability[dateString] = false;
      }
    }
    setDateAvailability(availability);
  };

  // Helpers for calendar
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isDateAvailable = (date) => dateAvailability[date.toISOString().split("T")[0]] || false;
  const isDateSelected = (date) => formData.date === date.toISOString().split("T")[0];

  // Handle date selection on calendar
  const handleDateSelect = async (date) => {
    if (!isDateAvailable(date)) return;
    const dateString = date.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: dateString, time: "" }));
    setSelectedDate(dateString);
  };

  // Handle user selecting time slot
  const handleTimeSelect = (time) => {
    setFormData((prev) => ({ ...prev, time }));
  };

  // Navigate calendar months
  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // Render calendar days grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + 2);

    const days = [];

    // Empty cells before month start
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isAvailable = isDateAvailable(date);
      const isSelected = isDateSelected(date);
      const isPast = date < minDate;

      let dayClass = "calendar-day";
      if (isSelected) dayClass += " selected";
      if (!isAvailable || isPast) dayClass += " disabled";
      else dayClass += " available";

      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => !isPast && isAvailable && handleDateSelect(date)}
        >
          {day}
          {isAvailable && !isPast && <div className="available-dot"></div>}
        </div>
      );
    }

    return days;
  };

  // Load initial data (customer, agent, employee_id, etc.)
  useEffect(() => {
    if (!customerId || !propertyData) return;

    setLoading(true);
    fetch(
      `https://reality-corporation.onrender.com/api/appointment-info?customer_id=${customerId}&listing_id=${propertyData.listing_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setFormData((prev) => ({
          ...prev,
          email: data.email,
          phone: data.phonenumber,
          agent:
            data.agent_firstname && data.agent_lastname
              ? `${data.agent_firstname} ${data.agent_lastname}`
              : "No agent assigned",
          employee_id: data.employee_id || "",
        }));
        setAvailableDates(generateAvailableDates());
      })
      .catch(() => setError("Failed to load appointment info"))
      .finally(() => setLoading(false));
  }, [customerId, propertyData]);

  // Update date availability on employee or month or availableDates change
  useEffect(() => {
    if (formData.employee_id && availableDates.length > 0) {
      updateDateAvailability();
    }
  }, [formData.employee_id, currentMonth, availableDates]);

  // Update available time slots when date changes
  useEffect(() => {
    const updateTimeSlots = async () => {
      if (formData.date && formData.employee_id) {
        const slots = await getAvailableTimeSlots(formData.date, formData.employee_id);
        setAvailableTimeSlots(slots);

        // Reset selected time if not available anymore
        if (formData.time && !slots.find((slot) => slot.value === formData.time)) {
          setFormData((prev) => ({ ...prev, time: "" }));
        }
      } else {
        setAvailableTimeSlots([]);
        setExistingAppointments({});
      }
    };

    updateTimeSlots();
  }, [formData.date, formData.employee_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      alert("Please select both date and time");
      return;
    }
    if (!formData.employee_id) {
      alert("No agent assigned to this property.");
      return;
    }

    const bookingData = {
      customer_id: customerId,
      listing_id: propertyId,
      employee_id: formData.employee_id,
      visitdate: formData.date,
      visittime: formData.time,
    };

    try {
      const response = await fetch("https://reality-corporation.onrender.com/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error(`Booking failed: ${response.status}`);

      const data = await response.json();
      alert("Appointment booked successfully!");
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book appointment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="customer_app-modal-overlay">
        <div className="customer_app-modal-content">
          <div className="loading">Loading appointment details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer_app-modal-overlay">
      <div className="customer_app-modal-content">
        <button className="customer_app-close-btn" onClick={onClose}>
          &times;
        </button>

        <h3 className="customer_app-modal-title">SCHEDULE APPOINTMENT</h3>

        {error && <div className="customer_app-error">{error}</div>}

        <form className="customer_app-appointment-form" onSubmit={handleSubmit}>
          <div className="customer_app-form-row">
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              placeholder="Email Address"
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              readOnly
              placeholder="Phone Number"
            />
          </div>

          <div className="customer_app-form-row">
            <input
              type="text"
              name="agent"
              value={formData.agent}
              readOnly
              placeholder="Assigned Agent"
            />
          </div>

          {/* Calendar Section */}
          <div className="calendar-section">
            <h4>Select Date</h4>
            <div className="calendar-container">
              <div className="calendar-header">
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={() => navigateMonth(-1)}
                >
                  ‹
                </button>
                <span className="calendar-month">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={() => navigateMonth(1)}
                >
                  ›
                </button>
              </div>

              <div className="calendar-weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-grid">{renderCalendar()}</div>
            </div>
          </div>

          {/* Time Slots Section */}
          {formData.date && (
            <div className="time-slots-section">
              <div className="time-slots-container">
                {generateTimeSlots().length > 0 ? (
                  <div className="time-slots-grid">
                    {generateTimeSlots().map((slot) => {
                      const isBooked = !!existingAppointments?.[slot.value];
                      const isSelected = formData.time === slot.value;

                      return (
                        <button
                          key={slot.value}
                          type="button"
                          className={`time-slot-btn ${
                            isBooked ? "booked" : isSelected ? "selected" : ""
                          }`}
                          disabled={isBooked}
                          onClick={() => !isBooked && handleTimeSelect(slot.value)}
                          title={isBooked ? "Booked" : "Available"}
                        >
                          {slot.display}
                          {isBooked && <span className="booked-label">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-slots-message">
                    No available time slots for this date. Please select another date.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="customer_app-schedule-info">
            <p>
              <strong>Available Hours:</strong> 8:00 AM - 5:00 PM
            </p>
            <p>
              <strong>Lunch Break:</strong> 12:00 PM - 1:00 PM
            </p>
            <p>
              <strong>Earliest Appointment:</strong> 2 days from today
            </p>
            <p>
              <strong>Time Slots:</strong> Hourly intervals
            </p>
          </div>

          <div className="customer_app-form-actions">
            <button
              type="submit"
              className="customer_app-confirm-btn"
              disabled={!formData.date || !formData.time}
            >
              CONFIRM APPOINTMENT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Customer_AppointmentPopup;

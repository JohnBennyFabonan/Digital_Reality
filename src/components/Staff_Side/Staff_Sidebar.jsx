import React from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaBuilding, FaCalendarAlt } from "react-icons/fa";
import "./Staff_Sidebar.css";

const Staff_Sidebar = () => {
  return (
    <aside className="staff_dashboard_sidebar">
      <div className="staff_dashboard_sidebar_header">
        <h2>Staff Panel</h2>
      </div>
      <ul>
        <li>
          <NavLink
            to="."
            end
            className={({ isActive }) =>
              "staff_dashboard_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaTachometerAlt className="staff_dashboard_icon" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="property"
            className={({ isActive }) =>
              "staff_dashboard_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaBuilding className="staff_dashboard_icon" />
            <span>Property</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="appointment"
            className={({ isActive }) =>
              "staff_dashboard_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaCalendarAlt className="staff_dashboard_icon" />
            <span>Appointment</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Staff_Sidebar;

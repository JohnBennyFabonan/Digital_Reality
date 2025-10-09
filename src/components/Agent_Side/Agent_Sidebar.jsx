import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaUserCog,
} from "react-icons/fa";
import "./Agent_Sidebar.css";

const Agent_Sidebar = () => {
  return (
    <aside className="agent_sidebar_container">
      <div className="agent_sidebar_header">
        <h2>Agent Panel</h2>
      </div>
      <ul>
        <li>
          <NavLink
            to="."
            end
            className={({ isActive }) =>
              "agent_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaTachometerAlt className="agent_sidebar_icon" />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="appointments"
            className={({ isActive }) =>
              "agent_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaCalendarAlt className="agent_sidebar_icon" />
            <span>Appointments</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="clients"
            className={({ isActive }) =>
              "agent_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaUsers className="agent_sidebar_icon" />
            <span>Client Details</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="profile"
            className={({ isActive }) =>
              "agent_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaUserCog className="agent_sidebar_icon" />
            <span>Profile Management</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Agent_Sidebar;

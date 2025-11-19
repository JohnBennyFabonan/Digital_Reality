import React from "react";
import { NavLink } from "react-router-dom";
import { FaUsers, FaBuilding, FaChartBar } from "react-icons/fa"; // icons
import { MdDashboard } from "react-icons/md";
import "./Admin_Sidebar.css";

const Admin_Sidebar = () => {
  return (
    <aside className="admin_dashboard_sidebar">
      <div className="admin_dashboard_sidebar_header">
        <h2>Admin Panel</h2>
      </div>
      <ul>
        <li>
          <NavLink
            to="."
            end
            className={({ isActive }) =>
              "admin_dashboard_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <MdDashboard  className="sidebar_icon" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="user-management"
            className={({ isActive }) =>
              "admin_dashboard_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaUsers className="sidebar_icon" />
            <span>User Management</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="properties"
            className={({ isActive }) =>
              "admin_dashboard_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaBuilding className="sidebar_icon" />
            <span>Property Oversight</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="reports"
            className={({ isActive }) =>
              "admin_dashboard_sidebar_item" + (isActive ? " active" : "")
            }
          >
            <FaChartBar className="sidebar_icon" />
            <span>Reports & Analytics</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Admin_Sidebar;

// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Customer Pages
import Customer_PropertyDetails from "./pages/Customer_Side/Customer_PropertyDetails";
import Customer_AppointSett from "./pages/Customer_Side/Customer_AppointSett";
import Customer_AccountSett from "./pages/Customer_Side/Customer_AccountSett";
import Customer_LandingPage from "./pages/Customer_Side/Customer_LandingPage";

// Admin Pages
import Admin_Layout from "./pages/Admin_Side/Admin_Layout";
import Admin_UserManagement from "./pages/Admin_Side/Admin_UserManagement";
import Admin_Dashboard from "./pages/Admin_Side/Admin_Dashboard";
import Admin_PropertyOversight from "./pages/Admin_Side/Admin_PropertyOversight";
import Admin_Reports from "./pages/Admin_Side/Admin_Reports";

// Staff Pages
import Staff_Layout from "./pages/Staff_Side/Staff_Layout";
import Staff_Dashboard from "./pages/Staff_Side/Staff_Dashboard";
import Staff_Property from "./pages/Staff_Side/Staff_Property";
import Staff_Appointment from "./pages/Staff_Side/Staff_Appointment";

// Agent Pages
import Agent_Layout from "./pages/Agent_Side/Agent_Layout";
import Agent_Dashboard from "./pages/Agent_Side/Agent_Dashboard";
import Agent_Appointments from "./pages/Agent_Side/Agent_Appointments";
import Agent_Clients from "./pages/Agent_Side/Agent_Clients";
import Agent_Profile from "./pages/Agent_Side/Agent_Profile";

// 🔹 Real Estate Login Page
import RealEstate_Login from "./pages/Admin_Side/RealState_Login";

function App() {
  return (
    <Routes>
      {/* 🔹 Real Estate Login Route */}
      <Route path="/realestate-login" element={<RealEstate_Login />} />

      {/* Customer Routes */}
      <Route path="/" element={<Customer_LandingPage />} />
      <Route path="/customer-property-details" element={<Customer_PropertyDetails />} />
      <Route path="/customer-appointment-sett" element={<Customer_AppointSett />} />
      <Route path="/customer-account-sett" element={<Customer_AccountSett />} />

      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={<Admin_Layout />}>
        <Route index element={<Admin_Dashboard />} />
        <Route path="user-management"  element={<Admin_UserManagement />} />
        <Route path="properties" element={<Admin_PropertyOversight />} />
        <Route path="reports" element={<Admin_Reports />} />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff-dashboard" element={<Staff_Layout />}>
        <Route index element={<Staff_Dashboard />} />
        <Route path="property" element={<Staff_Property />} />
        <Route path="appointment" element={<Staff_Appointment />} />
      </Route>

      {/* Agent Routes */}
      <Route path="/agent-dashboard" element={<Agent_Layout />}>
        <Route index element={<Agent_Dashboard />} />
        <Route path="appointments" element={<Agent_Appointments />} />
        <Route path="clients" element={<Agent_Clients />} />
        <Route path="profile" element={<Agent_Profile />} />
      </Route>
    </Routes>
  );
}

export default App;

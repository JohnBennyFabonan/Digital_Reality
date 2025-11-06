import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../../pages/Admin_Side/Admin_Dashboard.css";

const Admin_StaffTable = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchStaff = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/staff");
      const data = await res.json();
      setStaffData(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch immediately
  fetchStaff();

  // Re-fetch every 5 seconds
  const interval = setInterval(fetchStaff, 5000);

  // Cleanup when component unmounts
  return () => clearInterval(interval);
}, []);

  return (
    <div className="admin_client-rec_table_container">
      <table className="admin_client-rec_table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>ADDRESS</th>
            <th>PHONE</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="4">Loading staff data...</td></tr>
          ) : staffData.length > 0 ? (
            staffData.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.address}</td>
                <td>{row.phone}</td>
                <td>
                  <span className="admin_client-rec_action_icon"><FaEdit /></span>
                  <span className="admin_client-rec_action_icon"><FaTrash /></span>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No staff found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Admin_StaffTable;

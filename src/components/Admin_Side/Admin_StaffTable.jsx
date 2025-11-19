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

    fetchStaff();

    const interval = setInterval(fetchStaff, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin_client-rec_table_container">
      <table className="admin_client-rec_table">
        <thead>
          <tr>
            <th>FIRST NAME</th>
            <th>LAST NAME</th>
            <th>PHONE</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4">Loading staff data...</td>
            </tr>
          ) : staffData.length > 0 ? (
            staffData.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.firstname}</td>
                <td>{staff.lastname}</td>
                <td>{staff.phonenumber}</td>
                <td>
                  <span className="admin_client-rec_action_icon">
                    <FaEdit />
                  </span>
                  <span className="admin_client-rec_action_icon">
                    <FaTrash />
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No staff found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Admin_StaffTable;

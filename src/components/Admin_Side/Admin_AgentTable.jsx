import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../../pages/Admin_Side/Admin_Dashboard.css";

const Admin_AgentTable = () => {
  const [agentData, setAgentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/agents");
        const data = await res.json();
        setAgentData(data);
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
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
            <tr>
              <td colSpan="4">Loading agent data...</td>
            </tr>
          ) : agentData.length > 0 ? (
            agentData.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.address}</td>
                <td>{row.phone}</td>
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
              <td colSpan="4">No agents found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Admin_AgentTable;

import React, { useState } from "react";
import "./Admin_AddStaffModal.css";

const Admin_AddStaffModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Staff"); // default role
  const [image, setImage] = useState(null); // optional

  const handleSubmit = async (e) => {
    e.preventDefault();

    const staffData = { name, email, phone, address, username, password, role, image };

    try {
      const res = await fetch("http://localhost:5000/api/add-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Staff added successfully!");
        onClose(); // close modal after success
      } else {
        alert(data.msg || "Error adding staff");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="admin_addstaff_modal_overlay">
      <div className="admin_addstaff_modal">
        <button className="admin_addstaff_close" onClick={onClose}>
          ✖
        </button>

        <div className="admin_addstaff_content">
          <div className="admin_addstaff_upload">
            <div className="admin_addstaff_avatar"></div>
            <label htmlFor="fileUpload" className="admin_addstaff_upload_label">
              Upload a photo
            </label>
            <input
              type="file"
              id="fileUpload"
              hidden
              onChange={(e) => {
                // Simple file URL placeholder
                const file = e.target.files[0];
                if (file) setImage(URL.createObjectURL(file));
              }}
            />
            <button
              type="button"
              className="admin_addstaff_browse"
              onClick={() => document.getElementById("fileUpload").click()}
            >
              Browse
            </button>
          </div>

          {/* Main form */}
          <form className="admin_addstaff_form" onSubmit={handleSubmit}>
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label>Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <label>Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />

            <div className="admin_addstaff_acc">
              <div className="admin_addstaff_field">
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="admin_addstaff_field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="admin_addstaff_actions">
              <button type="submit" className="admin_addstaff_add">
                ADD
              </button>
              <button type="button" className="admin_addstaff_cancel" onClick={onClose}>
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin_AddStaffModal;

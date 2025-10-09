import React from "react";
import "./Admin_AddStaffModal.css";

const Admin_AddStaffModal = ({ onClose }) => {
  return (
    <div className="admin_addstaff_modal_overlay">
      <div className="admin_addstaff_modal">
        {/* Close button */}
        <button className="admin_addstaff_close" onClick={onClose}>
          ✖
        </button>

        <div className="admin_addstaff_content">
          {/* Upload Section */}
          <div className="admin_addstaff_upload">
            <div className="admin_addstaff_avatar"></div>
            <label htmlFor="fileUpload" className="admin_addstaff_upload_label">
              Upload a photo
            </label>
            <input type="file" id="fileUpload" hidden />
            <button className="admin_addstaff_browse">Browse</button>
          </div>

          {/* Form Section */}
          <form className="admin_addstaff_form">
            <label>Name</label>
            <input type="text" />

            <label>Email</label>
            <input type="email" />

            <label>Phone</label>
            <input type="text" />

            <label>Address</label>
            <input type="text" />

            <form className="admin_addstaff_acc">
              <div className="admin_addstaff_field">
                <label>Username</label>
                <input type="text" />
              </div>

              <div className="admin_addstaff_field">
                <label>Password</label>
                <input type="password" />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="admin_addstaff_actions">
              <button type="submit" className="admin_addstaff_add">
                ADD
              </button>
              <button
                type="button"
                className="admin_addstaff_cancel"
                onClick={onClose}
              >
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

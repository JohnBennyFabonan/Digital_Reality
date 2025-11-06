import React, { useState, useEffect } from "react";
import "./Admin_AddStaffModal.css";

const Admin_AddStaffModal = ({ onClose, roleType }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roleType);
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    setRole(roleType);
  }, [roleType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic empty field check
    if (!name || !email || !phone || !address || !username || !password) {
      setPhoneError("");
      setEmailError("");
      return;
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }

    // ✅ Phone validation (must be 11 digits)
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Phone number must be exactly 11 digits.");
      return;
    } else {
      setPhoneError("");
    }

    setLoading(true);
    setSuccess(false);

    const formData = {
      name,
      email,
      phone,
      address,
      username,
      password,
      role,
      image,
    };

    try {
      const res = await fetch("http://localhost:5000/api/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 2000);
      } else {
        setLoading(false);
        alert(data.msg || `Error adding ${role}`);
      }
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
      alert("Server error");
    }
  };

  return (
    <div className="admin_addstaff_modal_overlay">
      <div className="admin_addstaff_modal">
        <button
          className="admin_addstaff_close"
          onClick={onClose}
          title="Close"
        >
          ✖
        </button>

        <div className="admin_addstaff_content">
          {loading ? (
            <div className="admin_loading_popup">
              {!success ? (
                <>
                  <div className="admin_spinner"></div>
                  <p>Processing...</p>
                </>
              ) : (
                <>
                  <div className="admin_success_ring">
                    <svg className="admin_success_svg" viewBox="0 0 50 50">
                      <circle
                        className="admin_success_bg"
                        cx="25"
                        cy="25"
                        r="20"
                      />
                      <circle
                        className="admin_success_progress"
                        cx="25"
                        cy="25"
                        r="20"
                      />
                    </svg>
                  </div>
                  <p>{role} Added Successfully!</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="admin_addstaff_upload">
                <div
                  className="admin_addstaff_avatar"
                  style={{
                    backgroundImage: image ? `url(${image})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!image && "📷"}
                </div>

                <label
                  htmlFor="fileUpload"
                  className="admin_addstaff_upload_label"
                >
                  Upload a photo
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
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

              <form className="admin_addstaff_form" onSubmit={handleSubmit}>
                <h3 className="admin_addstaff_title">Add {role}</h3>

                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {emailError && (
                  <span className="admin_field_error">{emailError}</span>
                )}

                <label>Phone</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 11) setPhone(val);
                  }}
                  required
                />
                {phoneError && (
                  <span className="admin_field_error">{phoneError}</span>
                )}

                <label>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                <div className="admin_addstaff_acc">
                  <div className="admin_addstaff_field">
                    <label>Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin_addstaff_field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <input type="hidden" value={role} readOnly />

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin_AddStaffModal;

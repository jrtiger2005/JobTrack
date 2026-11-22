
import { useEffect, useState } from "react";
import "./Profile.css";

function Profile({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "https://jobtrack-backend-yl5a.onrender.com/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Could not load profile.");
        }

        const data = await response.json();
        setProfile(data);
        setName(data.name);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        "https://jobtrack-backend-yl5a.onrender.com/api/users/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        throw new Error("Profile update failed.");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>{error || "Profile unavailable."}</p>;
     const handleChangePassword = async (e) => {
  e.preventDefault();
  setPasswordMessage("");

  if (newPassword.length < 8) {
    setPasswordMessage("Password must be at least 8 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordMessage("New passwords do not match.");
    return;
  }

  try {
    const response = await fetch(
      "https://jobtrack-backend-yl5a.onrender.com/api/users/change-password",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    const message = await response.text();

    if (!response.ok) {
      throw new Error(message);
    }

    setPasswordMessage("Password changed successfully!");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    setPasswordMessage(error.message);
  }
   };
  return (
    <div className="profile-page">
      <button className="profile-back" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="profile-card">
        <h1>My Profile</h1>
        <p>Manage your personal information.</p>

        <div className="profile-avatar">
          {profile.name?.charAt(0).toUpperCase()}
        </div>

        <form onSubmit={handleUpdate}>
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email Address</label>
          <input type="email" value={profile.email} disabled />

          <label>User ID</label>
          <input value={profile.id} disabled />

          {error && <p className="profile-error">{error}</p>}
          {success && <p className="profile-success">{success}</p>}

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

    <div className="change-password-section">
     <h2>Change Password</h2>
     <p>Update your password to keep your account secure.</p>

      <form onSubmit={handleChangePassword}>
       <label>Current Password</label>
      <input
      type="password"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      placeholder="Enter current password"
      required
    />

    <label>New Password</label>
    <input
      type="password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      placeholder="Enter new password"
      minLength={8}
      required
    />

    <label>Confirm New Password</label>
    <input
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="Confirm new password"
      required
    />

    {passwordMessage && (
      <p className="password-message">{passwordMessage}</p>
    )}

    <button type="submit">Update Password</button>
   </form>
  </div>

      </div>
    </div>
  );
}

export default Profile;

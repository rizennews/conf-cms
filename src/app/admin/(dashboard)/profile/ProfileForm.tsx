"use client";

import { useState } from "react";
import { authClient } from "../../../../lib/auth-client";

export default function ProfileForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    
    // Better Auth client method to change password
    const { data, error: err } = await authClient.changePassword({
      newPassword: newPassword,
      currentPassword: currentPassword,
      revokeOtherSessions: true
    });

    setLoading(false);

    if (err) {
      setError(err.message || "Failed to change password. Make sure your current password is correct.");
    } else {
      setMessage("Password successfully updated! All other devices have been logged out.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
      {error && <div style={{ padding: "0.75rem", background: "#fef2f2", color: "#ef4444", borderRadius: "6px", fontSize: "0.9rem" }}>{error}</div>}
      {message && <div style={{ padding: "0.75rem", background: "#f0fdf4", color: "#16a34a", borderRadius: "6px", fontSize: "0.9rem" }}>{message}</div>}

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>Current Password</label>
        <input 
          required 
          type="password" 
          value={currentPassword} 
          onChange={e => setCurrentPassword(e.target.value)} 
          style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db" }} 
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>New Password</label>
        <input 
          required 
          type="password" 
          value={newPassword} 
          onChange={e => setNewPassword(e.target.value)} 
          style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db" }} 
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>Confirm New Password</label>
        <input 
          required 
          type="password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db" }} 
        />
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        style={{ marginTop: "1rem", padding: "0.75rem", background: "#111", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

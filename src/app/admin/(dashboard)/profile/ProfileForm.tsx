"use client";

import { useState } from "react";
import { authClient } from "../../../../lib/auth-client";
import { useRouter } from "next/navigation";

export default function ProfileForm({ activeSessions = [], currentToken = "" }: { activeSessions?: any[], currentToken?: string }) {
  const router = useRouter();
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
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Current Password</label>
        <input 
          required 
          type="password" 
          value={currentPassword} 
          onChange={e => setCurrentPassword(e.target.value)} 
          style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} 
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>New Password</label>
        <input 
          required 
          type="password" 
          value={newPassword} 
          onChange={e => setNewPassword(e.target.value)} 
          style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} 
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Confirm New Password</label>
        <input 
          required 
          type="password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} 
        />
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        style={{ marginTop: "1rem", padding: "0.75rem", background: "#111", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>

      <div style={{ marginTop: "3rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111", marginBottom: "0.5rem" }}>Active Sessions</h3>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem" }}>These devices are currently logged into your account.</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {activeSessions.map((session) => (
            <div key={session.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid #eaeaea", borderRadius: "8px", background: session.token === currentToken ? "#f8fafc" : "#fff" }}>
              <div>
                <div style={{ fontWeight: 500, color: "#111", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {session.userAgent ? (session.userAgent.includes("Mac") ? "Mac" : session.userAgent.includes("Win") ? "Windows" : session.userAgent.includes("iPhone") ? "iPhone" : session.userAgent.includes("Android") ? "Android" : "Unknown Device") : "Unknown Device"}
                  {session.token === currentToken && (
                    <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", background: "#dbeafe", color: "#1d4ed8", borderRadius: "99px", fontWeight: 600 }}>This Device</span>
                  )}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
                  IP: {session.ipAddress || "Unknown"} • Logged in: {new Date(session.createdAt).toLocaleDateString()}
                </div>
              </div>
              {session.token !== currentToken && (
                <button 
                  type="button"
                  onClick={async () => {
                    const confirm = window.confirm("Are you sure you want to log out this device?");
                    if (!confirm) return;
                    await authClient.revokeSession({ token: session.token });
                    router.refresh();
                  }}
                  style={{ background: "transparent", color: "#ef4444", border: "1px solid #fecaca", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}
                >
                  Log Out
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

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

  const [activeTab, setActiveTab] = useState("account");
  const [logoutConfirmToken, setLogoutConfirmToken] = useState<string | null>(null);

  return (
    <div style={{ marginTop: "1rem" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "2rem", borderBottom: "1px solid #eaeaea", marginBottom: "2rem" }}>
        <button 
          onClick={() => setActiveTab("account")}
          style={{ padding: "0.75rem 0", background: "none", border: "none", borderBottom: activeTab === "account" ? "2px solid #111" : "2px solid transparent", color: activeTab === "account" ? "#111" : "#666", fontWeight: activeTab === "account" ? 600 : 500, cursor: "pointer", fontSize: "0.95rem" }}
        >
          Account
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          style={{ padding: "0.75rem 0", background: "none", border: "none", borderBottom: activeTab === "security" ? "2px solid #111" : "2px solid transparent", color: activeTab === "security" ? "#111" : "#666", fontWeight: activeTab === "security" ? 600 : 500, cursor: "pointer", fontSize: "0.95rem" }}
        >
          Security
        </button>
        <button 
          onClick={() => setActiveTab("sessions")}
          style={{ padding: "0.75rem 0", background: "none", border: "none", borderBottom: activeTab === "sessions" ? "2px solid #111" : "2px solid transparent", color: activeTab === "sessions" ? "#111" : "#666", fontWeight: activeTab === "sessions" ? 600 : 500, cursor: "pointer", fontSize: "0.95rem" }}
        >
          Active Sessions
        </button>
      </div>

      {activeTab === "account" && (
        <div style={{ maxWidth: "500px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", marginBottom: "1.5rem" }}>Account Information</h3>
          {/* Note: In a real app, you would pass the name/email as props if you wanted them editable, but we're just displaying here since it was asked to be formatted well. */}
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Account details are managed through the master dashboard.</p>
        </div>
      )}

      {activeTab === "security" && (
        <div style={{ maxWidth: "450px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", marginBottom: "0.5rem" }}>Change Password</h3>
          <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Update your password to keep your account secure.</p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && <div style={{ padding: "0.75rem", background: "#fef2f2", color: "#ef4444", borderRadius: "6px", fontSize: "0.9rem" }}>{error}</div>}
            {message && <div style={{ padding: "0.75rem", background: "#f0fdf4", color: "#16a34a", borderRadius: "6px", fontSize: "0.9rem" }}>{message}</div>}

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Current Password</label>
              <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>New Password</label>
              <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Confirm New Password</label>
              <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: "0.5rem", padding: "0.85rem", background: "#111", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "sessions" && (
        <div style={{ maxWidth: "600px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", marginBottom: "0.5rem" }}>Active Sessions</h3>
          <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Manage the devices currently logged into your account.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {activeSessions.map((session) => (
              <div key={session.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", border: "1px solid #eaeaea", borderRadius: "12px", background: session.token === currentToken ? "#f8fafc" : "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div>
                  <div style={{ fontWeight: 500, color: "#111", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    {session.userAgent ? (session.userAgent.includes("Mac") ? "Mac OS" : session.userAgent.includes("Win") ? "Windows" : session.userAgent.includes("iPhone") ? "iPhone" : session.userAgent.includes("Android") ? "Android" : "Unknown Device") : "Unknown Device"}
                    {session.token === currentToken && (
                      <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", background: "#dbeafe", color: "#1d4ed8", borderRadius: "99px", fontWeight: 600 }}>This Device</span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>IP: {session.ipAddress || "Unknown"}</div>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.15rem" }}>Logged in: {new Date(session.createdAt).toLocaleDateString()}</div>
                </div>
                {session.token !== currentToken && (
                  <button type="button" onClick={() => setLogoutConfirmToken(session.token)} style={{ background: "transparent", color: "#ef4444", border: "1px solid #fecaca", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, transition: "background 0.2s" }}>
                    Log Out
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {logoutConfirmToken && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", maxWidth: "400px", width: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#111", fontWeight: 600 }}>Log Out Device?</h3>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "2rem" }}>
              Are you sure you want to log out this specific device? It will immediately lose access to your account.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button 
                onClick={() => setLogoutConfirmToken(null)}
                style={{ padding: "0.6rem 1.25rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer", fontWeight: 500, color: "#374151" }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await authClient.revokeSession({ token: logoutConfirmToken });
                  setLogoutConfirmToken(null);
                  router.refresh();
                }}
                style={{ padding: "0.6rem 1.25rem", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
              >
                Log Out Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateUserRole, addUser } from "./actions";

export default function StaffTable({ users, branches }: { users: any[]; branches: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "branch_head",
    branchId: ""
  });

  const handleRoleChange = async (userId: string, newRole: string, currentBranchId: string | null) => {
    setLoadingId(userId);
    await updateUserRole(userId, newRole, currentBranchId);
    setLoadingId(null);
  };

  const handleBranchChange = async (userId: string, role: string, newBranchId: string) => {
    setLoadingId(userId);
    await updateUserRole(userId, role, newBranchId);
    setLoadingId(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await addUser(formData);
    setIsSubmitting(false);
    if (res.error) {
      alert(res.error);
    } else {
      setShowAddModal(false);
      setFormData({ name: "", email: "", password: "", role: "branch_head", branchId: "" });
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ background: "#2b3ff2", color: "white", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 4px rgba(43, 63, 242, 0.2)" }}
        >
          + Add New User
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Name</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Email</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Role</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Assigned Branch</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#f9fafb"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#6b7280" }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: "#111" }}>{u.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1rem 1.5rem", color: "#4b5563" }}>
                  {u.email}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <select 
                    value={u.role} 
                    onChange={e => handleRoleChange(u.id, e.target.value, u.branchId)}
                    disabled={loadingId === u.id}
                    style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", fontSize: "0.9rem", color: "#111" }}
                  >
                    <option value="super_admin">Super Admin (Full Access)</option>
                    <option value="admin">Admin (Events & Regs)</option>
                    <option value="data_team">Data Team (Read Only)</option>
                    <option value="branch_head">Branch Head (Local Only)</option>
                  </select>
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  {u.role === "branch_head" ? (
                    <select 
                      value={u.branchId || ""} 
                      onChange={e => handleBranchChange(u.id, u.role, e.target.value)}
                      disabled={loadingId === u.id}
                      style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", fontSize: "0.9rem", color: "#111" }}
                    >
                      <option value="">Select Branch...</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "0.9rem", fontStyle: "italic" }}>
                      N/A (Global Access)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {showAddModal && (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
        <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "450px" }}>
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111" }}>Add New User</h2>
          <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Temporary Password</label>
              <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }}>
                <option value="super_admin">Super Admin (Full Access)</option>
                <option value="admin">Admin (Events & Regs)</option>
                <option value="data_team">Data Team (Read Only)</option>
                <option value="branch_head">Branch Head (Local Only)</option>
              </select>
            </div>

            {formData.role === "branch_head" && (
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem", color: "#111" }}>Assign Branch</label>
                <select required value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }}>
                  <option value="">Select Branch...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#111" }}>Cancel</button>
              <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "0.75rem", background: "#111", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                {isSubmitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}

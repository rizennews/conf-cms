"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, UserCheck, UserX, User, Search } from "lucide-react";

interface Invitee {
  id: string | number;
  fullName: string;
  whatsapp: string | null;
  status: string;
  createdAt: Date | string;
}

interface EvangelistData {
  name: string;
  totalInvited: number;
  checkedInCount: number;
  invitees: Invitee[];
}

export default function EvangelistTable({ data }: { data: EvangelistData[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredData = data.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}>
      {/* Toolbar */}
      <div style={{ padding: "1.25rem", borderBottom: "1px solid #eaeaea", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "250px", background: "#f9fafb", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <Search size={18} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search evangelists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.95rem" }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #eaeaea" }}>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Evangelist Name</th>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Invited</th>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Checked In</th>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "3rem 1rem", textAlign: "center", color: "#6b7280" }}>
                  No evangelists found.
                </td>
              </tr>
            ) : (
              filteredData.map((ev, i) => (
                <React.Fragment key={ev.name + i}>
                  <tr 
                    style={{ borderBottom: expandedRow === ev.name ? "none" : "1px solid #eaeaea", cursor: "pointer", background: expandedRow === ev.name ? "#fafafa" : "#fff", transition: "background 0.2s" }}
                    onClick={() => setExpandedRow(expandedRow === ev.name ? null : ev.name)}
                    onMouseOver={e => { if (expandedRow !== ev.name) e.currentTarget.style.background = "#f9fafb" }}
                    onMouseOut={e => { if (expandedRow !== ev.name) e.currentTarget.style.background = "#fff" }}
                  >
                    <td style={{ padding: "1.25rem", fontWeight: 500, color: "#111" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb" }}>
                           <User size={16} color="#111" />
                        </div>
                        {ev.name}
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem", color: "#374151", fontWeight: 500 }}>
                      {ev.totalInvited}
                    </td>
                    <td style={{ padding: "1.25rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 600, background: ev.checkedInCount > 0 ? "rgba(16, 185, 129, 0.1)" : "#f3f4f6", color: ev.checkedInCount > 0 ? "#10b981" : "#6b7280" }}>
                        {ev.checkedInCount} / {ev.totalInvited}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem", textAlign: "right" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "0.5rem", borderRadius: "6px" }}>
                        {expandedRow === ev.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedRow === ev.name && (
                    <tr style={{ background: "#fafafa", borderBottom: "1px solid #eaeaea" }}>
                      <td colSpan={4} style={{ padding: "0 1.25rem 1.5rem 1.25rem" }}>
                        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                <th style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textAlign: "left" }}>Invitee Name</th>
                                <th style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textAlign: "left" }}>Phone / WhatsApp</th>
                                <th style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textAlign: "left" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ev.invitees.map((invitee) => (
                                <tr key={invitee.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: "#111", fontWeight: 500 }}>
                                    {invitee.fullName}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: "#374151" }}>
                                    {invitee.whatsapp || "N/A"}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}>
                                    {invitee.status === "checked-in" ? (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#10b981", fontWeight: 600, fontSize: "0.8rem" }}>
                                        <UserCheck size={14} /> Checked In
                                      </span>
                                    ) : (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#ef4444", fontWeight: 600, fontSize: "0.8rem" }}>
                                        <UserX size={14} /> Not Arrived
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

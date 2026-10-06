"use client";

import React, { useState } from "react";
import { Search, Activity, User, Clock, Info, Filter, ChevronDown, ChevronUp, RotateCcw, AlertCircle } from "lucide-react";
import { recoverRegistration } from "./actions";

interface LogData {
  id: number;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  details: string | null;
  createdAt: Date | string;
}

export default function LogsTable({ initialLogs }: { initialLogs: LogData[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isRecovering, setIsRecovering] = useState<number | null>(null);

  // Extract unique actions for the filter dropdown
  const uniqueActions = ["All", ...Array.from(new Set(initialLogs.map(log => log.action)))];

  const filteredLogs = initialLogs.filter(log => {
    const matchesSearch = 
      (log.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesAction = selectedAction === "All" || log.action === selectedAction;
    
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('delete') || lower.includes('remove')) return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
    if (lower.includes('create') || lower.includes('add')) return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
    if (lower.includes('update') || lower.includes('edit')) return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
    if (lower.includes('check')) return { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' };
    return { bg: '#f3f4f6', text: '#374151' };
  };

  const formatJSON = (details: string | null) => {
    if (!details) return "No additional details provided.";
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  const getLogName = (details: string | null) => {
    if (!details) return "—";
    try {
      const parsed = JSON.parse(details);
      if (parsed.name) return parsed.name;
      return "—";
    } catch {
      return "—";
    }
  };

  const handleRecover = async (logId: number) => {
    if (!confirm("Are you sure you want to recover this deleted record?")) return;
    setIsRecovering(logId);
    const res = await recoverRegistration(logId);
    setIsRecovering(null);
    if (res.error) {
      alert(res.error);
    } else {
      alert("Successfully recovered!");
    }
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}>
      {/* Toolbar */}
      <div style={{ padding: "1.25rem", borderBottom: "1px solid #eaeaea", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", background: "#fafafa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "250px", background: "#fff", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)" }}>
          <Search size={18} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search by user or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.95rem" }}
          />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} color="#6b7280" />
          <select 
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            style={{ padding: "0.6rem 2rem 0.6rem 1rem", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", fontSize: "0.9rem", color: "#374151", cursor: "pointer", outline: "none", appearance: "none", backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1em" }}
          >
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#fff", borderBottom: "1px solid #eaeaea" }}>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>User / Actor</th>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Action</th>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Timestamp</th>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Record Name</th>
              <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "4rem 1rem", textAlign: "center", color: "#6b7280" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <Activity size={32} color="#d1d5db" />
                    <p style={{ margin: 0, fontSize: "0.95rem" }}>No activity logs found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const colors = getActionColor(log.action);
                const isExpanded = expandedRow === log.id;
                
                return (
                  <React.Fragment key={log.id}>
                    <tr 
                      style={{ borderBottom: isExpanded ? "none" : "1px solid #eaeaea", cursor: "pointer", background: isExpanded ? "#fafafa" : "#fff", transition: "all 0.2s" }}
                      onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                      onMouseOver={e => { if (!isExpanded) e.currentTarget.style.background = "#f9fafb" }}
                      onMouseOut={e => { if (!isExpanded) e.currentTarget.style.background = "#fff" }}
                    >
                      <td style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb" }}>
                             <User size={16} color="#4b5563" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#111", fontSize: "0.95rem" }}>{log.userName || "System"}</div>
                            <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>{log.userEmail || "System automated"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "0.35rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", background: colors.bg, color: colors.text }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4b5563", fontSize: "0.9rem" }}>
                          <Clock size={14} color="#9ca3af" />
                          {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem", color: "#666", fontSize: "0.85rem", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: 600, color: "#111" }}>{getLogName(log.details)}</span>
                      </td>
                      <td style={{ padding: "1.25rem", textAlign: "right" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0.5rem", borderRadius: "6px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#111"} onMouseOut={e => e.currentTarget.style.color = "#9ca3af"}>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr style={{ background: "#fafafa", borderBottom: "1px solid #eaeaea" }}>
                        <td colSpan={5} style={{ padding: "0 1.25rem 1.5rem 1.25rem" }}>
                          <div style={{ background: "#111", borderRadius: "8px", padding: "1.25rem", overflowX: "auto", position: "relative" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#a1a1aa", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                                <Info size={14} /> Log Payload Data
                              </div>
                              {log.action.includes("delete-registration") && (
                                <button 
                                  onClick={() => handleRecover(log.id)}
                                  disabled={isRecovering === log.id}
                                  style={{ background: "#2b3ff2", color: "#fff", border: "none", padding: "0.4rem 1rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: isRecovering === log.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem", opacity: isRecovering === log.id ? 0.7 : 1 }}
                                >
                                  <RotateCcw size={14} /> {isRecovering === log.id ? "Recovering..." : "Recover Record"}
                                </button>
                              )}
                            </div>
                            <pre style={{ margin: 0, color: "#e4e4e7", fontSize: "0.85rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                              {formatJSON(log.details)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

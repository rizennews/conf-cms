"use client";

import { useState } from "react";
import { Download, Upload, Printer } from "lucide-react";
import Link from "next/link";

export default function RegistrationsTable({ data, events, branches = [], canBulkUpload }: { data: Record<string, unknown>[]; events: Record<string, unknown>[]; branches?: Record<string, unknown>[]; canBulkUpload?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadEvent, setUploadEvent] = useState(events[0]?.id || "");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<Record<string, unknown> | null>(null);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printEventId, setPrintEventId] = useState("");
  const [viewRegistration, setViewRegistration] = useState<Record<string, unknown> | null>(null);

  const filteredData = data.filter(r => {
    const matchesSearch = (r.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent ? r.eventId === filterEvent : true;
    const matchesBranch = filterBranch ? r.branchId === filterBranch : true;
    return matchesSearch && matchesEvent && matchesBranch;
  });

  const handleBulkUpload = async () => {
    if (!csvFile || !uploadEvent) return;
    setUploading(true);
    setUploadResult(null);
    const text = await csvFile.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    const rows = lines.slice(1).map(line => {
      // Basic CSV splitting (doesn't handle quotes with commas inside perfectly, but good enough for simple uploads)
      const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
      const row: Record<string, unknown> = {};
      const customData: Record<string, string> = {};
      const standardFields = ["fullName", "email", "whatsapp", "address", "branchId", "ageRange", "registrantStatus"];
      
      headers.forEach((h, i) => {
        if (standardFields.includes(h)) {
          row[h] = values[i] || null;
        } else {
          customData[h] = values[i] || "";
        }
      });
      row.customData = JSON.stringify(customData);
      return row;
    }).filter(r => r.fullName || r.email || r.customData !== "{}");
    
    const { bulkInsertRegistrations } = await import("./actions");
    const result = await bulkInsertRegistrations(rows, uploadEvent);
    setUploadResult(result);
    setUploading(false);
  };

  const downloadTemplate = () => {
    const headers = ["fullName", "email", "whatsapp", "address", "branchId", "ageRange", "registrantStatus"];
    const targetEvent = events.find(e => e.id === uploadEvent);
    
    if (targetEvent?.customFields) {
      try {
        const fields = JSON.parse(targetEvent.customFields);
        fields.forEach((f: Record<string, unknown>) => {
          if (!headers.includes(f.label as string)) {
            headers.push(f.label as string);
          }
        });
      } catch { /* ignore */ }
    }

    const csv = headers.join(",") + "\n" + headers.map(h => {
      if (h === "fullName") return "John Doe";
      if (h === "email") return "john@example.com";
      if (h === "whatsapp") return "0241234567";
      if (h === "address") return "Accra";
      if (h === "branchId") return "main-branch";
      if (h === "ageRange") return "25-34";
      if (h === "registrantStatus") return "Member";
      return "Sample Answer";
    }).join(",");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template-${targetEvent?.slug || "registrations"}.csv`;
    a.click();
  };

  return (
    <>
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", flex: 1, minWidth: "200px" }}
          />
          <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)} style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", minWidth: "200px", flex: 1 }}>
            <option value="">All Events</option>
            {events.map(e => <option key={e.id as string} value={e.id as string}>{(e.name as string) || (e.id as string)}</option>)}
          </select>
          {branches && branches.length > 0 && (
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", minWidth: "200px", flex: 1 }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id as string} value={b.id as string}>{b.name as string}</option>)}
            </select>
          )}
          <Link href="/api/export-csv" style={{ padding: "0.75rem 1.25rem", borderRadius: "6px", border: "1px solid #d1d5db", fontWeight: 600, textDecoration: "none", color: "#111", background: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Download size={16} /> Download CSV
          </Link>
          
          <button 
            onClick={() => {
              if (filterEvent) {
                window.open(`/admin/print-nametags?eventId=${filterEvent}`, '_blank');
              } else {
                setShowPrintModal(true);
              }
            }}
            style={{ padding: "0.75rem 1.25rem", background: "white", color: "#111", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Printer size={16} /> Print Nametags
          </button>

          {canBulkUpload && (
            <button onClick={() => setShowUpload(true)} style={{ padding: "0.75rem 1.25rem", background: "#2b3ff2", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Upload size={16} /> Bulk Upload
            </button>
          )}
        </div>

        <div style={{ padding: "0.75rem 1.5rem", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: "0.9rem" }}>
          Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> registrations
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Registrant</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Branch</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Event</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Date</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>No registrations found.</td></tr>
              )}
              {filteredData.map(r => {
                const event = events.find(e => e.id === r.eventId);
                const branch = branches.find(b => b.id === r.branchId);
                const isCheckedIn = r.status === "checked-in";
                
                let displayBranch = branch?.name || r.branchId || "Unknown";
                if (r.branchId === "other" && r.customData) {
                  try {
                    const custom = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
                    if (custom.specifiedBranch) {
                      displayBranch = `Other (${custom.specifiedBranch})`;
                    }
                  } catch { /* ignore */ }
                }

                return (
                  <tr key={r.id as string} style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", color: "#3730a3", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem" }}>
                          {((r.fullName as string) || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#111", fontSize: "0.95rem" }}>{(r.fullName as React.ReactNode) || "—"}</div>
                          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>{(r.email as React.ReactNode) || "No Email"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "1.1rem" }}>📱</span> {(r.whatsapp as React.ReactNode) || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ display: "inline-block", background: "#f1f5f9", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", color: "#475569", fontWeight: 500, border: "1px solid #e2e8f0" }}>
                        {displayBranch as React.ReactNode}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.9rem", fontWeight: 500 }}>
                      {(event?.name as React.ReactNode) || (r.eventId as React.ReactNode) || "—"}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-start" }}>
                        <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600, background: isCheckedIn ? "#dcfce7" : "#fef9c3", color: isCheckedIn ? "#16a34a" : "#854d0e" }}>
                          {isCheckedIn ? "✓ Checked In" : "Pending"}
                        </span>
                        {r.registrantStatus && r.registrantStatus !== "Unknown" && (
                          <span style={{ fontSize: "0.75rem", color: "#6b7280", background: "#f3f4f6", padding: "0.1rem 0.5rem", borderRadius: "4px" }}>
                            {r.registrantStatus as React.ReactNode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#6b7280", fontSize: "0.85rem" }}>
                      {r.createdAt ? new Date(r.createdAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <button onClick={() => setViewRegistration(r)} style={{ padding: "0.4rem 0.8rem", background: "white", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; }} onMouseLeave={e => { e.currentTarget.style.background = "white"; }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showUpload && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "500px" }}>
            <h2 style={{ marginTop: 0, color: "#111" }}>Bulk Upload Registrations</h2>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", fontSize: "0.9rem", color: "#111" }}>
              <strong>CSV Format:</strong> <code style={{ background: "#e0f2fe", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>fullName, email, whatsapp, address, branchId, ageRange</code>
              <br/>
              <button onClick={downloadTemplate} style={{ marginTop: "0.75rem", background: "none", border: "1px solid #7dd3fc", borderRadius: "6px", padding: "0.4rem 0.75rem", color: "#0284c7", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Download size={14} /> Download Template
              </button>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#111" }}>Target Event</label>
              <select value={uploadEvent} onChange={e => setUploadEvent(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }}>
                {events.map(e => <option key={e.id as string} value={e.id as string}>{(e.name as string) || (e.id as string)}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#111" }}>Upload CSV File</label>
              <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} style={{ width: "100%", padding: "0.75rem", border: "1px dashed #d1d5db", borderRadius: "6px", color: "#111" }} />
            </div>
            {uploadResult && (
              <div style={{ padding: "1rem", borderRadius: "8px", marginBottom: "1rem", background: uploadResult.error ? "#fef2f2" : "#f0fdf4", color: uploadResult.error ? "#ef4444" : "#16a34a" }}>
                {uploadResult.error ? `Error: ${uploadResult.error}` : `✓ Inserted ${uploadResult.inserted} registrations!`}
              </div>
            )}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => { setShowUpload(false); setUploadResult(null); setCsvFile(null); }} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#111" }}>Cancel</button>
              <button onClick={handleBulkUpload} disabled={!csvFile || uploading} style={{ flex: 1, padding: "0.75rem", background: uploading ? "#9ca3af" : "#111", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                {uploading ? "Uploading..." : "Upload & Import"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showPrintModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: 0, color: "#111", fontSize: "1.25rem", marginBottom: "1rem" }}>Print Nametags</h2>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              Please select the event you want to print nametags for.
            </p>
            <select 
              value={printEventId} 
              onChange={e => setPrintEventId(e.target.value)} 
              style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff", marginBottom: "1.5rem" }}
            >
              <option value="">Select Event...</option>
              {events.map(e => <option key={e.id as string} value={e.id as string}>{(e.name as string) || (e.id as string)}</option>)}
            </select>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                onClick={() => { setShowPrintModal(false); setPrintEventId(""); }} 
                style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#111" }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (printEventId) {
                    window.open(`/admin/print-nametags?eventId=${printEventId}`, '_blank');
                    setShowPrintModal(false);
                    setPrintEventId("");
                  }
                }} 
                disabled={!printEventId}
                style={{ flex: 1, padding: "0.75rem", background: printEventId ? "#111" : "#9ca3af", color: "white", border: "none", borderRadius: "8px", cursor: printEventId ? "pointer" : "not-allowed", fontWeight: 600 }}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {viewRegistration && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, color: "#111", fontSize: "1.25rem" }}>Registration Details</h2>
              <button onClick={() => setViewRegistration(null)} style={{ background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}>&times;</button>
            </div>
            
            <div style={{ display: "grid", gap: "1rem", color: "#374151", fontSize: "0.95rem" }}>
              <div><strong style={{ color: "#111", display: "block", marginBottom: "0.2rem" }}>Name:</strong> {(viewRegistration.fullName as React.ReactNode) || "—"}</div>
              <div><strong style={{ color: "#111", display: "block", marginBottom: "0.2rem" }}>Email:</strong> {(viewRegistration.email as React.ReactNode) || "—"}</div>
              <div><strong style={{ color: "#111", display: "block", marginBottom: "0.2rem" }}>Phone/WhatsApp:</strong> {(viewRegistration.whatsapp as React.ReactNode) || "—"}</div>
              <div><strong style={{ color: "#111", display: "block", marginBottom: "0.2rem" }}>Age Range:</strong> {(viewRegistration.ageRange as React.ReactNode) || "—"}</div>
              <div><strong style={{ color: "#111", display: "block", marginBottom: "0.2rem" }}>Registrant Status:</strong> {(viewRegistration.registrantStatus as React.ReactNode) || "—"}</div>
              <div><strong style={{ color: "#111", display: "block", marginBottom: "0.2rem" }}>Check-in Status:</strong> {viewRegistration.status === 'checked-in' ? "Checked In" : "Registered"}</div>
              
              {viewRegistration.customData && (() => {
                try {
                  const custom = typeof viewRegistration.customData === 'string' ? JSON.parse(viewRegistration.customData) : viewRegistration.customData;
                  const keys = Object.keys(custom);
                  if (keys.length === 0) return null;
                  
                  return (
                    <div style={{ marginTop: "1rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                      <h3 style={{ fontSize: "1rem", color: "#111", marginBottom: "1rem", marginTop: 0 }}>Form Fields</h3>
                      <div style={{ display: "grid", gap: "1rem" }}>
                        {keys.map(k => (
                          <div key={k}>
                            <strong style={{ color: "#111", display: "block", marginBottom: "0.2rem" }}>{k}:</strong> 
                            {(custom as Record<string, string>)[k] || "—"}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch {
                  return <div>Error parsing custom fields.</div>;
                }
              })()}
            </div>
            
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setViewRegistration(null)} style={{ padding: "0.75rem 1.5rem", background: "#111", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

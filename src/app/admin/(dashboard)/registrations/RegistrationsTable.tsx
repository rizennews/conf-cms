"use client";

import { useState } from "react";
import { Download, Upload, Printer } from "lucide-react";

export default function RegistrationsTable({ data, events, canBulkUpload }: { data: any[]; events: any[]; canBulkUpload?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadEvent, setUploadEvent] = useState(events[0]?.id || "");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const filteredData = data.filter(r => {
    const matchesSearch = (r.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent ? r.eventId === filterEvent : true;
    return matchesSearch && matchesEvent;
  });

  const handleBulkUpload = async () => {
    if (!csvFile || !uploadEvent) return;
    setUploading(true);
    setUploadResult(null);
    const text = await csvFile.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    const rows = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
      const row: any = {};
      headers.forEach((h, i) => { row[h] = values[i] || null; });
      return row;
    }).filter(r => r.fullName || r.email);
    const { bulkInsertRegistrations } = await import("./actions");
    const result = await bulkInsertRegistrations(rows, uploadEvent);
    setUploadResult(result);
    setUploading(false);
  };

  const downloadTemplate = () => {
    const csv = "fullName,email,whatsapp,address,branchId,ageRange\nJohn Doe,john@example.com,0241234567,Accra,main-branch,25-34";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registration-template.csv";
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
          <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)} style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", minWidth: "200px" }}>
            <option value="">All Events</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name || e.id}</option>)}
          </select>
          <a href="/api/export-csv" style={{ padding: "0.75rem 1.25rem", borderRadius: "6px", border: "1px solid #d1d5db", fontWeight: 600, textDecoration: "none", color: "#111", background: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Download size={16} /> Download CSV
          </a>
          
          <button 
            onClick={() => {
              if (!filterEvent) {
                alert("Please select a specific event from the dropdown first to print nametags.");
                return;
              }
              window.open(`/admin/print-nametags?eventId=${filterEvent}`, '_blank');
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
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Name</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Email</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Phone</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Branch</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Event</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Status</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>No registrations found.</td></tr>
              )}
              {filteredData.map(r => {
                const event = events.find(e => e.id === r.eventId);
                const isCheckedIn = r.status === "checked-in";
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "1rem 1.5rem", fontWeight: 500, color: "#111" }}>{r.fullName || "—"}</td>
                    <td style={{ padding: "1rem 1.5rem", color: "#4b5563" }}>{r.email || "—"}</td>
                    <td style={{ padding: "1rem 1.5rem", color: "#4b5563" }}>{r.whatsapp || "—"}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ display: "inline-block", background: "#f3f4f6", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem", color: "#374151" }}>{r.branchId || "Unknown"}</span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.9rem" }}>{event?.name || r.eventId || "—"}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600, background: isCheckedIn ? "#dcfce7" : "#fef9c3", color: isCheckedIn ? "#16a34a" : "#854d0e" }}>
                        {isCheckedIn ? "✓ Checked In" : "Registered"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.9rem" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
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
                {events.map(e => <option key={e.id} value={e.id}>{e.name || e.id}</option>)}
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
    </>
  );
}

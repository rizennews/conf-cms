"use client";

import { useState, useMemo } from "react";
import { Download, Upload, Printer, Trash2, Pencil, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type RegRecord = Record<string, unknown>;

type SortKey = "fullName" | "email" | "whatsapp" | "createdAt" | "status";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

export default function RegistrationsTable({ data, events, branches = [], canBulkUpload, isSuperAdmin }: { data: RegRecord[]; events: RegRecord[]; branches?: RegRecord[]; canBulkUpload?: boolean; isSuperAdmin?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadEvent, setUploadEvent] = useState(events[0]?.id || "");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<RegRecord | null>(null);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printEventId, setPrintEventId] = useState("");
  const [viewRegistration, setViewRegistration] = useState<RegRecord | null>(null);
  const [editRegistration, setEditRegistration] = useState<RegRecord | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = useMemo(() => {
    return data.filter(r => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        ((r.fullName as string) || "").toLowerCase().includes(term) ||
        ((r.email as string) || "").toLowerCase().includes(term) ||
        ((r.whatsapp as string) || "").toLowerCase().includes(term);
      const matchesEvent = filterEvent ? r.eventId === filterEvent : true;
      const matchesBranch = filterBranch ? r.branchId === filterBranch : true;
      return matchesSearch && matchesEvent && matchesBranch;
    });
  }, [data, searchTerm, filterEvent, filterBranch]);

  // Sort
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const valA = (a[sortKey] as string) || "";
      const valB = (b[sortKey] as string) || "";
      if (sortKey === "createdAt") {
        const dA = new Date(valA).getTime() || 0;
        const dB = new Date(valB).getTime() || 0;
        return sortDir === "asc" ? dA - dB : dB - dA;
      }
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return sorted;
  }, [filteredData, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = sortedData.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handleDelete = async (id: number) => {
    const { deleteRegistration } = await import("./actions");
    const result = await deleteRegistration(id);
    if (result.success) {
      setDeleteConfirm(null);
      window.location.reload();
    }
  };

  const handleEditSave = async () => {
    if (!editRegistration) return;
    const { updateRegistration } = await import("./actions");
    const result = await updateRegistration(editRegistration.id as number, editForm);
    if (result.success) {
      setEditRegistration(null);
      window.location.reload();
    }
  };

  const openEdit = (r: RegRecord) => {
    setEditRegistration(r);
    
    let staffNotes = "";
    if (r.customData) {
      try {
        const custom = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
        staffNotes = custom._staffNotes || "";
      } catch { /* ignore */ }
    }

    setEditForm({
      fullName: (r.fullName as string) || "",
      email: (r.email as string) || "",
      whatsapp: (r.whatsapp as string) || "",
      address: (r.address as string) || "",
      ageRange: (r.ageRange as string) || "",
      registrantStatus: (r.registrantStatus as string) || "",
      _staffNotes: staffNotes,
    });
  };

  // Bulk upload
  const handleBulkUpload = async () => {
    if (!csvFile || !uploadEvent) return;
    setUploading(true);
    setUploadResult(null);
    const text = await csvFile.text();
    const lines = text.trim().split("\n");
    const csvHeaders = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    const standardFields = [
      "fullName", "email", "whatsapp", "address", "branchId",
      "ageRange", "registrantStatus", "isMember", "isFirstTime",
      "heardFrom", "invitees"
    ];
    const rows = lines.slice(1).filter(l => l.trim()).map(line => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ""; continue; }
        current += ch;
      }
      values.push(current.trim());
      const row: RegRecord = {};
      const customData: Record<string, string> = {};
      csvHeaders.forEach((h, i) => {
        const val = values[i] || "";
        if (standardFields.includes(h)) {
          if (h === "isMember" || h === "isFirstTime") {
            row[h] = val.toLowerCase() === "yes" || val.toLowerCase() === "true";
          } else {
            row[h] = val || null;
          }
        } else {
          if (val) customData[h] = val;
        }
      });
      row.customData = JSON.stringify(customData);
      return row;
    }).filter(r => r.fullName || r.email);
    const { bulkInsertRegistrations } = await import("./actions");
    const result = await bulkInsertRegistrations(rows, uploadEvent as string);
    setUploadResult(result);
    setUploading(false);
  };

  const downloadTemplate = () => {
    const targetEvent = events.find(e => e.id === uploadEvent);
    const headers = [
      "fullName", "email", "whatsapp", "address", "branchId",
      "ageRange", "registrantStatus", "isMember", "isFirstTime",
      "heardFrom", "invitees"
    ];
    if (targetEvent?.customFields) {
      try {
        const fields = JSON.parse(targetEvent.customFields as string);
        fields.forEach((f: RegRecord) => {
          if (!headers.includes(f.label as string)) headers.push(f.label as string);
        });
      } catch { /* ignore */ }
    }
    const exampleRows = [
      { fullName: "John Doe", email: "john@example.com", whatsapp: "0241234567", address: "Accra, Ghana", branchId: "main-branch", ageRange: "25-34", registrantStatus: "Member", isMember: "Yes", isFirstTime: "No", heardFrom: "Church", invitees: "Jane Smith" },
      { fullName: "Mary Johnson", email: "mary@example.com", whatsapp: "0551234567", address: "Tema, Ghana", branchId: "tema-branch", ageRange: "18-24", registrantStatus: "Guest", isMember: "No", isFirstTime: "Yes", heardFrom: "Friend", invitees: "" },
      { fullName: "David Mensah", email: "david@example.com", whatsapp: "0201234567", address: "Kumasi, Ghana", branchId: "kumasi-branch", ageRange: "35-44", registrantStatus: "Worker", isMember: "Yes", isFirstTime: "No", heardFrom: "Social Media", invitees: "Grace Mensah, Ama Mensah" },
    ];
    const csvRows = exampleRows.map(row => headers.map(h => {
      const val = (row as Record<string, string>)[h] || "Sample Answer";
      return val.includes(",") ? `"${val}"` : val;
    }).join(","));
    const csv = headers.join(",") + "\n" + csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template-${(targetEvent?.slug as string) || "registrations"}.csv`;
    a.click();
  };

  const thStyle = (col?: SortKey): React.CSSProperties => ({
    padding: "0.85rem 1.25rem",
    fontWeight: 600,
    color: "#374151",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    cursor: col ? "pointer" : "default",
    userSelect: "none",
    whiteSpace: "nowrap",
  });

  return (
    <>
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", flex: 1, minWidth: "220px", fontSize: "0.9rem" }}
          />
          <select value={filterEvent} onChange={e => { setFilterEvent(e.target.value); setCurrentPage(1); }} style={{ padding: "0.65rem", borderRadius: "8px", border: "1px solid #d1d5db", minWidth: "180px", fontSize: "0.9rem" }}>
            <option value="">All Events</option>
            {events.map(e => <option key={e.id as string} value={e.id as string}>{(e.name as string) || (e.id as string)}</option>)}
          </select>
          {branches && branches.length > 0 && (
            <select value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setCurrentPage(1); }} style={{ padding: "0.65rem", borderRadius: "8px", border: "1px solid #d1d5db", minWidth: "180px", fontSize: "0.9rem" }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id as string} value={b.id as string}>{b.name as string}</option>)}
            </select>
          )}
          <Link 
            href={`/api/export-csv?${new URLSearchParams({
              ...(searchTerm ? { q: searchTerm } : {}),
              ...(filterEvent ? { eventId: filterEvent } : {}),
              ...(filterBranch ? { branchId: filterBranch } : {}),
            }).toString()}`}
            style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", fontWeight: 600, textDecoration: "none", color: "#111", background: "white", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
          >
            <Download size={15} /> Export
          </Link>
          <button
            onClick={() => {
              if (filterEvent) { window.open(`/admin/print-nametags?eventId=${filterEvent}`, '_blank'); }
              else { setShowPrintModal(true); }
            }}
            style={{ padding: "0.65rem 1rem", background: "white", color: "#111", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
          >
            <Printer size={15} /> Print
          </button>
          {canBulkUpload && (
            <button onClick={() => setShowUpload(true)} style={{ padding: "0.65rem 1rem", background: "#2b3ff2", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
              <Upload size={15} /> Bulk Upload
            </button>
          )}
        </div>

        {/* Summary bar */}
        <div style={{ padding: "0.6rem 1.5rem", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Showing <strong>{(safeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(safeCurrentPage * PAGE_SIZE, sortedData.length)}</strong> of <strong>{sortedData.length}</strong> registrations</span>
          <span style={{ fontSize: "0.8rem" }}>Page {safeCurrentPage} of {totalPages}</span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                <th style={thStyle("fullName")} onClick={() => handleSort("fullName")}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>Registrant {renderSortIcon("fullName")}</span>
                </th>
                <th style={thStyle("whatsapp")} onClick={() => handleSort("whatsapp")}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>Contact {renderSortIcon("whatsapp")}</span>
                </th>
                <th style={thStyle()}>Branch</th>
                <th style={thStyle()}>Event</th>
                <th style={thStyle("status")} onClick={() => handleSort("status")}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>Status {renderSortIcon("status")}</span>
                </th>
                <th style={thStyle("createdAt")} onClick={() => handleSort("createdAt")}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>Date {renderSortIcon("createdAt")}</span>
                </th>
                <th style={{ ...thStyle(), textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>No registrations found.</td></tr>
              )}
              {paginatedData.map(r => {
                const event = events.find(e => e.id === r.eventId);
                const branch = branches.find(b => b.id === r.branchId);
                const isCheckedIn = r.status === "checked-in";
                let displayBranch: string = (branch?.name as string) || (r.branchId as string) || "Unknown";
                if (r.branchId === "other" && r.customData) {
                  try {
                    const custom = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
                    if (custom.specifiedBranch) displayBranch = `Other (${custom.specifiedBranch})`;
                  } catch { /* ignore */ }
                }

                return (
                  <tr key={r.id as string} style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fafbfc"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "0.85rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", color: "#3730a3", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 }}>
                          {((r.fullName as string) || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#111", fontSize: "0.9rem", lineHeight: 1.3 }}>{(r.fullName as string) || "—"}</div>
                          <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>{(r.email as string) || "No Email"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#4b5563", fontSize: "0.85rem" }}>
                      {(r.whatsapp as string) || "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem" }}>
                      <span style={{ display: "inline-block", background: "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", color: "#475569", fontWeight: 500, border: "1px solid #e2e8f0" }}>
                        {displayBranch}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 500 }}>
                      {(event?.name as string) || (r.eventId as string) || "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "flex-start" }}>
                        <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 600, background: isCheckedIn ? "#dcfce7" : "#fef9c3", color: isCheckedIn ? "#16a34a" : "#854d0e" }}>
                          {isCheckedIn ? "✓ Checked In" : "Pending"}
                        </span>
                        {r.registrantStatus && r.registrantStatus !== "Unknown" ? (
                          <span style={{ fontSize: "0.7rem", color: "#6b7280", background: "#f3f4f6", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                            {r.registrantStatus as string}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#6b7280", fontSize: "0.8rem" }}>
                      {r.createdAt ? new Date(r.createdAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        <button onClick={() => setViewRegistration(r)} title="View" style={{ padding: "0.35rem 0.6rem", background: "white", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                          View
                        </button>
                        <button onClick={() => openEdit(r)} title="Edit" style={{ padding: "0.35rem", background: "white", color: "#f59e0b", border: "1px solid #fde68a", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <Pencil size={13} />
                        </button>
                        {isSuperAdmin && (
                          <button onClick={() => setDeleteConfirm(r.id as number)} title="Delete" style={{ padding: "0.35rem", background: "white", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={() => setCurrentPage(1)} disabled={safeCurrentPage === 1} style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer", opacity: safeCurrentPage === 1 ? 0.4 : 1, fontSize: "0.8rem" }}>First</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer", opacity: safeCurrentPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center" }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) { page = i + 1; }
              else if (safeCurrentPage <= 3) { page = i + 1; }
              else if (safeCurrentPage >= totalPages - 2) { page = totalPages - 4 + i; }
              else { page = safeCurrentPage - 2 + i; }
              return (
                <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: "0.4rem 0.7rem", borderRadius: "6px", border: page === safeCurrentPage ? "1px solid #2563eb" : "1px solid #d1d5db", background: page === safeCurrentPage ? "#2563eb" : "white", color: page === safeCurrentPage ? "white" : "#374151", cursor: "pointer", fontWeight: page === safeCurrentPage ? 700 : 400, fontSize: "0.8rem" }}>
                  {page}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer", opacity: safeCurrentPage === totalPages ? 0.4 : 1, display: "flex", alignItems: "center" }}>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={safeCurrentPage === totalPages} style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer", opacity: safeCurrentPage === totalPages ? 0.4 : 1, fontSize: "0.8rem" }}>Last</button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "95vw", maxWidth: "1200px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={20} color="#ef4444" />
              </div>
              <h2 style={{ margin: 0, color: "#111", fontSize: "1.15rem" }}>Delete Registration</h2>
            </div>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              Are you sure you want to permanently delete this registration? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#111" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "0.75rem", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRegistration && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "95vw", maxWidth: "1200px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: 0, color: "#111", fontSize: "1.15rem", marginBottom: "1.5rem" }}>Edit Registration</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {[
                { key: "fullName", label: "Full Name" },
                { key: "email", label: "Email" },
                { key: "whatsapp", label: "WhatsApp" },
                { key: "address", label: "Address" },
                { key: "ageRange", label: "Age Range" },
                { key: "registrantStatus", label: "Status (Member/Guest/Worker)" },
                { key: "_staffNotes", label: "VIP / Staff Notes (e.g. Pastor, Wheelchair)" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: 500, color: "#374151", fontSize: "0.85rem" }}>{field.label}</label>
                  <input
                    type="text"
                    value={editForm[field.key] || ""}
                    onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.9rem", boxSizing: "border-box", background: field.key === "_staffNotes" ? "#fef3c7" : "#fff" }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button onClick={() => setEditRegistration(null)} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#111" }}>Cancel</button>
              <button onClick={handleEditSave} style={{ flex: 1, padding: "0.75rem", background: "#111", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUpload && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "550px" }}>
            <h2 style={{ marginTop: 0, color: "#111" }}>Bulk Upload Registrations</h2>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#334155" }}>
              <strong style={{ color: "#111", fontSize: "0.9rem" }}>CSV Columns (in order):</strong>
              <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                {["fullName", "email", "whatsapp", "address", "branchId", "ageRange", "registrantStatus", "isMember", "isFirstTime", "heardFrom", "invitees"].map(f => (
                  <code key={f} style={{ background: "#e0f2fe", padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.8rem" }}>{f}</code>
                ))}
              </div>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Download the template to see examples with 3 sample rows. Extra columns become custom data.
              </p>
              <button onClick={downloadTemplate} style={{ marginTop: "0.75rem", background: "none", border: "1px solid #7dd3fc", borderRadius: "6px", padding: "0.4rem 0.75rem", color: "#0284c7", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Download size={14} /> Download Template CSV
              </button>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#111" }}>Target Event</label>
              <select value={uploadEvent as string} onChange={e => setUploadEvent(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff" }}>
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
                {(uploadResult.errors as string[])?.length > 0 && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#b45309", background: "#fffbeb", padding: "0.5rem", borderRadius: "4px", maxHeight: "100px", overflowY: "auto" }}>
                    <strong>Warnings:</strong>
                    {(uploadResult.errors as string[]).map((err, i) => <div key={i}>• {err}</div>)}
                  </div>
                )}
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

      {/* Print Modal */}
      {showPrintModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "95vw", maxWidth: "1200px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: 0, color: "#111", fontSize: "1.25rem", marginBottom: "1rem" }}>Print Nametags</h2>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "1.5rem" }}>Select the event to print nametags for.</p>
            <select value={printEventId} onChange={e => setPrintEventId(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111", background: "#fff", marginBottom: "1.5rem" }}>
              <option value="">Select Event...</option>
              {events.map(e => <option key={e.id as string} value={e.id as string}>{(e.name as string) || (e.id as string)}</option>)}
            </select>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => { setShowPrintModal(false); setPrintEventId(""); }} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#111" }}>Cancel</button>
              <button onClick={() => { if (printEventId) { window.open(`/admin/print-nametags?eventId=${printEventId}`, '_blank'); setShowPrintModal(false); setPrintEventId(""); } }} disabled={!printEventId} style={{ flex: 1, padding: "0.75rem", background: printEventId ? "#111" : "#9ca3af", color: "white", border: "none", borderRadius: "8px", cursor: printEventId ? "pointer" : "not-allowed", fontWeight: 600 }}>Print</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewRegistration && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2.5rem", borderRadius: "16px", width: "95vw", maxWidth: "1200px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#e0e7ff", color: "#3730a3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 700, flexShrink: 0 }}>
                  {((viewRegistration.fullName as string) || "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: "0 0 0.25rem 0", color: "#111", fontSize: "1.75rem" }}>{(viewRegistration.fullName as string) || "Unknown"}</h2>
                  <div style={{ color: "#6b7280", fontSize: "1rem" }}>
                    {(viewRegistration.email as string) || "No Email"} · {(viewRegistration.whatsapp as string) || "No Phone"}
                  </div>
                  <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                    <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 600, background: viewRegistration.status === 'checked-in' ? "#dcfce7" : "#f3f4f6", color: viewRegistration.status === 'checked-in' ? "#16a34a" : "#4b5563" }}>
                      {viewRegistration.status === 'checked-in' ? "✓ Checked In" : "Registered"}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewRegistration(null)} style={{ background: "transparent", border: "none", fontSize: "2.5rem", cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>&times;</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", color: "#374151", fontSize: "1rem", background: "#f9fafb", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
              <div><strong style={{ color: "#6b7280", display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Address</strong> <div style={{ fontWeight: 500, color: "#111" }}>{(viewRegistration.address as string) || "—"}</div></div>
              <div><strong style={{ color: "#6b7280", display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Age Range</strong> <div style={{ fontWeight: 500, color: "#111" }}>{(viewRegistration.ageRange as string) || "—"}</div></div>
              <div><strong style={{ color: "#6b7280", display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Registrant Status</strong> <div style={{ fontWeight: 500, color: "#111" }}>{(viewRegistration.registrantStatus as string) || "—"}</div></div>
              <div><strong style={{ color: "#6b7280", display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Member?</strong> <div style={{ fontWeight: 500, color: "#111" }}>{viewRegistration.isMember ? "Yes" : "No"}</div></div>
              <div><strong style={{ color: "#6b7280", display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>First Time?</strong> <div style={{ fontWeight: 500, color: "#111" }}>{viewRegistration.isFirstTime ? "Yes" : "No"}</div></div>
              <div><strong style={{ color: "#6b7280", display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Heard From</strong> <div style={{ fontWeight: 500, color: "#111" }}>{(viewRegistration.heardFrom as string) || "—"}</div></div>
              <div><strong style={{ color: "#6b7280", display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Invitees</strong> <div style={{ fontWeight: 500, color: "#111" }}>{(viewRegistration.invitees as string) || "—"}</div></div>
            </div>

            {viewRegistration.customData ? (() => {
              try {
                const custom = typeof viewRegistration.customData === 'string' ? JSON.parse(viewRegistration.customData as string) : viewRegistration.customData;
                const keys = Object.keys(custom as Record<string, unknown>);
                if (keys.length === 0) return null;
                return (
                  <div style={{ marginTop: "2rem" }}>
                    <h3 style={{ fontSize: "1.1rem", color: "#111", marginBottom: "1.25rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.5rem" }}>Custom Fields</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                      {keys.map(k => (
                        <div key={k} style={{ background: k === "_staffNotes" ? "#fef3c7" : "white", padding: k === "_staffNotes" ? "1rem" : "0", borderRadius: "8px", border: k === "_staffNotes" ? "1px solid #fde68a" : "none" }}>
                          <strong style={{ color: k === "_staffNotes" ? "#92400e" : "#6b7280", display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k === "_staffNotes" ? "VIP / Staff Notes" : k}</strong>
                          <div style={{ fontWeight: 500, color: k === "_staffNotes" ? "#92400e" : "#111" }}>{String((custom as Record<string, string>)[k] || "—")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } catch {
                return <div style={{ marginTop: "1rem", color: "#ef4444" }}>Error parsing custom fields.</div>;
              }
            })() : null}
            
            <div style={{ marginTop: "3rem", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setViewRegistration(null)} style={{ padding: "0.85rem 2.5rem", background: "#111", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "1.05rem" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

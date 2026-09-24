"use client";

import { useState, useTransition } from "react";
import { searchRegistrations, checkInById } from "./actions";
import { Search, CheckCircle, UserCheck } from "lucide-react";

export default function CheckinInterface({ events }: { events: any[] }) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [checkedInIds, setCheckedInIds] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleSearch = () => {
    if (!query.trim() || !selectedEvent) return;
    startTransition(async () => {
      const { results: res } = await searchRegistrations(query, selectedEvent);
      setResults(res || []);
      setSearched(true);
    });
  };

  const handleCheckIn = async (id: number) => {
    const res = await checkInById(id);
    if (res.success) {
      setCheckedInIds(prev => new Set([...prev, id]));
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: "checked-in" } : r));
    }
    setConfirmId(null);
  };

  const isCheckedIn = (r: any) => r.status === "checked-in" || checkedInIds.has(r.id);

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 1rem" }}>
      
      {/* Event Selector */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>Select Event</label>
        <select 
          value={selectedEvent} 
          onChange={e => { setSelectedEvent(e.target.value); setResults([]); setSearched(false); }}
          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem" }}
        >
          {events.map(e => <option key={e.id} value={e.id}>{e.name || e.id}</option>)}
        </select>
      </div>

      {/* Search Box */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>Search Registrant</label>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search by name, email, or phone..."
            style={{ flex: 1, padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem" }}
          />
          <button 
            onClick={handleSearch} 
            disabled={isPending}
            style={{ padding: "0.85rem 1.5rem", background: "#111", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {isPending ? "..." : <><Search size={16} /> Search</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {results.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <p style={{ color: "#6b7280", fontWeight: 500 }}>No registrant found for "{query}"</p>
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Try searching by a different name, email, or phone number.</p>
            </div>
          ) : (
            <>
              <div style={{ padding: "1rem 1.5rem", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: "0.9rem" }}>
                Found <strong>{results.length}</strong> result{results.length !== 1 ? "s" : ""}
              </div>
              {results.map(r => (
                <div key={r.id} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#111", fontSize: "1.05rem" }}>{r.fullName || "Unknown"}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{r.email} · {r.whatsapp}</div>
                    <div style={{ marginTop: "0.4rem" }}>
                      <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600, background: isCheckedIn(r) ? "#dcfce7" : "#fef9c3", color: isCheckedIn(r) ? "#16a34a" : "#854d0e" }}>
                        {isCheckedIn(r) ? "✓ Checked In" : "Registered"}
                      </span>
                    </div>
                  </div>
                  {!isCheckedIn(r) ? (
                    <button 
                      onClick={() => setConfirmId(r.id)}
                      style={{ padding: "0.75rem 1.25rem", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <UserCheck size={16} /> Check In
                    </button>
                  ) : (
                    <CheckCircle size={24} color="#16a34a" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", maxWidth: "360px", width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", display: "flex", justifyContent: "center" }}><CheckCircle size={56} color="#16a34a" /></div>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Confirm Check-in?</h3>
            {(() => {
              const r = results.find(r => r.id === confirmId);
              return <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0" }}>Check in <strong>{r?.fullName}</strong>?</p>;
            })()}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setConfirmId(null)} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={() => handleCheckIn(confirmId)} style={{ flex: 1, padding: "0.75rem", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

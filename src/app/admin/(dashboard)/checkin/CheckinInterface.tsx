"use client";

import { useState, useTransition, useEffect } from "react";
import { searchRegistrations, checkInById, getAllRegistrations, bulkCheckIn, undoCheckInById } from "./actions";
import { Search, CheckCircle, UserCheck, QrCode, UserPlus, RefreshCw, AlertTriangle, Clock } from "lucide-react";
import RegistrationModal from "../../../../components/RegistrationModal";
import { Html5QrcodeScanner } from "html5-qrcode";
import { get, set } from "idb-keyval";

type HistoryItem = { id: number; name: string; time: Date };

export default function CheckinInterface({ events }: { events: { id: string; name?: string; customFields?: string | null }[] }) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [searched, setSearched] = useState(false);
  const [checkedInIds, setCheckedInIds] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCheckins, setPendingCheckins] = useState<number[]>([]);
  const [showCheckedIn, setShowCheckedIn] = useState(true);
  const [flashCardId, setFlashCardId] = useState<number | null>(null);
  
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [totalRegs, setTotalRegs] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const activeEventObj = events.find(e => e.id === selectedEvent);

  useEffect(() => {
    get("pendingCheckins").then((val) => {
      if (val) setPendingCheckins(val);
    });
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      if (!selectedEvent) return;
      const localData: Record<string, unknown>[] = await get(`event_${selectedEvent}_registrations`) || [];
      if (localData.length > 0) {
        setTotalRegs(localData.length);
        setCheckedInCount(localData.filter(r => r.status === "checked-in").length);
      } else {
        const { results: res } = await getAllRegistrations(selectedEvent);
        if (res) {
          setTotalRegs(res.length);
          setCheckedInCount(res.filter(r => r.status === "checked-in").length);
        }
      }
    };
    
    loadStats();
  }, [selectedEvent]);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(async (decodedText) => {
        scanner.clear();
        setShowScanner(false);
        const idMatch = decodedText.match(/\d+/);
        if (idMatch) {
          const id = Number(idMatch[0]);
          
          // Check if already checked in
          const localData: Record<string, unknown>[] = await get(`event_${selectedEvent}_registrations`) || [];
          let reg: Record<string, unknown> | undefined;
          
          if (localData.length > 0) {
            reg = localData.find(r => r.id === id);
          } else {
            const { results: res } = await searchRegistrations(String(id), selectedEvent);
            if (res) reg = res.find(r => r.id === id);
          }
          
          if (reg) {
             setResults([reg]);
             setSearched(true);
             setConfirmId(id);
          } else {
             alert("Registration not found.");
          }
        } else {
          alert("Invalid QR code format. Could not find Registration ID.");
        }
      }, () => {
        // ignore continuous scanning errors
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [showScanner, selectedEvent]);

  const handleSyncDevice = async () => {
    if (!selectedEvent) return;
    setIsSyncing(true);
    try {
      if (pendingCheckins.length > 0) {
        await bulkCheckIn(pendingCheckins);
        await set("pendingCheckins", []);
        setPendingCheckins([]);
      }
      
      const { results } = await getAllRegistrations(selectedEvent);
      if (results) {
        await set(`event_${selectedEvent}_registrations`, results);
        setTotalRegs(results.length);
        setCheckedInCount(results.filter(r => r.status === "checked-in").length);
        alert("Device synced! You can now search and check-in offline.");
      }
    } catch {
      alert("Failed to sync. Please check your connection.");
    }
    setIsSyncing(false);
  };

  const handleSearch = () => {
    if (!query.trim() || !selectedEvent) return;
    startTransition(async () => {
      const localData: Record<string, unknown>[] = await get(`event_${selectedEvent}_registrations`) || [];
      if (localData.length > 0 || !navigator.onLine) {
        const q = query.toLowerCase();
        const res = localData.filter(r => 
          String(r.id) === q ||
          String(r.fullName || "").toLowerCase().includes(q) || 
          String(r.email || "").toLowerCase().includes(q) || 
          String(r.whatsapp || "").toLowerCase().includes(q)
        ).slice(0, 10);
        setResults(res);
      } else {
        const { results: res } = await searchRegistrations(query, selectedEvent);
        setResults(res || []);
      }
      setSearched(true);
    });
  };

  const playSuccessSound = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch(e) {
      console.error(e);
    }
  };

  const handleCheckIn = async (id: number) => {
    const r = results.find(x => x.id === id);
    const name = (r?.fullName as string) || `ID #${id}`;

    setCheckedInIds(prev => new Set([...prev, id]));
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: "checked-in" } : r));
    setConfirmId(null);
    setCheckedInCount(c => c + 1);
    
    setHistory(prev => [{ id, name, time: new Date() }, ...prev].slice(0, 50));
    playSuccessSound();
    setFlashCardId(id);
    setTimeout(() => setFlashCardId(null), 1000);

    try {
      if (!navigator.onLine) throw new Error("Offline");
      const res = await checkInById(id);
      if (!res?.success) throw new Error("API Failed");
    } catch {
      const pending = [...pendingCheckins, id];
      setPendingCheckins(pending);
      await set("pendingCheckins", pending);
    }
  };

  const handleBatchCheckIn = async () => {
    if (selectedIds.size === 0) return;
    
    const idsToProcess = Array.from(selectedIds);
    
    setCheckedInIds(prev => new Set([...prev, ...idsToProcess]));
    setResults(prev => prev.map(r => idsToProcess.includes(r.id as number) ? { ...r, status: "checked-in" } : r));
    setCheckedInCount(c => c + idsToProcess.length);
    
    const now = new Date();
    setHistory(prev => {
      const newHistory = idsToProcess.map(id => {
        const r = results.find(x => x.id === id);
        return { id, name: (r?.fullName as string) || `ID #${id}`, time: now };
      });
      return [...newHistory, ...prev].slice(0, 50);
    });
    
    playSuccessSound();
    setBatchMode(false);
    setSelectedIds(new Set());
    
    try {
      if (!navigator.onLine) throw new Error("Offline");
      const res = await bulkCheckIn(idsToProcess);
      if (!res?.success) throw new Error("API Failed");
    } catch {
      const pending = [...pendingCheckins, ...idsToProcess];
      setPendingCheckins(pending);
      await set("pendingCheckins", pending);
    }
  };

  const handleUndoCheckIn = async (id: number) => {
    setCheckedInIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: "registered", checkedInAt: null } : r));
    setConfirmId(null);
    setCheckedInCount(c => Math.max(0, c - 1));
    setHistory(prev => prev.filter(h => h.id !== id));

    try {
      if (!navigator.onLine) throw new Error("Offline");
      const res = await undoCheckInById(id);
      if (!res?.success) throw new Error("API Failed");
    } catch {
      // Offline undo is hard, just ignore for now or add to pendingUndo array
    }
  };

  const isCheckedIn = (r: Record<string, unknown>) => r.status === "checked-in" || checkedInIds.has(r.id as number);
  
  const progressPct = totalRegs > 0 ? Math.round((checkedInCount / totalRegs) * 100) : 0;

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      
      {/* Event Selector & Actions */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#111" }}>Select Event</label>
            <select 
              value={selectedEvent} 
              onChange={e => { 
                setSelectedEvent(e.target.value); 
                setResults([]); 
                setSearched(false); 
                setHistory([]);
                setCheckedInIds(new Set());
              }}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem", color: "#111", background: "#fff" }}
            >
              {events.map(e => <option key={e.id} value={e.id}>{e.name || e.id}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={handleSyncDevice}
              disabled={isSyncing}
              style={{ padding: "0.75rem 1rem", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <RefreshCw size={16} /> 
              {pendingCheckins.length > 0 ? `Sync (${pendingCheckins.length})` : "Sync Device"}
            </button>
            <button 
              onClick={() => setShowWalkinModal(true)}
              style={{ padding: "0.75rem 1rem", background: "#f3f4f6", color: "#111", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <UserPlus size={16} /> Walk-in
            </button>
            <button 
              onClick={() => setShowScanner(true)}
              style={{ padding: "0.75rem 1rem", background: "#2b3ff2", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <QrCode size={16} /> Scan QR
            </button>
          </div>
        </div>
        
        {/* Live Counter */}
        {totalRegs > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#4b5563" }}>
              <span><strong>{checkedInCount}</strong> / {totalRegs} Checked In</span>
              <span style={{ fontWeight: 600 }}>{progressPct}%</span>
            </div>
            <div style={{ height: "8px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "#16a34a", transition: "width 0.3s ease" }}></div>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Container */}
      {showScanner && (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, color: "#111" }}>Scan Ticket</h3>
            <button onClick={() => setShowScanner(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666", fontWeight: 600 }}>Close</button>
          </div>
          <div id="reader" style={{ width: "100%", maxWidth: "400px", margin: "0 auto", overflow: "hidden", borderRadius: "8px" }}></div>
        </div>
      )}

      <div style={{ display: "flex", gap: "1.5rem", flexDirection: "column" }}>
        
        {/* Search Box & Results */}
        <div>
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#111" }}>Search Registrant</label>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search by ID, name, email, or phone..."
                style={{ flex: 1, padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem", color: "#111", background: "#fff" }}
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
                  <p style={{ color: "#6b7280", fontWeight: 500 }}>No registrant found for &quot;{query}&quot;</p>
                  <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Try searching by a different name, email, or phone number.</p>
                </div>
              ) : (
                <>
                  <div style={{ padding: "1rem 1.5rem", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Found <strong>{results.length}</strong> result{results.length !== 1 ? "s" : ""}</span>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontWeight: 500, color: "#111" }}>
                        <input type="checkbox" checked={batchMode} onChange={e => {
                          setBatchMode(e.target.checked);
                          if (!e.target.checked) setSelectedIds(new Set());
                        }} />
                        Batch Mode
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontWeight: 500, color: "#111" }}>
                        <input type="checkbox" checked={showCheckedIn} onChange={e => setShowCheckedIn(e.target.checked)} />
                        Show Checked-in
                      </label>
                    </div>
                  </div>
                  {results.filter(r => showCheckedIn || !isCheckedIn(r)).map(r => {
                    const alreadyCheckedIn = isCheckedIn(r);
                    const isFlashing = flashCardId === r.id;
                    const isSelected = selectedIds.has(r.id as number);
                    const initials = ((r.fullName as string) || "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <div key={r.id as number} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", background: isFlashing || isSelected ? "#dcfce7" : "white", transition: "background 0.5s ease" }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                          {batchMode && !alreadyCheckedIn && (
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={(e) => {
                                const newSet = new Set(selectedIds);
                                if (e.target.checked) newSet.add(r.id as number);
                                else newSet.delete(r.id as number);
                                setSelectedIds(newSet);
                              }}
                              style={{ width: "20px", height: "20px", accentColor: "#16a34a", cursor: "pointer" }}
                            />
                          )}
                          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: batchMode ? "#f3f4f6" : "#2b3ff2", color: batchMode ? "#9ca3af" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, flexShrink: 0, border: batchMode ? "1px solid #e5e7eb" : "1px solid rgba(43,63,242,0.2)" }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#111", fontSize: "1.05rem" }}>{(r.fullName as string) || "Unknown"}</div>
                            <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{r.email as string} {r.whatsapp ? `· ${r.whatsapp}` : ''}</div>
                            <div style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                              Reg: {r.createdAt ? new Date(r.createdAt as string).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "N/A"}
                              {Boolean(r.checkedInAt) && (
                                <> · Arr: <span style={{color: "#16a34a", fontWeight: 600}}>{new Date(r.checkedInAt as string).toLocaleTimeString([], { timeStyle: 'short' })}</span></>
                              )}
                            </div>
                            <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                              <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600, background: alreadyCheckedIn ? "#dcfce7" : "#f3f4f6", color: alreadyCheckedIn ? "#16a34a" : "#4b5563" }}>
                                {alreadyCheckedIn ? "✓ Checked In" : "Registered"}
                              </span>
                              {(() => {
                                if (!r.customData) return null;
                                try {
                                  const custom = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
                                  if (custom._staffNotes) {
                                    return (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                                        ⭐ {String(custom._staffNotes)}
                                      </span>
                                    );
                                  }
                                } catch { /* ignore */ }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          {!alreadyCheckedIn ? (
                            !batchMode && (
                              <button 
                                onClick={() => setConfirmId(r.id as number)}
                                style={{ padding: "0.75rem 1.25rem", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.5rem" }}
                              >
                                <UserCheck size={16} /> Check In
                              </button>
                            )
                          ) : (
                            <button 
                              onClick={() => setConfirmId(r.id as number)}
                              style={{ padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}
                              title="Manage Check-in"
                            >
                              <CheckCircle size={24} color="#16a34a" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
          
          {batchMode && selectedIds.size > 0 && (
            <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", zIndex: 50, background: "white", padding: "1rem 2rem", borderRadius: "99px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <span style={{ fontWeight: 600, color: "#111" }}>{selectedIds.size} Selected</span>
              <button 
                onClick={handleBatchCheckIn}
                style={{ background: "#16a34a", color: "white", border: "none", padding: "0.75rem 1.5rem", borderRadius: "99px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <CheckCircle size={18} />
                Check-in All
              </button>
            </div>
          )}
        </div>

        {/* Check-in History */}
        {history.length > 0 && (
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#111", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={18} /> Recent Check-ins
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 500, color: "#111", fontSize: "0.9rem" }}>{h.name}</div>
                  <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                    {h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", maxWidth: "360px", width: "90%", textAlign: "center" }}>
            {(() => {
              const r = results.find(r => r.id === confirmId);
              const alreadyCheckedIn = r && isCheckedIn(r);
              
              if (alreadyCheckedIn) {
                return (
                  <>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem", display: "flex", justifyContent: "center" }}><AlertTriangle size={56} color="#eab308" /></div>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#111" }}>Already Checked In</h3>
                    <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0" }}><strong>{(r?.fullName as string) || `Registration #${confirmId}`}</strong> has already been checked in.</p>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button onClick={() => handleUndoCheckIn(confirmId)} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", color: "#ef4444", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Undo Check-in</button>
                      <button onClick={() => setConfirmId(null)} style={{ flex: 1, padding: "0.75rem", background: "#eab308", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Dismiss</button>
                    </div>
                  </>
                );
              }
              
              return (
                <>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem", display: "flex", justifyContent: "center" }}><CheckCircle size={56} color="#16a34a" /></div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#111" }}>Confirm Check-in?</h3>
                  <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0" }}>Check in <strong>{(r?.fullName as string) || `Registration #${confirmId}`}</strong>?</p>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => setConfirmId(null)} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#111" }}>Cancel</button>
                    <button onClick={() => handleCheckIn(confirmId)} style={{ flex: 1, padding: "0.75rem", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Confirm</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Walk-in Registration Modal */}
      <RegistrationModal 
        isOpen={showWalkinModal} 
        onClose={() => setShowWalkinModal(false)}
        event={activeEventObj ? { ...activeEventObj, customFields: activeEventObj.customFields || undefined } : undefined}
      />
    </div>
  );
}

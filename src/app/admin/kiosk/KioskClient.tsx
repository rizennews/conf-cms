"use client";

import { useState, useEffect, useRef } from "react";
import { getRegistrationById, checkInById, searchRegistrations } from "../(dashboard)/checkin/actions";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, AlertTriangle, XCircle, QrCode, Search, UserCheck } from "lucide-react";
import Link from "next/link";

type ScanState = "IDLE" | "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID";

export default function KioskClient({ events, branches }: { events: any[], branches: any[] }) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || "");
  const [isStarted, setIsStarted] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("IDLE");
  const [message, setMessage] = useState("");
  const [subMessage, setSubMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<{name: string, time: Date}[]>([]);
  
  // Search Fallback State
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const lastScannedIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playSound = (type: 'success' | 'error' | 'warn') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch(e) {
      console.warn("Audio not supported or muted");
    }
  };

  useEffect(() => {
    if (isStarted && scanState === "IDLE" && !isSearchMode) {
      const scanner = new Html5QrcodeScanner("kiosk-reader", { 
        fps: 10, 
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
      }, false);

      scanner.render(async (decodedText) => {
        if (isProcessing) return;
        
        const idMatch = decodedText.match(/\d+/);
        if (!idMatch) {
          handleResult("INVALID", "Invalid QR code format.", "");
          return;
        }

        const regId = Number(idMatch[0]);
        if (lastScannedIdRef.current === regId) return;

        setIsProcessing(true);
        lastScannedIdRef.current = regId;
        scanner.pause(true);

        const { registration } = await getRegistrationById(regId);
        
        if (!registration || registration.eventId !== selectedEvent) {
          handleResult("INVALID", "Ticket not valid for this event.", "");
        } else if (registration.status === "checked-in") {
          handleResult("ALREADY_CHECKED_IN", `${registration.fullName || 'Guest'}`, "Already checked in!");
        } else {
          const res = await checkInById(regId);
          if (res.success) {
            const branchName = branches.find(b => b.id === registration.branchId)?.name || "VIP Guest";
            handleResult("SUCCESS", `Welcome, ${registration.fullName || 'Guest'}!`, branchName);
            setRecentCheckins(prev => [{ name: registration.fullName || 'Guest', time: new Date() }, ...prev].slice(0, 5));
          } else {
            handleResult("INVALID", "Server error during check-in.", "");
          }
        }
        
      }, (error) => {
        // ignore continuous scanning errors
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [isStarted, scanState, isProcessing, selectedEvent, isSearchMode, branches]);

  const handleResult = (state: ScanState, msg: string, sub: string) => {
    setScanState(state);
    setMessage(msg);
    setSubMessage(sub);
    setIsProcessing(false);
    setIsSearchMode(false);
    
    if (state === "SUCCESS") playSound("success");
    else if (state === "INVALID") playSound("error");
    else playSound("warn");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setScanState("IDLE");
      setMessage("");
      setSubMessage("");
      lastScannedIdRef.current = null;
    }, 3500);
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const { results } = await searchRegistrations(searchQuery, selectedEvent);
    setSearchResults(results || []);
    setIsSearching(false);
  };

  const handleManualCheckIn = async (reg: any) => {
    if (reg.status === "checked-in") {
      handleResult("ALREADY_CHECKED_IN", `${reg.fullName || 'Guest'}`, "Already checked in!");
      return;
    }
    const res = await checkInById(reg.id);
    if (res.success) {
      const branchName = branches.find(b => b.id === reg.branchId)?.name || "VIP Guest";
      handleResult("SUCCESS", `Welcome, ${reg.fullName || 'Guest'}!`, branchName);
      setRecentCheckins(prev => [{ name: reg.fullName || 'Guest', time: new Date() }, ...prev].slice(0, 5));
    } else {
      handleResult("INVALID", "Server error during check-in.", "");
    }
  };

  if (!isStarted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f4f5f7", padding: "2rem" }}>
        <div style={{ background: "white", padding: "3rem", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)", maxWidth: "500px", width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-flex", padding: "1rem", background: "#f3f4f6", borderRadius: "50%", marginBottom: "1.5rem" }}>
            <QrCode size={48} color="#111" />
          </div>
          <h1 style={{ margin: "0 0 1rem 0", color: "#111", fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Kiosk Mode</h1>
          <p style={{ margin: "0 0 2rem 0", color: "#666", fontSize: "1.05rem" }}>Select an event and mount this device at the door for self check-in.</p>
          
          <select 
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1.05rem", marginBottom: "2rem", background: "white" }}
          >
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <button 
            onClick={() => setIsStarted(true)}
            style={{ width: "100%", padding: "1.1rem", background: "#2b3ff2", color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >
            Launch Kiosk
          </button>
          
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/admin" style={{ color: "#666", textDecoration: "none", fontWeight: 500 }}>&larr; Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f4f5f7", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(43, 63, 242, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(43, 63, 242, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(43, 63, 242, 0); }
        }
        .scanner-ring { animation: pulse-ring 2.5s infinite cubic-bezier(0.66, 0, 0, 1); }
      `}</style>
      
      {/* Top Bar */}
      <div style={{ padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <QrCode size={24} color="#111" />
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>
            {events.find(e => e.id === selectedEvent)?.name || "Event Kiosk"}
          </h2>
        </div>
        <button 
          onClick={() => { setIsStarted(false); setScanState("IDLE"); setIsSearchMode(false); }} 
          style={{ background: "#fff", border: "1px solid #d1d5db", padding: "0.6rem 1.25rem", borderRadius: "8px", color: "#111", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s" }}
          onMouseOver={e => e.currentTarget.style.background = "#f9fafb"}
          onMouseOut={e => e.currentTarget.style.background = "#fff"}
        >
          Exit Kiosk
        </button>
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        
        {/* Left: Main Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", padding: "2rem" }}>
          
          {scanState === "IDLE" ? (
            <div style={{ width: "100%", maxWidth: "600px", textAlign: "center", padding: "2rem" }}>
              
              {!isSearchMode ? (
                <>
                  <h1 style={{ fontSize: "2rem", color: "#111", marginBottom: "0.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Hold your QR Code to the camera</h1>
                  <p style={{ color: "#666", marginBottom: "3rem", fontSize: "1.05rem" }}>Ensure the QR code is bright and clearly visible.</p>
                  
                  <div className="scanner-ring" style={{ padding: "0.25rem", background: "white", borderRadius: "16px", margin: "0 auto", width: "100%", maxWidth: "360px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                    <div id="kiosk-reader" style={{ width: "100%", borderRadius: "12px", overflow: "hidden" }}></div>
                  </div>
                  
                  <button 
                    onClick={() => { setIsSearchMode(true); setSearchResults([]); setSearchQuery(""); }}
                    style={{ marginTop: "2.5rem", background: "transparent", color: "#666", border: "none", fontWeight: 500, cursor: "pointer", fontSize: "0.95rem" }}
                    onMouseOver={e => e.currentTarget.style.color = "#111"}
                    onMouseOut={e => e.currentTarget.style.color = "#666"}
                  >
                    Forgot your QR Code? &rarr;
                  </button>
                  
                  <style>{`
                    #kiosk-reader { border: none !important; }
                    #kiosk-reader__scan_region { background: white; border-radius: 8px; }
                    #kiosk-reader button { background: #2b3ff2; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; transition: opacity 0.2s; }
                    #kiosk-reader button:hover { opacity: 0.9; }
                    #kiosk-reader a { display: none !important; }
                  `}</style>
                </>
              ) : (
                <div style={{ textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#111", fontWeight: 700 }}>Manual Check-in</h2>
                    <button onClick={() => setIsSearchMode(false)} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    <input 
                      type="text" 
                      placeholder="Enter name, email, or phone..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleManualSearch()}
                      style={{ flex: 1, padding: "1rem", borderRadius: "8px", border: "2px solid #e5e7eb", fontSize: "1.05rem" }}
                      autoFocus
                    />
                    <button 
                      onClick={handleManualSearch}
                      disabled={isSearching}
                      style={{ padding: "0 1.5rem", background: "#111", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                    >
                      <Search size={20} />
                    </button>
                  </div>

                  <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    {searchResults.length === 0 ? (
                      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>No results found.</div>
                    ) : (
                      searchResults.map(r => (
                        <div key={r.id} style={{ padding: "1rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600, color: "#111" }}>{r.fullName}</div>
                            <div style={{ fontSize: "0.85rem", color: "#666" }}>{r.email}</div>
                          </div>
                          <button 
                            onClick={() => handleManualCheckIn(r)}
                            style={{ padding: "0.5rem 1rem", background: r.status === "checked-in" ? "#f3f4f6" : "#2b3ff2", color: r.status === "checked-in" ? "#666" : "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
                          >
                            {r.status === "checked-in" ? "Already In" : "Check In"}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              position: "absolute", 
              inset: 0, 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center", 
              alignItems: "center",
              padding: "2rem",
              background: scanState === "SUCCESS" ? "#f0fdf4" : (scanState === "ALREADY_CHECKED_IN" ? "#fefce8" : "#fef2f2"),
              zIndex: 10
            }}>
              <div style={{ marginBottom: "2rem" }}>
                {scanState === "SUCCESS" && <CheckCircle size={140} color="#16a34a" />}
                {scanState === "ALREADY_CHECKED_IN" && <AlertTriangle size={140} color="#eab308" />}
                {scanState === "INVALID" && <XCircle size={140} color="#ef4444" />}
              </div>
              
              <h1 style={{ 
                fontSize: "4rem", 
                fontWeight: 700, 
                textAlign: "center", 
                letterSpacing: "-0.03em",
                color: scanState === "SUCCESS" ? "#166534" : (scanState === "ALREADY_CHECKED_IN" ? "#854d0e" : "#991b1b"),
                margin: "0 0 1rem 0"
              }}>
                {message}
              </h1>
              
              {subMessage && (
                <p style={{ 
                  fontSize: "1.75rem", 
                  fontWeight: 600,
                  color: scanState === "SUCCESS" ? "#15803d" : (scanState === "ALREADY_CHECKED_IN" ? "#a16207" : "#b91c1c"),
                  margin: 0,
                  background: scanState === "SUCCESS" ? "#dcfce7" : "transparent",
                  padding: scanState === "SUCCESS" ? "0.5rem 1.5rem" : "0",
                  borderRadius: "99px"
                }}>
                  {subMessage}
                </p>
              )}

              {scanState !== "SUCCESS" && !subMessage && (
                <p style={{ fontSize: "1.5rem", color: "#b91c1c", marginTop: "1rem", fontWeight: 500 }}>
                  Please see a staff member.
                </p>
              )}
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}

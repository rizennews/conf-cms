"use client";

import { useState, useEffect, useRef } from "react";
import { getRegistrationById, checkInById, searchRegistrations } from "../(dashboard)/checkin/actions";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, AlertTriangle, XCircle, QrCode, Search, UserCheck, Camera } from "lucide-react";
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
  const [cameraError, setCameraError] = useState(false);

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
    let html5QrCode: Html5Qrcode;

    if (isStarted && scanState === "IDLE" && !isSearchMode) {
      const startScanner = async () => {
        // Wait briefly for React to finish rendering the DOM element (fixes "Element not found" error)
        await new Promise(r => setTimeout(r, 50));
        if (!document.getElementById("kiosk-reader")) return;
        
        try {
          html5QrCode = new Html5Qrcode("kiosk-reader");
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 300, height: 300 }, aspectRatio: 1.0 },
            async (decodedText) => {
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
              html5QrCode.pause(true);

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
            },
            (error) => {} // ignore frame errors
          );
        } catch (err) {
          console.warn("Camera permission denied or not available.", err);
          setCameraError(true);
        }
      };

      startScanner();

      return () => {
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
        }
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
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#ffffff", padding: "2rem", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital@1&display=swap');
          .editorial-heading { font-family: 'Inter', sans-serif; font-size: 3.5rem; font-weight: 500; letter-spacing: -0.04em; color: #111; margin-bottom: 0.5rem; }
          .editorial-serif { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 400; letter-spacing: 0; }
        `}</style>
        
        <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
          <h1 className="editorial-heading">Start <span className="editorial-serif">kiosk</span></h1>
          <p style={{ margin: "0 0 4rem 0", color: "#888", fontSize: "1.1rem", fontWeight: 400 }}>Select the active event.</p>
          
          <div style={{ textAlign: "left", marginBottom: "2rem" }}>
            <select 
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={{ width: "100%", padding: "1rem 0", border: "none", borderBottom: "2px solid #111", fontSize: "1.2rem", background: "transparent", color: "#111", outline: "none", fontWeight: 500, borderRadius: 0 }}
            >
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setIsStarted(true)}
            style={{ width: "100%", padding: "1.25rem", background: "#2b3ff2", color: "white", border: "none", borderRadius: "99px", fontSize: "1.05rem", fontWeight: 500, cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
            onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >
            Launch Scanner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#ffffff", color: "#111", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital@1&display=swap');

        .scanner-container {
          position: relative;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          aspect-ratio: 1;
          border-radius: 40px;
          overflow: hidden;
          background: #fafafa;
          padding: 0;
        }

        #kiosk-reader {
          width: 100% !important;
          height: 100% !important;
          border-radius: 18px !important;
          overflow: hidden;
        }
        #kiosk-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          transform: scale(1.1); /* Slight zoom to hide edges */
        }

        .editorial-heading {
          font-size: 2.75rem;
          font-weight: 500;
          letter-spacing: -0.03em;
          color: #111;
          margin-bottom: 0.5rem;
        }

        .editorial-serif {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 400;
          letter-spacing: 0;
        }
      `}</style>
      
      {/* Top Bar (Light Mode Minimal) */}
      <div style={{ padding: "1.5rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <QrCode size={20} color="#111" />
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
            {events.find(e => e.id === selectedEvent)?.name || "Event Kiosk"}
          </h2>
        </div>
        <button 
          onClick={() => { setIsStarted(false); setScanState("IDLE"); setIsSearchMode(false); }} 
          style={{ background: "transparent", border: "1px solid #eaeaea", padding: "0.5rem 1rem", borderRadius: "99px", color: "#666", fontWeight: 500, cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.color = "#111"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#eaeaea"; e.currentTarget.style.color = "#666"; }}
        >
          Exit Kiosk
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", padding: "2rem" }}>
        
        {scanState === "IDLE" ? (
          <div style={{ width: "100%", maxWidth: "600px", textAlign: "center" }}>
            
            {!isSearchMode ? (
              <>
                <h1 className="editorial-heading">
                  Scan <span className="editorial-serif">your</span> ticket
                </h1>
                <p style={{ color: "#888", marginBottom: "3.5rem", fontSize: "1.05rem", fontWeight: 400 }}>Hold the QR code inside the frame.</p>
                
                <div className="scanner-container">
                  {cameraError ? (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem", textAlign: "center", background: "#fafafa" }}>
                      <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "50%", marginBottom: "1.25rem" }}>
                        <Camera size={28} color="#ef4444" strokeWidth={1.5} />
                      </div>
                      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#111" }}>Camera Blocked</h3>
                      <p style={{ color: "#666", fontSize: "0.95rem", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>
                        Please click the lock icon in your URL bar to allow camera access.
                      </p>
                      <button 
                        onClick={() => { setCameraError(false); setTimeout(() => window.location.reload(), 100); }}
                        style={{ padding: "0.75rem 1.5rem", background: "white", border: "1px solid #eaeaea", borderRadius: "99px", color: "#111", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
                      >
                        Refresh Page
                      </button>
                    </div>
                  ) : (
                    <div id="kiosk-reader"></div>
                  )}
                </div>
                
                <button 
                  onClick={() => { setIsSearchMode(true); setSearchResults([]); setSearchQuery(""); }}
                  style={{ marginTop: "3rem", background: "transparent", color: "#888", border: "none", fontWeight: 400, cursor: "pointer", fontSize: "1rem", transition: "color 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.color = "#111"}
                  onMouseOut={e => e.currentTarget.style.color = "#888"}
                >
                  No QR code? Search manually &rarr;
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", maxWidth: "480px", margin: "0 auto", width: "100%" }}>
                <h2 className="editorial-heading" style={{ fontSize: "3rem", marginBottom: "3rem" }}>
                  Manual <span className="editorial-serif">search</span>
                </h2>
                
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "2px solid #111", paddingBottom: "0.5rem" }}>
                  <input 
                    type="text" 
                    placeholder="Enter name or email..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleManualSearch()}
                    style={{ flex: 1, padding: "0.5rem", border: "none", fontSize: "1.25rem", background: "transparent", color: "#111", outline: "none", fontWeight: 400 }}
                    autoFocus
                  />
                  <button 
                    onClick={handleManualSearch}
                    disabled={isSearching}
                    style={{ padding: "0 1rem", background: "transparent", color: "#2b3ff2", border: "none", cursor: "pointer" }}
                  >
                    <Search size={28} strokeWidth={1.5} />
                  </button>
                </div>
                
                <button onClick={() => setIsSearchMode(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontWeight: 400, fontSize: "1rem" }}>
                  &larr; Back to scanner
                </button>

                <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "3rem", textAlign: "left" }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#a1a1aa", fontSize: "1.1rem", fontWeight: 400 }}>No results found.</div>
                  ) : (
                    searchResults.map(r => (
                      <div key={r.id} style={{ padding: "1.5rem 0", borderBottom: "1px solid #eaeaea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: "1.1rem", color: "#111", marginBottom: "0.25rem" }}>{r.fullName}</div>
                          <div style={{ fontSize: "0.95rem", color: "#888" }}>{r.email}</div>
                        </div>
                        <button 
                          onClick={() => handleManualCheckIn(r)}
                          style={{ padding: "0.6rem 1.25rem", background: r.status === "checked-in" ? "#fafafa" : "#2b3ff2", color: r.status === "checked-in" ? "#a1a1aa" : "white", borderRadius: "99px", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem", border: r.status === "checked-in" ? "1px solid #eaeaea" : "none" }}
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
            <div style={{ marginBottom: "2rem", animation: "popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              {scanState === "SUCCESS" && <CheckCircle size={140} color="#16a34a" />}
              {scanState === "ALREADY_CHECKED_IN" && <AlertTriangle size={140} color="#eab308" />}
              {scanState === "INVALID" && <XCircle size={140} color="#ef4444" />}
            </div>
            
            <h1 style={{ 
              fontSize: "4rem", 
              fontWeight: 800, 
              textAlign: "center", 
              letterSpacing: "-0.04em",
              color: scanState === "SUCCESS" ? "#166534" : (scanState === "ALREADY_CHECKED_IN" ? "#854d0e" : "#991b1b"),
              margin: "0 0 1rem 0",
              animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
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
                borderRadius: "99px",
                animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
              }}>
                {subMessage}
              </p>
            )}

            {scanState !== "SUCCESS" && !subMessage && (
              <p style={{ fontSize: "1.5rem", color: "#b91c1c", marginTop: "1rem", fontWeight: 500 }}>
                Please see a staff member.
              </p>
            )}

            <style>{`
              @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
              @keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
            `}</style>
          </div>
        )}
        
      </div>
    </div>
  );
}

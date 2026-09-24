"use client";

import { useState, useEffect, useRef } from "react";
import { getRegistrationById, checkInById } from "../(dashboard)/checkin/actions";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, AlertTriangle, XCircle, QrCode } from "lucide-react";
import Link from "next/link";

type ScanState = "IDLE" | "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID";

export default function KioskClient({ events }: { events: any[] }) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || "");
  const [isStarted, setIsStarted] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("IDLE");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // We need to keep a ref to avoid processing the same QR code multiple times in rapid succession
  const lastScannedIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isStarted && scanState === "IDLE") {
      const scanner = new Html5QrcodeScanner("kiosk-reader", { 
        fps: 10, 
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
      }, false);

      scanner.render(async (decodedText) => {
        if (isProcessing) return;
        
        const idMatch = decodedText.match(/\d+/);
        if (!idMatch) {
          handleResult("INVALID", "Invalid QR code format.");
          return;
        }

        const regId = Number(idMatch[0]);
        if (lastScannedIdRef.current === regId) {
          // Ignore same ID if scanned rapidly
          return;
        }

        setIsProcessing(true);
        lastScannedIdRef.current = regId;
        scanner.pause(true);

        const { registration } = await getRegistrationById(regId);
        
        if (!registration || registration.eventId !== selectedEvent) {
          handleResult("INVALID", "Ticket not valid for this event.");
        } else if (registration.status === "checked-in") {
          handleResult("ALREADY_CHECKED_IN", `${registration.fullName || 'Guest'} is already checked in.`);
        } else {
          const res = await checkInById(regId);
          if (res.success) {
            handleResult("SUCCESS", `Welcome, ${registration.fullName || 'Guest'}!`);
          } else {
            handleResult("INVALID", "Server error during check-in.");
          }
        }
        
      }, (error) => {
        // ignore continuous scanning errors
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [isStarted, scanState, isProcessing, selectedEvent]);

  const handleResult = (state: ScanState, msg: string) => {
    setScanState(state);
    setMessage(msg);
    setIsProcessing(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setScanState("IDLE");
      setMessage("");
      lastScannedIdRef.current = null;
    }, 3000);
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
            style={{ width: "100%", padding: "1.1rem", background: "#111", color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: 600, cursor: "pointer" }}
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Top Bar */}
      <div style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eaeaea" }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "#111" }}>
          {events.find(e => e.id === selectedEvent)?.name || "Event Kiosk"}
        </h2>
        <button 
          onClick={() => { setIsStarted(false); setScanState("IDLE"); }} 
          style={{ background: "transparent", border: "1px solid #eaeaea", padding: "0.5rem 1rem", borderRadius: "99px", color: "#666", fontWeight: 600, cursor: "pointer" }}
        >
          Exit Kiosk
        </button>
      </div>

      {/* Main Scanner Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative" }}>
        
        {scanState === "IDLE" ? (
          <div style={{ width: "100%", maxWidth: "600px", textAlign: "center", padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", color: "#111", marginBottom: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Hold your QR Code to the camera</h1>
            <div id="kiosk-reader" style={{ borderRadius: "16px", overflow: "hidden", border: "2px solid #eaeaea" }}></div>
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
            background: scanState === "SUCCESS" ? "#f0fdf4" : (scanState === "ALREADY_CHECKED_IN" ? "#fefce8" : "#fef2f2") 
          }}>
            <div style={{ marginBottom: "2rem" }}>
              {scanState === "SUCCESS" && <CheckCircle size={120} color="#16a34a" />}
              {scanState === "ALREADY_CHECKED_IN" && <AlertTriangle size={120} color="#eab308" />}
              {scanState === "INVALID" && <XCircle size={120} color="#ef4444" />}
            </div>
            
            <h1 style={{ 
              fontSize: "3.5rem", 
              fontWeight: 700, 
              textAlign: "center", 
              letterSpacing: "-0.02em",
              color: scanState === "SUCCESS" ? "#166534" : (scanState === "ALREADY_CHECKED_IN" ? "#854d0e" : "#991b1b") 
            }}>
              {message}
            </h1>
            
            {scanState !== "SUCCESS" && (
              <p style={{ fontSize: "1.5rem", color: scanState === "ALREADY_CHECKED_IN" ? "#a16207" : "#b91c1c", marginTop: "1rem" }}>
                Please see a staff member.
              </p>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}

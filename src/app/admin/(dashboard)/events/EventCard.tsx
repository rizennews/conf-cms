"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { QrCode, Pencil, Link2, CalendarDays, CheckCircle, XCircle } from "lucide-react";

export default function EventCard({ event, origin }: { event: any; origin: string }) {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);

  const eventUrl = `${origin}/${event.slug}`;
  let customFieldsCount = 0;
  try { if (event.customFields) customFieldsCount = JSON.parse(event.customFields).length; } catch(e) {}

  return (
    <>
      <div style={{
        background: "white",
        border: "1px solid #f0f0f0",
        borderRadius: "16px",
        padding: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        flexWrap: "wrap",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem", flex:1 }}>
          {/* Icon */}
          <div style={{ width:"48px", height:"48px", borderRadius:"12px", background:"rgba(43,63,242,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <CalendarDays size={22} color="#2b3ff2" />
          </div>

          {/* Info */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexWrap:"wrap" }}>
              <h3 style={{ margin:0, fontSize:"1.05rem", fontWeight:700, color:"#111" }}>{event.name}</h3>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:"0.3rem",
                padding:"0.15rem 0.6rem", borderRadius:"99px", fontSize:"0.72rem", fontWeight:600,
                background: event.isActive ? "#dcfce7" : "#f3f4f6",
                color: event.isActive ? "#16a34a" : "#9ca3af"
              }}>
                {event.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                {event.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={{ display:"flex", gap:"1rem", color:"#9ca3af", fontSize:"0.82rem", marginTop:"0.35rem", flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
                <Link2 size={12} /> /{event.slug}
              </span>
              <span style={{ color:"#e5e7eb" }}>·</span>
              <span>{customFieldsCount} custom field{customFieldsCount !== 1 ? "s" : ""}</span>
              {event.deadline && (
                <>
                  <span style={{ color:"#e5e7eb" }}>·</span>
                  <span>Deadline: {new Date(event.deadline).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:"0.6rem", flexShrink:0 }}>
          <button
            onClick={() => setShowQR(true)}
            style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:"#f9fafb", border:"1px solid #e5e7eb", color:"#374151", padding:"0.6rem 1rem", borderRadius:"8px", fontWeight:600, cursor:"pointer", fontSize:"0.85rem", transition:"background 0.15s" }}
            onMouseOver={e => (e.currentTarget.style.background="#f3f4f6")}
            onMouseOut={e => (e.currentTarget.style.background="#f9fafb")}
          >
            <QrCode size={15} /> QR Code
          </button>
          <button
            onClick={() => router.push(`/admin/events/${event.id}`)}
            style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:"#111", border:"none", color:"white", padding:"0.6rem 1rem", borderRadius:"8px", fontWeight:600, cursor:"pointer", fontSize:"0.85rem", transition:"background 0.15s" }}
            onMouseOver={e => (e.currentTarget.style.background="#1a1a1a")}
            onMouseOut={e => (e.currentTarget.style.background="#111")}
          >
            <Pencil size={14} /> Edit Form
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:60 }}>
          <div style={{ background:"white", padding:"2rem", borderRadius:"20px", textAlign:"center", maxWidth:"380px", width:"90%", boxShadow:"0 24px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin:"0 0 1.5rem", fontWeight:700, fontSize:"1.1rem" }}>{event.name}</h3>
            <div style={{ padding:"1.25rem", background:"#fafafa", display:"inline-block", borderRadius:"12px", border:"1px solid #f0f0f0" }}>
              <QRCodeSVG value={eventUrl} size={180} />
            </div>
            <p style={{ margin:"1.25rem 0 0.25rem", fontSize:"0.75rem", color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Share Link</p>
            <a href={eventUrl} target="_blank" rel="noopener noreferrer" style={{ color:"#2b3ff2", wordBreak:"break-all", fontSize:"0.85rem", textDecoration:"none", fontWeight:500 }}>{eventUrl}</a>
            <div style={{ marginTop:"1.5rem" }}>
              <button onClick={() => setShowQR(false)} style={{ background:"#111", border:"none", color:"white", padding:"0.75rem 2.5rem", borderRadius:"10px", fontWeight:600, cursor:"pointer", fontSize:"0.9rem", width:"100%" }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

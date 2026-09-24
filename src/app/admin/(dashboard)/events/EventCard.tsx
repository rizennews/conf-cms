"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "./actions";

export default function EventCard({ event, origin }: { event: any; origin: string }) {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      setIsDeleting(true);
      const res = await deleteEvent(event.id);
      if (res?.error) alert(res.error);
      setIsDeleting(false);
    }
  };

  const eventUrl = `${origin}/${event.slug}`;
  let customFieldsCount = 0;
  try { if (event.customFields) customFieldsCount = JSON.parse(event.customFields).length; } catch(e) {}

  return (
    <>
      <div style={{
        background: "#fff",
        border: "1px solid #eaeaea",
        borderRadius: "8px",
        padding: "1.25rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#111" }}>{event.name}</h3>
            <span style={{
              display: "inline-block",
              padding: "0.1rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 500,
              background: event.isActive ? "#f0fdf4" : "#f3f4f6",
              color: event.isActive ? "#16a34a" : "#4b5563",
              border: `1px solid ${event.isActive ? "#bbf7d0" : "#e5e7eb"}`
            }}>
              {event.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "1rem", color: "#666", fontSize: "0.85rem", alignItems: "center" }}>
            <span>/{event.slug}</span>
            <span style={{ color: "#d1d5db" }}>|</span>
            <span>{customFieldsCount} fields</span>
            {event.deadline && (
              <>
                <span style={{ color: "#d1d5db" }}>|</span>
                <span>Deadline: {new Date(event.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ background: "#fff", border: "1px solid #ef4444", color: "#ef4444", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", opacity: isDeleting ? 0.7 : 1 }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={() => setShowQR(true)}
            style={{ background: "#fff", border: "1px solid #eaeaea", color: "#111", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer" }}
          >
            QR Code
          </button>
          <button
            onClick={() => router.push(`/admin/events/${event.id}`)}
            style={{ background: "#111", border: "1px solid #111", color: "#fff", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer" }}
          >
            Edit Form
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 60 }}>
          <div style={{ background: "#fff", padding: "2.5rem", borderRadius: "8px", textAlign: "center", maxWidth: "400px", width: "90%", border: "1px solid #eaeaea" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 600, fontSize: "1.1rem", color: "#111" }}>{event.name}</h3>
            <div style={{ padding: "1.5rem", border: "1px solid #eaeaea", display: "inline-block", borderRadius: "8px" }}>
              <QRCodeSVG value={eventUrl} size={160} />
            </div>
            <div style={{ margin: "1.5rem 0" }}>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>Share Link</div>
              <a href={eventUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#111", fontSize: "0.85rem" }}>{eventUrl}</a>
            </div>
            <button onClick={() => setShowQR(false)} style={{ background: "#111", border: "none", color: "#fff", padding: "0.6rem 2rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", width: "100%" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

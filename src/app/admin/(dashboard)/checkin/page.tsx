import { db } from "../../../../db";
import { events } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import CheckinInterface from "./CheckinInterface";
import Link from "next/link";
import { DoorOpen, ArrowLeft } from "lucide-react";

export default async function CheckinPage() {
  const allEvents = await db.select({
    id: events.id,
    name: events.name,
    isActive: events.isActive,
  }).from(events).where(eq(events.isActive, true));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>

      {/* Hero Banner */}
      <div style={{
        borderRadius: "20px",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)",
        padding: "2rem 2.5rem",
        marginBottom: "1.75rem",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"180px", height:"180px", borderRadius:"50%", background:"radial-gradient(circle, rgba(22,163,74,0.3) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"rgba(22,163,74,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <DoorOpen size={20} color="#4ade80" />
            </div>
            <h1 style={{ color:"#fff", fontSize:"1.6rem", fontWeight:800, margin:0, letterSpacing:"-0.3px" }}>D-Day Check-in</h1>
          </div>
          <p style={{ color:"rgba(255,255,255,0.45)", margin:0, fontSize:"0.9rem" }}>
            Search attendees and mark them as checked in at the door.
          </p>
        </div>
        <Link
          href="/admin/registrations"
          style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.65rem 1.1rem", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"10px", textDecoration:"none", color:"rgba(255,255,255,0.7)", fontWeight:500, fontSize:"0.85rem", backdropFilter:"blur(8px)" }}
        >
          <ArrowLeft size={15} /> Registrations
        </Link>
      </div>

      {allEvents.length === 0 ? (
        <div style={{ background:"white", borderRadius:"16px", border:"1px solid #f0f0f0", padding:"4rem 2rem", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ width:"64px", height:"64px", background:"rgba(22,163,74,0.08)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
            <DoorOpen size={30} color="#16a34a" />
          </div>
          <h3 style={{ color:"#111", margin:"0 0 0.5rem", fontWeight:700 }}>No active events</h3>
          <p style={{ color:"#9ca3af", margin:0, fontSize:"0.9rem" }}>Activate an event first to start checking in attendees.</p>
        </div>
      ) : (
        <CheckinInterface events={allEvents} />
      )}
    </div>
  );
}

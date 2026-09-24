import { db } from "../../../../db";
import { events } from "../../../../db/schema";
import { headers } from "next/headers";
import CreateEventButton from "./CreateEventButton";
import EventCard from "./EventCard";
import { CalendarDays, Plus } from "lucide-react";

export default async function EventsPage() {
  const reqHeaders = await headers();
  const allEvents = await db.select().from(events);
  const host = reqHeaders.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

      {/* Page Hero Banner */}
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
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"180px", height:"180px", borderRadius:"50%", background:"radial-gradient(circle, rgba(43,63,242,0.3) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"rgba(43,63,242,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CalendarDays size={20} color="#818cf8" />
            </div>
            <h1 style={{ color:"#fff", fontSize:"1.6rem", fontWeight:800, margin:0, letterSpacing:"-0.3px" }}>Events & Forms</h1>
          </div>
          <p style={{ color:"rgba(255,255,255,0.45)", margin:0, fontSize:"0.9rem" }}>
            Build registration forms, generate QR codes, and manage event links.
          </p>
        </div>
        <CreateEventButton />
      </div>

      {/* Events List */}
      {allEvents.length === 0 ? (
        <div style={{ background:"white", borderRadius:"16px", border:"1px solid #f0f0f0", padding:"5rem 2rem", textAlign:"center" }}>
          <div style={{ width:"64px", height:"64px", background:"rgba(43,63,242,0.08)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
            <CalendarDays size={30} color="#2b3ff2" />
          </div>
          <h3 style={{ color:"#111", margin:"0 0 0.5rem", fontWeight:700 }}>No events yet</h3>
          <p style={{ color:"#9ca3af", margin:"0 0 1.5rem", fontSize:"0.9rem" }}>Create your first event to start collecting registrations.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          {allEvents.map(evt => <EventCard key={evt.id} event={evt} origin={origin} />)}
        </div>
      )}
    </div>
  );
}

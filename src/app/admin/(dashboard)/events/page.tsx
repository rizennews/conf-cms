import { db } from "../../../../db";
import { events } from "../../../../db/schema";
import { headers } from "next/headers";
import CreateEventButton from "./CreateEventButton";
import EventCard from "./EventCard";

export default async function EventsPage() {
  const reqHeaders = await headers();
  const allEvents = await db.select().from(events);
  const host = reqHeaders.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Events & Forms</h1>
          <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>
            Build registration forms, generate QR codes, and manage event links.
          </p>
        </div>
        <CreateEventButton />
      </div>

      <div style={{ borderTop: "1px solid #eaeaea", paddingTop: "2rem" }}>
        {allEvents.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#666", fontSize: "0.95rem" }}>
            No events yet. Create your first event to start collecting registrations.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {allEvents.map(evt => <EventCard key={evt.id} event={evt} origin={origin} />)}
          </div>
        )}
      </div>
    </div>
  );
}

import { db } from "../../../../db";
import { events } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import CheckinInterface from "./CheckinInterface";
import Link from "next/link";

export default async function CheckinPage() {
  const allEvents = await db.select({
    id: events.id,
    name: events.name,
    isActive: events.isActive,
    customFields: events.customFields,
  }).from(events).where(eq(events.isActive, true));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>D-Day Check-in</h1>
          <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>Search attendees and mark them as checked in at the door.</p>
        </div>
        <Link
          href="/admin/registrations"
          style={{ background: "#fff", border: "1px solid #eaeaea", color: "#111", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", textDecoration: "none" }}
        >
          All Registrations
        </Link>
      </div>

      <div style={{ borderTop: "1px solid #eaeaea", paddingTop: "2rem" }}>
        {allEvents.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#666", fontSize: "0.95rem" }}>
            No active events. Activate an event first to start checking in attendees.
          </div>
        ) : (
          <CheckinInterface events={allEvents} />
        )}
      </div>
    </div>
  );
}

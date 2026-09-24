import { db } from "../../../../db";
import { registrations, events, branches } from "../../../../db/schema";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const allEvents = await db.select().from(events);
  const allRegistrations = await db.select().from(registrations);
  const allBranchesData = await db.select().from(branches);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Advanced Analytics</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>Visualize event sign-ups, demographics, and check-in rates.</p>
      </div>
      
      <AnalyticsClient 
        registrations={allRegistrations} 
        events={allEvents} 
        branches={allBranchesData} 
      />
    </div>
  );
}

import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../db";
import { registrations, events, branches, user } from "../../../db/schema";
import { eq, count, desc } from "drizzle-orm";
import DashboardStats from "./DashboardStats";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  const resolvedParams = await searchParams;
  const eventId = resolvedParams.eventId;

  let allRegs = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  const currentUser = await db.select().from(user).where(eq(user.id, session?.user.id as string)).limit(1);
  const userRole = currentUser[0]?.role || "branch_head";
  const userBranchId = currentUser[0]?.branchId;

  if (userRole === "branch_head" && userBranchId) {
    allRegs = allRegs.filter(r => r.branchId === userBranchId);
  }

  const activeEventsResult = await db.select({ count: count() }).from(events).where(eq(events.isActive, true));
  const totalBranchesResult = await db.select({ count: count() }).from(branches);
  
  const filteredRegs = eventId ? allRegs.filter(r => r.eventId === eventId) : allRegs;
  
  const totalRegs = filteredRegs.length;
  const checkedIn = filteredRegs.filter(r => r.status === "checked-in").length;
  const recentRegs = filteredRegs.slice(0, 5);

  const activeEvents = Number(activeEventsResult[0]?.count ?? 0);
  const totalBranches = Number(totalBranchesResult[0]?.count ?? 0);
  const checkInPct = totalRegs > 0 ? Math.round((checkedIn / totalRegs) * 100) : 0;

  const allEvents = await db.select().from(events);
  const eventMap = Object.fromEntries(allEvents.map(e => [e.id, e.name]));

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Overview</h1>
        <p style={{ color: "#666", fontSize: "0.95rem", margin: 0 }}>View your current registration and check-in metrics.</p>
      </div>

      <DashboardStats
        totalRegs={totalRegs}
        checkedIn={checkedIn}
        activeEvents={activeEvents}
        totalBranches={totalBranches}
        checkInPct={checkInPct}
        events={allEvents}
        selectedEventId={eventId || ""}
      />

      <div style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", margin: "0 0 1rem 0" }}>Recent Sign-ups</h2>
        <div style={{ border: "1px solid #eaeaea", borderRadius: "8px", background: "#fff", overflow: "hidden" }}>
          {recentRegs.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#666", fontSize: "0.95rem" }}>
              No sign-ups yet.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {recentRegs.map((r, i) => {
                  const isCheckedIn = r.status === "checked-in";
                  return (
                    <tr key={r.id} style={{ borderTop: i > 0 ? "1px solid #eaeaea" : "none" }}>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ fontWeight: 500, color: "#111", fontSize: "0.95rem" }}>{r.fullName || "Unknown"}</div>
                        <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.2rem" }}>{r.email}</div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", color: "#666", fontSize: "0.9rem" }}>
                        {r.eventId ? (eventMap[r.eventId] || r.eventId) : "No event"}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <span style={{ 
                          display: "inline-block", 
                          padding: "0.25rem 0.6rem", 
                          borderRadius: "4px", 
                          fontSize: "0.75rem", 
                          fontWeight: 500, 
                          background: isCheckedIn ? "#f0fdf4" : "#f3f4f6", 
                          color: isCheckedIn ? "#16a34a" : "#4b5563",
                          border: `1px solid ${isCheckedIn ? "#bbf7d0" : "#e5e7eb"}`
                        }}>
                          {isCheckedIn ? "Checked In" : "Registered"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../db";
import { registrations, events, branches, user } from "../../../db/schema";
import { eq, count, desc, not } from "drizzle-orm";
import DashboardStats from "./DashboardStats";
import DashboardCharts from "./DashboardCharts";

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


  const totalBranchesResult = await db.select({ count: count() }).from(branches).where(not(eq(branches.id, "other")));
  
  const filteredRegs = eventId ? allRegs.filter(r => r.eventId === eventId) : allRegs;
  
  const totalRegs = filteredRegs.length;
  const checkedIn = filteredRegs.filter(r => r.status === "checked-in").length;
  const recentRegs = filteredRegs.slice(0, 5);


  const totalBranches = Number(totalBranchesResult[0]?.count ?? 0);
  const checkInPct = totalRegs > 0 ? Math.round((checkedIn / totalRegs) * 100) : 0;

  const externalChurches = new Set(
    filteredRegs
      .filter(r => r.branchId === "other" && r.customData)
      .map(r => {
        try {
          const custom = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
          return custom.specifiedBranch || "Unknown";
        } catch {
          return "Unknown";
        }
      })
      .filter(name => name !== "Unknown")
  ).size;

  const allEvents = await db.select().from(events);
  const eventMap = Object.fromEntries(allEvents.map(e => [e.id, e.name]));

  // Data for Charts
  const dateMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    if (!r.createdAt) return;
    const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateMap[date] = (dateMap[date] || 0) + 1;
  });
  const registrationsByDate = Object.entries(dateMap).map(([date, count]) => ({ date, count })).slice(-14);

  const ageMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    const age = r.ageRange || "Unknown";
    ageMap[age] = (ageMap[age] || 0) + 1;
  });
  const ageDemographics = Object.entries(ageMap).map(([name, value]) => ({ name, value })).filter(d => d.name !== "Unknown");

  const statusMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    const status = r.registrantStatus || "Unknown";
    statusMap[status] = (statusMap[status] || 0) + 1;
  });
  const registrantStatuses = Object.entries(statusMap).map(([name, value]) => ({ name, value })).filter(d => d.name !== "Unknown");

  const inviterMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    const inviter = r.invitees?.trim();
    if (inviter) {
      // Normalize names (e.g., capitalize first letters)
      const name = inviter.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      inviterMap[name] = (inviterMap[name] || 0) + 1;
    }
  });
  const topInviters = Object.entries(inviterMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  const referralMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    const source = r.heardFrom?.trim();
    if (source) {
      const normalized = source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
      referralMap[normalized] = (referralMap[normalized] || 0) + 1;
    }
  });
  const referralSources = Object.entries(referralMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const allBranchesArray = await db.select().from(branches);
  const branchMap = Object.fromEntries(allBranchesArray.map(b => [b.id, b.name]));

  const branchCountMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    if (r.branchId !== "other") {
      const bName = branchMap[r.branchId] || "Unknown";
      branchCountMap[bName] = (branchCountMap[bName] || 0) + 1;
    }
  });
  const topBranches = Object.entries(branchCountMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const attendanceData = [
    { name: "Checked In", value: checkedIn },
    { name: "Not Arrived", value: totalRegs - checkedIn }
  ].filter(d => d.value > 0);

  // Dynamic Custom Charts
  let eventCustomFields: any[] = [];
  if (eventId) {
    const ev = allEvents.find(e => e.id === eventId);
    if (ev && ev.customFields) {
      try { eventCustomFields = JSON.parse(ev.customFields); } catch(e) {}
    }
  }
  
  const dynamicCharts: any[] = [];
  eventCustomFields.forEach(field => {
    if (field.type === "select" || field.type === "radio") {
      const fieldCounts: Record<string, number> = {};
      filteredRegs.forEach(r => {
        if (r.customData) {
          try {
            const cData = typeof r.customData === "string" ? JSON.parse(r.customData) : r.customData;
            const answer = cData[field.label];
            if (answer) {
              fieldCounts[answer] = (fieldCounts[answer] || 0) + 1;
            }
          } catch(e) {}
        }
      });
      const data = Object.entries(fieldCounts).map(([name, value]) => ({ name, value }));
      if (data.length > 0) {
        dynamicCharts.push({ title: field.label, data });
      }
    }
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Overview</h1>
        <p style={{ color: "#666", fontSize: "0.95rem", margin: 0 }}>View your current registration and check-in metrics.</p>
      </div>

      <DashboardStats
        totalRegs={totalRegs}
        checkedIn={checkedIn}
        totalBranches={totalBranches}
        externalChurches={externalChurches}
        checkInPct={checkInPct}
        events={allEvents}
        selectedEventId={eventId || ""}
      />

      <DashboardCharts 
        registrationsByDate={registrationsByDate}
        ageDemographics={ageDemographics}
        registrantStatuses={registrantStatuses}
        topInviters={topInviters}
        referralSources={referralSources}
        topBranches={topBranches}
        attendanceData={attendanceData}
        dynamicCharts={dynamicCharts}
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

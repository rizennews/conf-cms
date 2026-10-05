import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../db";
import { registrations, user, events } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import EvangelistTable from "./EvangelistTable";

export default async function EvangelistsPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  
  if (!session) {
    return <div>Unauthorized</div>;
  }

  const resolvedParams = await searchParams;
  let eventId = resolvedParams.eventId;

  if (!eventId) {
    const allEvents = await db.select().from(events).orderBy(desc(events.createdAt));
    const mainEvent = allEvents.find(e => e.isMainEvent) || allEvents[0];
    eventId = mainEvent?.id;
  }

  const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const userRole = currentUser[0]?.role || "branch_head";
  const userBranchId = currentUser[0]?.branchId;

  let allRegs = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  
  if (eventId) {
    allRegs = allRegs.filter(r => r.eventId === eventId);
  }

  if (userRole === "branch_head" && userBranchId) {
    allRegs = allRegs.filter(r => r.branchId === userBranchId);
  }

  // Group by evangelist (invitees)
  const evangelistMap: Record<string, any[]> = {};
  
  allRegs.forEach(r => {
    if (r.invitees && r.invitees.trim().length > 0) {
      // Normalize name to handle slight typos or cases if needed, but for now exact match (trimmed)
      const name = r.invitees.trim();
      if (!evangelistMap[name]) evangelistMap[name] = [];
      evangelistMap[name].push(r);
    }
  });

  const evangelists = Object.entries(evangelistMap).map(([name, inviteesList]) => {
    const checkedInCount = inviteesList.filter(i => i.status === "checked-in").length;
    return {
      name,
      totalInvited: inviteesList.length,
      checkedInCount,
      invitees: inviteesList.map(i => ({
        id: i.id,
        fullName: i.fullName,
        whatsapp: i.whatsapp,
        status: i.status || "registered",
        createdAt: i.createdAt
      }))
    };
  });

  // Sort by most invited
  evangelists.sort((a, b) => b.totalInvited - a.totalInvited);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
          Top Evangelists
        </h1>
        <p style={{ color: "#666", fontSize: "0.95rem", margin: 0 }}>
          See who is inviting the most people and track the check-in status of their invitees.
        </p>
      </div>

      <EvangelistTable data={evangelists} />
    </div>
  );
}

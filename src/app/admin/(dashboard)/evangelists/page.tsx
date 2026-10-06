import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../db";
import { registrations, user, events } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import EvangelistTable from "./EvangelistTable";
import Image from "next/image";

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
  const evangelistMap: Record<string, Record<string, unknown>[]> = {};
  
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
        id: String(i.id),
        fullName: String(i.fullName),
        whatsapp: i.whatsapp ? String(i.whatsapp) : null,
        status: i.status ? String(i.status) : "registered",
        createdAt: String(i.createdAt)
      }))
    };
  });

  // Sort by most invited
  evangelists.sort((a, b) => b.totalInvited - a.totalInvited);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.03em" }}>
            Top Evangelists
          </h1>
          <p style={{ color: "#666", fontSize: "0.95rem", margin: 0 }}>
            See who is inviting the most people and track the check-in status of their invitees.
          </p>
        </div>
        <div style={{ background: "#fff", padding: "0.5rem 1rem", borderRadius: "12px", border: "1px solid #eaeaea", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <Image src="/LCC-LOGO.png" alt="Church Logo" width={80} height={80} style={{ objectFit: 'contain' }} unoptimized />
        </div>
      </div>

      <EvangelistTable data={evangelists} />
    </div>
  );
}

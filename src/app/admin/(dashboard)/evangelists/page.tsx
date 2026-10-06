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

  // Parse raw invitees text
  function parseInviteesText(text: string) {
    if (text.includes('\n') || text.includes(',')) {
      return text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map(s => {
         const match = s.match(/(.+?)[-:]?\s*(\+?\d{8,15})/);
         if (match) return { name: match[1].trim().replace(/^\d+\.\s*/, ''), phone: match[2].trim() };
         return { name: s.replace(/^\d+\.\s*/, ''), phone: "" };
      });
    }
    const regex = /(.+?)[-:]?\s*(\+?\d{8,15})/g;
    let match;
    const results = [];
    while ((match = regex.exec(text)) !== null) {
      results.push({ name: match[1].trim().replace(/^\d+\.\s*/, ''), phone: match[2].trim() });
    }
    if (results.length === 0) return [{ name: text.trim(), phone: "" }];
    return results;
  }

  // The Evangelist is the person who filled out the form (r.fullName)
  // The Invitees are the people listed in r.invitees
  const evangelistsMap: Record<string, { name: string; totalInvited: number; checkedInCount: number; invitees: { id: string; fullName: string; whatsapp: string | null; status: string; createdAt: string | Date; }[] }> = {};

  allRegs.forEach(r => {
    if (r.invitees && r.invitees.trim().length > 0) {
      const evangelistName = r.fullName ? String(r.fullName).trim() : "Unknown";
      const parsedInvitees = parseInviteesText(r.invitees);
      
      if (!evangelistsMap[evangelistName]) {
        evangelistsMap[evangelistName] = {
          name: evangelistName,
          totalInvited: 0,
          checkedInCount: 0,
          invitees: []
        };
      }

      parsedInvitees.forEach((inv, idx) => {
        // Try to find if this invitee actually registered and checked in!
        const matchedReg = allRegs.find(reg => 
          (inv.phone && reg.whatsapp && reg.whatsapp.includes(inv.phone)) ||
          (inv.name && reg.fullName && String(reg.fullName).toLowerCase() === inv.name.toLowerCase())
        );

        const status = matchedReg?.status === "checked-in" ? "checked-in" : "registered";
        if (status === "checked-in") {
          evangelistsMap[evangelistName].checkedInCount++;
        }

        evangelistsMap[evangelistName].invitees.push({
          id: `${r.id}-${idx}`,
          fullName: inv.name,
          whatsapp: inv.phone || null,
          status: status,
          createdAt: matchedReg?.createdAt || r.createdAt
        });
      });

      evangelistsMap[evangelistName].totalInvited += parsedInvitees.length;
    }
  });

  const evangelists = Object.values(evangelistsMap);
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
      </div>

      <EvangelistTable data={evangelists} />
    </div>
  );
}

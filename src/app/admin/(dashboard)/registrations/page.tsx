import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../db";
import { registrations, user, events } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import RegistrationsTable from "./RegistrationsTable";
import { ClipboardList } from "lucide-react";

export default async function RegistrationsPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  // Get current user role
  let role = "branch_head";
  let userBranchId = null;
  const currentUser = await db.select().from(user).where(eq(user.id, session!.user.id)).limit(1);
  if (currentUser.length > 0) {
    role = currentUser[0].role;
    userBranchId = currentUser[0].branchId;
  }

  // Fetch registrations based on role
  let regsQuery = db.select({
    id: registrations.id,
    fullName: registrations.fullName,
    email: registrations.email,
    whatsapp: registrations.whatsapp,
    branchId: registrations.branchId,
    eventId: registrations.eventId,
    createdAt: registrations.createdAt,
    customData: registrations.customData
  }).from(registrations).orderBy(desc(registrations.createdAt));

  if (role === "branch_head" && userBranchId) {
    regsQuery = regsQuery.where(eq(registrations.branchId, userBranchId)) as any;
  }

  const allRegs = await regsQuery;
  const allEvents = await db.select().from(events);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

      {/* Hero Banner */}
      <div style={{
        borderRadius: "20px",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)",
        padding: "2rem 2.5rem",
        marginBottom: "1.75rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"180px", height:"180px", borderRadius:"50%", background:"radial-gradient(circle, rgba(43,63,242,0.3) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem" }}>
          <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"rgba(43,63,242,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <ClipboardList size={20} color="#818cf8" />
          </div>
          <h1 style={{ color:"#fff", fontSize:"1.6rem", fontWeight:800, margin:0, letterSpacing:"-0.3px" }}>Registrations</h1>
        </div>
        <p style={{ color:"rgba(255,255,255,0.45)", margin:0, fontSize:"0.9rem" }}>View, search, export, and bulk import all event sign-ups.</p>
      </div>

      <RegistrationsTable data={allRegs} events={allEvents} canBulkUpload={role === "super_admin" || role === "admin"} />
    </div>
  );
}

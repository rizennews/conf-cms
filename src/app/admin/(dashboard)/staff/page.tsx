import { db } from "../../../../db";
import { user, branches } from "../../../../db/schema";
import StaffTable from "./StaffTable";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Users } from "lucide-react";

export default async function StaffPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  
  if (!session) redirect("/admin/login");

  const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  if (currentUser[0]?.role !== "super_admin") {
    return (
      <div style={{ padding: "2rem", color: "#ef4444" }}>
        <h2>Unauthorized</h2>
        <p>You do not have permission to access the Staff Management page.</p>
      </div>
    );
  }

  const allUsers = await db.select().from(user).orderBy(user.createdAt);
  const allBranches = await db.select().from(branches).orderBy(branches.name);

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
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"180px", height:"180px", borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem" }}>
          <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"rgba(99,102,241,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Users size={20} color="#a5b4fc" />
          </div>
          <h1 style={{ color:"#fff", fontSize:"1.6rem", fontWeight:800, margin:0, letterSpacing:"-0.3px" }}>Staff & Users</h1>
        </div>
        <p style={{ color:"rgba(255,255,255,0.45)", margin:0, fontSize:"0.9rem" }}>Manage system access, roles, and branch assignments.</p>
      </div>

      <StaffTable users={allUsers} branches={allBranches} />
    </div>
  );
}

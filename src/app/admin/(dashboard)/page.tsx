import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../db";
import { registrations, events, branches, user } from "../../../db/schema";
import { eq, count, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowUpRight, Activity } from "lucide-react";
import DashboardStats from "./DashboardStats";

export default async function AdminDashboardPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  const [totalRegsResult, checkedInResult, activeEventsResult, totalBranchesResult, recentRegs] = await Promise.all([
    db.select({ count: count() }).from(registrations),
    db.select({ count: count() }).from(registrations).where(eq(registrations.status, "checked-in")),
    db.select({ count: count() }).from(events).where(eq(events.isActive, true)),
    db.select({ count: count() }).from(branches),
    db.select({ id: registrations.id, fullName: registrations.fullName, email: registrations.email, eventId: registrations.eventId, status: registrations.status, createdAt: registrations.createdAt }).from(registrations).orderBy(desc(registrations.createdAt)).limit(5),
  ]);

  const totalRegs = Number(totalRegsResult[0]?.count ?? 0);
  const checkedIn = Number(checkedInResult[0]?.count ?? 0);
  const activeEvents = Number(activeEventsResult[0]?.count ?? 0);
  const totalBranches = Number(totalBranchesResult[0]?.count ?? 0);
  const checkInPct = totalRegs > 0 ? Math.round((checkedIn / totalRegs) * 100) : 0;

  const allEvents = await db.select().from(events);
  const eventMap = Object.fromEntries(allEvents.map(e => [e.id, e.name]));
  const firstName = session?.user.name?.split(" ")[0] || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const avatarColors = [
    ["#dbeafe","#1d4ed8"],["#dcfce7","#15803d"],["#fef3c7","#b45309"],
    ["#f3e8ff","#7e22ce"],["#ffe4e6","#be123c"],["#ccfbf1","#0f766e"],
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

      {/* Hero Banner */}
      <div style={{
        borderRadius: "20px",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)",
        padding: "2.5rem",
        marginBottom: "1.75rem",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
        <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"240px", height:"240px", borderRadius:"50%", background:"radial-gradient(circle, rgba(43,63,242,0.35) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-80px", left:"30%", width:"200px", height:"200px", borderRadius:"50%", background:"radial-gradient(circle, rgba(221,101,52,0.2) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"relative" }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.85rem", margin:"0 0 0.4rem", fontWeight:500 }}>{greeting}</p>
          <h1 style={{ color:"#fff", fontSize:"2rem", fontWeight:800, margin:"0 0 0.5rem", letterSpacing:"-0.5px" }}>{firstName} 👋</h1>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.9rem", margin:0 }}>
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
          </p>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"1.25rem 1.75rem", backdropFilter:"blur(12px)", textAlign:"center", position:"relative" }}>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.78rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.4rem" }}>Check-in Rate</div>
          <div style={{ color:"#fff", fontSize:"2.5rem", fontWeight:800, lineHeight:1 }}>{checkInPct}<span style={{ fontSize:"1.2rem", opacity:0.6 }}>%</span></div>
          <div style={{ marginTop:"0.75rem", height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"99px", width:"120px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${checkInPct}%`, background:"linear-gradient(90deg,#2b3ff2,#6366f1)", borderRadius:"99px" }} />
          </div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.75rem", marginTop:"0.5rem" }}>{checkedIn} of {totalRegs} attended</div>
        </div>
      </div>

      {/* Interactive Stats + Actions (Client Component) */}
      <DashboardStats
        totalRegs={totalRegs}
        checkedIn={checkedIn}
        activeEvents={activeEvents}
        totalBranches={totalBranches}
        checkInPct={checkInPct}
      />

      {/* Recent Sign-ups (Server rendered) */}
      <div style={{ marginTop:"1.75rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <Activity size={18} color="#374151" />
            <h2 style={{ margin:0, fontSize:"0.95rem", fontWeight:700, color:"#111" }}>Recent Sign-ups</h2>
          </div>
          <Link href="/admin/registrations" style={{ color:"#2b3ff2", textDecoration:"none", fontSize:"0.82rem", fontWeight:600, display:"flex", alignItems:"center", gap:"0.3rem" }}>
            View all <ArrowUpRight size={13} />
          </Link>
        </div>

        <div style={{ background:"white", borderRadius:"16px", border:"1px solid #f0f0f0", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          {recentRegs.length === 0 ? (
            <div style={{ padding:"4rem 2rem", textAlign:"center" }}>
              <div style={{ width:"56px", height:"56px", background:"#f9fafb", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
                <Activity size={24} color="#d1d5db" />
              </div>
              <p style={{ color:"#9ca3af", margin:0, fontWeight:500 }}>No sign-ups yet</p>
              <p style={{ color:"#d1d5db", fontSize:"0.82rem", marginTop:"0.4rem" }}>Share your event link to start collecting registrations</p>
            </div>
          ) : recentRegs.map((r, i) => {
            const [bg, text] = avatarColors[i % avatarColors.length];
            const initials = (r.fullName || "?").split(" ").map((n:string) => n[0]).join("").slice(0,2).toUpperCase();
            const isCheckedIn = r.status === "checked-in";
            return (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"1rem 1.5rem", borderTop:i > 0 ? "1px solid #f7f7f7" : "none" }}>
                <div style={{ width:"38px", height:"38px", borderRadius:"50%", background:bg, color:text, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.8rem", flexShrink:0 }}>
                  {initials}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, color:"#111", fontSize:"0.9rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.fullName || "Unknown"}</div>
                  <div style={{ fontSize:"0.78rem", color:"#9ca3af", marginTop:"0.1rem" }}>{r.eventId ? (eventMap[r.eventId] || r.eventId) : "No event"}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", padding:"0.2rem 0.65rem", borderRadius:"99px", fontSize:"0.75rem", fontWeight:600, background:isCheckedIn ? "#dcfce7" : "#f3f4f6", color:isCheckedIn ? "#16a34a" : "#6b7280" }}>
                    <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:isCheckedIn ? "#16a34a" : "#9ca3af", display:"inline-block" }} />
                    {isCheckedIn ? "Attended" : "Registered"}
                  </span>
                  <div style={{ fontSize:"0.73rem", color:"#c4c4c4", marginTop:"0.3rem" }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

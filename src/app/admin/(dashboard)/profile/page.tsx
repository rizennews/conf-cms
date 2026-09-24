import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { User, Shield, Mail } from "lucide-react";

export default async function ProfilePage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) redirect("/admin/login");

  const initials = session.user.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>

      {/* Hero Banner */}
      <div style={{
        borderRadius: "20px",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)",
        padding: "2rem 2.5rem",
        marginBottom: "1.75rem",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
      }}>
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"180px", height:"180px", borderRadius:"50%", background:"radial-gradient(circle, rgba(43,63,242,0.3) 0%, transparent 70%)", pointerEvents:"none" }} />
        
        {/* Avatar */}
        <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"linear-gradient(135deg,#2b3ff2,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", fontWeight:800, color:"white", flexShrink:0 }}>
          {initials}
        </div>

        <div>
          <h1 style={{ color:"#fff", fontSize:"1.5rem", fontWeight:800, margin:"0 0 0.3rem", letterSpacing:"-0.3px" }}>{session.user.name}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"rgba(255,255,255,0.5)", fontSize:"0.85rem" }}>
            <Mail size={13} />
            <span>{session.user.email}</span>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div style={{ background:"white", borderRadius:"16px", border:"1px solid #f0f0f0", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid #f7f7f7", display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <Shield size={18} color="#374151" />
          <h2 style={{ margin:0, fontSize:"0.95rem", fontWeight:700, color:"#111" }}>Change Password</h2>
        </div>
        <div style={{ padding:"1.5rem" }}>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}

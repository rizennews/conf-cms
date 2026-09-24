import { db } from "../../../../db";
import { branches } from "../../../../db/schema";
import CreateBranchForm from "./CreateBranchForm";
import { Building2 } from "lucide-react";

export default async function BranchesPage() {
  const allBranches = await db.select().from(branches);

  const colors = [
    ["#dbeafe","#1d4ed8"],["#dcfce7","#15803d"],["#fef3c7","#b45309"],
    ["#f3e8ff","#7e22ce"],["#ffe4e6","#be123c"],["#ccfbf1","#0f766e"],
    ["#fce7f3","#9d174d"],["#e0f2fe","#0369a1"],
  ];

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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"180px", height:"180px", borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.5rem" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Building2 size={20} color="#a78bfa" />
            </div>
            <h1 style={{ color:"#fff", fontSize:"1.6rem", fontWeight:800, margin:0, letterSpacing:"-0.3px" }}>
              Branches
              <span style={{ marginLeft:"0.75rem", background:"rgba(139,92,246,0.3)", color:"#c4b5fd", fontSize:"0.9rem", padding:"0.1rem 0.6rem", borderRadius:"99px", fontWeight:600 }}>{allBranches.length}</span>
            </h1>
          </div>
          <p style={{ color:"rgba(255,255,255,0.45)", margin:0, fontSize:"0.9rem" }}>
            Manage church branches for multi-tenancy and data separation.
          </p>
        </div>
        <CreateBranchForm />
      </div>

      {/* Branch Cards Grid */}
      {allBranches.length === 0 ? (
        <div style={{ background:"white", borderRadius:"16px", border:"1px solid #f0f0f0", padding:"5rem 2rem", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ width:"64px", height:"64px", background:"rgba(139,92,246,0.08)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
            <Building2 size={30} color="#8b5cf6" />
          </div>
          <h3 style={{ color:"#111", margin:"0 0 0.5rem", fontWeight:700 }}>No branches yet</h3>
          <p style={{ color:"#9ca3af", margin:0, fontSize:"0.9rem" }}>Add your first church branch to start managing local data.</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:"1rem" }}>
          {allBranches.map((branch, i) => {
            const [bg, text] = colors[i % colors.length];
            const initials = branch.name.split(" ").map((w:string) => w[0]).join("").slice(0,2).toUpperCase();
            return (
              <div key={branch.id} style={{
                background:"white",
                border:"1px solid #f0f0f0",
                borderRadius:"16px",
                padding:"1.5rem",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
                transition:"box-shadow 0.2s, transform 0.2s",
              }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.boxShadow="0 6px 20px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem" }}>
                  <div style={{ width:"46px", height:"46px", borderRadius:"12px", background:bg, color:text, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.95rem", flexShrink:0 }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:"#111", fontSize:"0.95rem" }}>{branch.name}</div>
                    <div style={{ fontSize:"0.75rem", color:"#9ca3af", marginTop:"0.2rem" }}>
                      {new Date(branch.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </div>
                  </div>
                </div>
                <div style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:"8px", padding:"0.5rem 0.75rem" }}>
                  <span style={{ fontFamily:"monospace", fontSize:"0.78rem", color:"#6b7280" }}>{branch.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

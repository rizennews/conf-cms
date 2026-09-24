"use client";

import Link from "next/link";
import { Users, CheckCircle, CalendarDays, Building2, DoorOpen, ClipboardList, ArrowUpRight, Zap } from "lucide-react";

interface Props {
  totalRegs: number;
  checkedIn: number;
  activeEvents: number;
  totalBranches: number;
  checkInPct: number;
}

const QUICK_ACTIONS = [
  { href:"/admin/checkin", label:"Open Check-in", sub:"Scan attendees at the door", icon:DoorOpen, dark:true, accent:"#2b3ff2" },
  { href:"/admin/registrations", label:"Registrations", sub:"View & export all data", icon:ClipboardList, dark:false, accent:"#2b3ff2" },
  { href:"/admin/events", label:"Manage Events", sub:"Edit forms & settings", icon:CalendarDays, dark:false, accent:"#f59e0b" },
  { href:"/admin/staff", label:"Staff & Users", sub:"Roles & permissions", icon:Users, dark:false, accent:"#8b5cf6" },
];

export default function DashboardStats({ totalRegs, checkedIn, activeEvents, totalBranches, checkInPct }: Props) {
  const stats = [
    { label:"Registrations", value:totalRegs, Icon:Users, accent:"#2b3ff2", light:"rgba(43,63,242,0.08)", href:"/admin/registrations" },
    { label:"Checked In", value:checkedIn, Icon:CheckCircle, accent:"#16a34a", light:"rgba(22,163,74,0.08)", href:"/admin/checkin" },
    { label:"Active Events", value:activeEvents, Icon:CalendarDays, accent:"#f59e0b", light:"rgba(245,158,11,0.08)", href:"/admin/events" },
    { label:"Branches", value:totalBranches, Icon:Building2, accent:"#8b5cf6", light:"rgba(139,92,246,0.08)", href:"/admin/branches" },
  ];

  return (
    <>
      <style>{`
        .stat-card { transition: box-shadow 0.2s, transform 0.2s; }
        .stat-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important; transform: translateY(-2px); }
        .action-card-dark { transition: background 0.15s; }
        .action-card-dark:hover { background: #1a1a1a !important; }
        .action-card-light { transition: background 0.15s; }
        .action-card-light:hover { background: #f9fafb !important; }
      `}</style>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(210px, 1fr))", gap:"1rem", marginBottom:"1.75rem" }}>
        {stats.map(({ label, value, Icon, accent, light, href }) => (
          <Link key={label} href={href} style={{ textDecoration:"none" }}>
            <div className="stat-card" style={{
              background:"white", borderRadius:"16px", padding:"1.5rem",
              border:"1px solid #f0f0f0", cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
                <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:light, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={20} color={accent} strokeWidth={2} />
                </div>
                <ArrowUpRight size={16} color="#d1d5db" />
              </div>
              <div style={{ fontSize:"2.25rem", fontWeight:800, color:"#111", lineHeight:1, marginBottom:"0.4rem" }}>{value}</div>
              <div style={{ fontSize:"0.85rem", color:"#6b7280", fontWeight:500 }}>{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Check-in bar */}
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:"1.25rem", alignItems:"start" }}>
        <div style={{ background:"white", borderRadius:"16px", border:"1px solid #f0f0f0", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid #f7f7f7", display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <Zap size={16} color="#374151" />
            <h2 style={{ margin:0, fontSize:"0.95rem", fontWeight:700, color:"#111" }}>Quick Actions</h2>
          </div>
          <div style={{ padding:"0.75rem" }}>
            {QUICK_ACTIONS.map(({ href, label, sub, icon:Icon, dark, accent }) => (
              <Link key={href} href={href} style={{ textDecoration:"none" }}>
                <div
                  className={dark ? "action-card-dark" : "action-card-light"}
                  style={{ display:"flex", alignItems:"center", gap:"0.85rem", padding:"0.85rem 0.75rem", borderRadius:"10px", background:dark ? "#111" : "transparent", marginBottom:"0.25rem" }}
                >
                  <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:dark ? "rgba(255,255,255,0.1)" : `${accent}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon size={18} color={dark ? "#fff" : accent} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.88rem", fontWeight:600, color:dark ? "#fff" : "#111" }}>{label}</div>
                    <div style={{ fontSize:"0.75rem", color:dark ? "rgba(255,255,255,0.45)" : "#9ca3af", marginTop:"0.1rem" }}>{sub}</div>
                  </div>
                  <ArrowUpRight size={14} color={dark ? "rgba(255,255,255,0.3)" : "#d1d5db"} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Check-in progress panel */}
        <div style={{ background:"white", borderRadius:"16px", border:"1px solid #f0f0f0", padding:"1.75rem", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <h2 style={{ margin:0, fontSize:"0.95rem", fontWeight:700, color:"#111" }}>Check-in Progress</h2>
            <span style={{ fontSize:"2rem", fontWeight:800, color:"#16a34a" }}>{checkInPct}%</span>
          </div>
          <div style={{ height:"10px", background:"#f3f4f6", borderRadius:"99px", overflow:"hidden", marginBottom:"1.25rem" }}>
            <div style={{ height:"100%", width:`${checkInPct}%`, background:"linear-gradient(90deg,#2b3ff2,#6366f1)", borderRadius:"99px", transition:"width 0.6s ease" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div style={{ background:"#f9fafb", borderRadius:"12px", padding:"1rem" }}>
              <div style={{ fontSize:"1.6rem", fontWeight:800, color:"#111" }}>{checkedIn}</div>
              <div style={{ fontSize:"0.8rem", color:"#6b7280", marginTop:"0.2rem" }}>Checked In</div>
            </div>
            <div style={{ background:"#f9fafb", borderRadius:"12px", padding:"1rem" }}>
              <div style={{ fontSize:"1.6rem", fontWeight:800, color:"#111" }}>{totalRegs - checkedIn}</div>
              <div style={{ fontSize:"0.8rem", color:"#6b7280", marginTop:"0.2rem" }}>Not Yet</div>
            </div>
          </div>
          <Link href="/admin/checkin" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", marginTop:"1.25rem", padding:"0.8rem", background:"#111", color:"white", borderRadius:"10px", textDecoration:"none", fontWeight:600, fontSize:"0.9rem" }}>
            <DoorOpen size={16} /> Open Check-in
          </Link>
        </div>
      </div>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
  totalRegs: number;
  checkedIn: number;
  totalBranches: number;
  externalChurches: number;
  checkInPct: number;
  events?: { id: string; name: string }[];
  selectedEventId?: string;
}

export default function DashboardStats({ totalRegs, checkedIn, totalBranches, externalChurches, checkInPct, events = [], selectedEventId = "" }: Props) {
  const router = useRouter();
  
  const [showToast, setShowToast] = useState<string | null>(null);
  const prevRegs = useRef(totalRegs);

  useEffect(() => {
    const milestones = [50, 100, 200, 500, 1000, 2000, 5000];
    const prev = prevRegs.current;
    
    for (const milestone of milestones) {
      if (prev < milestone && totalRegs >= milestone) {
        setShowToast(`🎉 Milestone Reached: ${milestone} Registrations!`);
        setTimeout(() => setShowToast(null), 8000);
        break;
      }
    }
    prevRegs.current = totalRegs;
  }, [totalRegs]);

  const stats = [
    { label: "Total Registrations", value: totalRegs },
    { label: "Checked In", value: checkedIn },
    { label: "Church Branches", value: totalBranches },
    { label: "External Churches", value: externalChurches },
  ];

  return (
    <div>
      {events.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <select 
            value={selectedEventId}
            onChange={(e) => {
              const val = e.target.value;
              router.push(val ? `/admin?eventId=${val}` : `/admin`);
            }}
            style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.9rem", minWidth: "200px" }}
          >
            <option value="">All Events (Global)</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      )}
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
      {stats.map(({ label, value }) => (
        <div key={label} style={{
          background: "#fff",
          border: "1px solid #eaeaea",
          borderRadius: "8px",
          padding: "1.5rem",
        }}>
          <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>{label}</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "#111", lineHeight: 1 }}>{value}</div>
        </div>
      ))}

      {/* Check-in Progress */}
      <div style={{
        background: "#fff",
        border: "1px solid #eaeaea",
        borderRadius: "8px",
        padding: "1.5rem",
        gridColumn: "1 / -1",
        display: "flex",
        alignItems: "center",
        gap: "2rem"
      }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>Check-in Rate</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "#111", lineHeight: 1 }}>{checkInPct}%</div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${checkInPct}%`, background: "#111", borderRadius: "99px" }} />
          </div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.75rem" }}>
            {checkedIn} out of {totalRegs} attendees have checked in.
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: "fixed",
          top: "2rem",
          right: "2rem",
          background: "#111",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          fontWeight: 600,
          zIndex: 9999,
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          {showToast}
          <button onClick={() => setShowToast(null)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", marginLeft: "1rem" }}>✕</button>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

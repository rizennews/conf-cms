"use client";

interface Props {
  totalRegs: number;
  checkedIn: number;
  activeEvents: number;
  totalBranches: number;
  checkInPct: number;
}

export default function DashboardStats({ totalRegs, checkedIn, activeEvents, totalBranches, checkInPct }: Props) {
  const stats = [
    { label: "Total Registrations", value: totalRegs },
    { label: "Checked In", value: checkedIn },
    { label: "Active Events", value: activeEvents },
    { label: "Branches", value: totalBranches },
  ];

  return (
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
  );
}

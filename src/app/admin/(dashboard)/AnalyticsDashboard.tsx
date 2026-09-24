"use client";

import { useState } from "react";

export default function AnalyticsDashboard({ registrations, events, branches }: { registrations: any[], events: any[], branches: any[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "");

  const eventRegs = registrations.filter(r => r.eventId === selectedEventId);
  const checkedInCount = eventRegs.filter(r => r.status === "checked-in").length;
  const registeredCount = eventRegs.length;

  // Breakdown by branch
  const branchCounts: Record<string, { total: number, checkedIn: number }> = {};
  eventRegs.forEach(r => {
    const bId = r.branchId || "Unknown";
    if (!branchCounts[bId]) branchCounts[bId] = { total: 0, checkedIn: 0 };
    branchCounts[bId].total++;
    if (r.status === "checked-in") branchCounts[bId].checkedIn++;
  });

  // Breakdown by gender (assumes customData JSON has 'Gender' key)
  let maleCount = 0;
  let femaleCount = 0;
  
  // Breakdown by age
  const ageCounts: Record<string, number> = {};

  eventRegs.forEach(r => {
    if (r.customData) {
      try {
        const data = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
        
        // Gender
        const gender = data['Gender'];
        if (gender === 'Male') maleCount++;
        else if (gender === 'Female') femaleCount++;

        // Age Range
        const age = data['Age Range'];
        if (age) {
          ageCounts[age] = (ageCounts[age] || 0) + 1;
        }
      } catch (e) {}
    }
  });

  if (events.length === 0) return null;

  return (
    <div style={{ marginTop: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", margin: 0 }}>Advanced Analytics</h2>
        <select 
          value={selectedEventId} 
          onChange={e => setSelectedEventId(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", fontSize: "0.9rem" }}
        >
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ background: "white", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>Gender Breakdown</h3>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#111" }}>{maleCount}</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Male</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#111" }}>{femaleCount}</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Female</div>
            </div>
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>Age Demographics</h3>
          {Object.keys(ageCounts).length === 0 ? (
            <div style={{ color: "#a1a1aa", fontSize: "0.85rem", textAlign: "center" }}>No age data available</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Object.entries(ageCounts).sort((a,b) => b[1] - a[1]).map(([age, count]) => (
                <div key={age} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.25rem" }}>
                  <span style={{ color: "#374151" }}>{age}</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>Attendance by Branch</h3>
        {Object.keys(branchCounts).length === 0 ? (
          <div style={{ color: "#a1a1aa", fontSize: "0.85rem", textAlign: "center" }}>No branch data available</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eaeaea", textAlign: "left", color: "#6b7280", fontSize: "0.85rem" }}>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 500 }}>Branch Name</th>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 500, textAlign: "right" }}>Registered</th>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 500, textAlign: "right" }}>Checked In</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(branchCounts).sort((a,b) => b[1].total - a[1].total).map(([branchId, stats]) => {
                const bName = branches.find(b => b.id === branchId)?.name || branchId;
                return (
                  <tr key={branchId} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "0.75rem 0", color: "#111", fontSize: "0.9rem" }}>{bName}</td>
                    <td style={{ padding: "0.75rem 0", textAlign: "right", color: "#6b7280", fontSize: "0.9rem" }}>{stats.total}</td>
                    <td style={{ padding: "0.75rem 0", textAlign: "right", fontWeight: 600, color: "#16a34a", fontSize: "0.9rem" }}>{stats.checkedIn}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

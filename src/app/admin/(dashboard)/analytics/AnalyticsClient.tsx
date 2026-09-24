"use client";

import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#111111', '#6b7280', '#2b3ff2', '#16a34a', '#eab308'];

export default function AnalyticsClient({ registrations, events, branches }: { registrations: any[], events: any[], branches: any[] }) {
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

  const branchData = Object.entries(branchCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([branchId, stats]) => ({
      name: branches.find(b => b.id === branchId)?.name || branchId,
      Registered: stats.total,
      CheckedIn: stats.checkedIn
    }));

  // Breakdown by gender
  let maleCount = 0;
  let femaleCount = 0;
  
  // Breakdown by age
  const ageCounts: Record<string, number> = {};

  eventRegs.forEach(r => {
    // Check standard ageRange column first
    if (r.ageRange) {
      ageCounts[r.ageRange] = (ageCounts[r.ageRange] || 0) + 1;
    }

    if (r.customData) {
      try {
        const data = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
        
        // Gender (Custom Data)
        const gender = data['Gender'] || data['gender'];
        if (gender === 'Male') maleCount++;
        else if (gender === 'Female') femaleCount++;

        // Age Range fallback to custom data if standard column is missing
        if (!r.ageRange) {
          const customAge = data['Age Range'] || data['ageRange'] || data['Age'] || data['age'];
          if (customAge) {
            ageCounts[customAge] = (ageCounts[customAge] || 0) + 1;
          }
        }
      } catch (e) {}
    }
  });

  const genderData = [
    { name: 'Male', value: maleCount },
    { name: 'Female', value: femaleCount }
  ].filter(d => d.value > 0);

  const ageData = Object.entries(ageCounts)
    .map(([age, count]) => ({ age, count }))
    .sort((a, b) => b.count - a.count);

  if (events.length === 0) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280", background: "white", borderRadius: "8px", border: "1px solid #eaeaea" }}>
      No events available for analytics.
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", margin: 0 }}>Select Event</h2>
        <select 
          value={selectedEventId} 
          onChange={e => setSelectedEventId(e.target.value)}
          style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", fontSize: "0.95rem", minWidth: "250px" }}
        >
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        
        {/* Gender Breakdown (Pie Chart) */}
        <div style={{ background: "white", border: "1px solid #eaeaea", borderRadius: "12px", padding: "1.5rem", height: "350px" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Gender Breakdown</h3>
          {genderData.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%", color: "#a1a1aa" }}>No gender data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Age Demographics (Bar Chart) */}
        <div style={{ background: "white", border: "1px solid #eaeaea", borderRadius: "12px", padding: "1.5rem", height: "350px" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Age Demographics</h3>
          {ageData.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%", color: "#a1a1aa" }}>No age data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={ageData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eaeaea" />
                <XAxis type="number" />
                <YAxis dataKey="age" type="category" width={80} tick={{ fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea' }} />
                <Bar dataKey="count" fill="#111111" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Attendance by Branch (Bar Chart) */}
      <div style={{ background: "white", border: "1px solid #eaeaea", borderRadius: "12px", padding: "1.5rem", height: "450px" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Attendance by Branch</h3>
        {branchData.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%", color: "#a1a1aa" }}>No branch data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={branchData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
              <YAxis />
              <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Registered" fill="#6b7280" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CheckedIn" name="Checked In" fill="#2b3ff2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

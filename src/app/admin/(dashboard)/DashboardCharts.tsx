"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface Props {
  registrationsByDate: { date: string; count: number }[];
  ageDemographics: { name: string; value: number }[];
  registrantStatuses: { name: string; value: number }[];
}

const COLORS = ['#111111', '#2b3ff2', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];

export default function DashboardCharts({ registrationsByDate, ageDemographics, registrantStatuses }: Props) {
  return (
    <div style={{ marginTop: "3rem" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", margin: "0 0 1rem 0" }}>Analytics</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Sign-ups Over Time */}
        <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem", gridColumn: "1 / -1" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "0.95rem", color: "#666" }}>Registrations Over Time</h3>
          <div style={{ width: "100%", height: 300 }}>
            {registrationsByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationsByDate} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    cursor={{ stroke: '#eaeaea', strokeWidth: 2 }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#111" strokeWidth={3} dot={{ r: 4, fill: "#111", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>Not enough data</div>
            )}
          </div>
        </div>

        {/* Age Demographics */}
        <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "0.95rem", color: "#666" }}>Age Demographics</h3>
          <div style={{ width: "100%", height: 250 }}>
            {ageDemographics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageDemographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ageDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.85rem" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
            )}
          </div>
        </div>

        {/* Registrant Status */}
        <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "0.95rem", color: "#666" }}>Attendee Types</h3>
          <div style={{ width: "100%", height: 250 }}>
            {registrantStatuses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={registrantStatuses}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {registrantStatuses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.85rem" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

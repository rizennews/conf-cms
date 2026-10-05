import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";

interface Props {
  registrationsByDate: { date: string; count: number }[];
  ageDemographics: { name: string; value: number }[];
  registrantStatuses: { name: string; value: number }[];
  topInviters: { name: string; value: number }[];
  referralSources: { name: string; value: number }[];
  topBranches: { name: string; value: number }[];
  topExternalBranches?: { name: string; value: number }[];
  attendanceData: { name: string; value: number }[];
  dynamicCharts?: { title: string; data: { name: string; value: number }[] }[];
  firstTimerData?: { name: string; value: number }[];
  checkinsOverTime?: { time: string; count: number }[];
}

const COLORS = ['#111111', '#2b3ff2', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];

export default function DashboardCharts({ registrationsByDate, ageDemographics, registrantStatuses, topInviters, referralSources, topBranches, topExternalBranches = [], attendanceData, dynamicCharts = [], firstTimerData = [], checkinsOverTime = [] }: Props) {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Demographics", "Acquisition", "Branches"];
  if (dynamicCharts && dynamicCharts.length > 0) {
    tabs.push("Custom Data");
  }

  return (
    <div style={{ marginTop: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111", margin: 0 }}>Analytics</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e5e7eb", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.2rem" }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1.5rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #2b3ff2" : "2px solid transparent",
              color: activeTab === tab ? "#2b3ff2" : "#6b7280",
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: "0.95rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        
        {activeTab === "Overview" && (
          <>
            {/* Sign-ups Over Time */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem", gridColumn: "1 / -1" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>Registrations Over Time</h3>
              <div style={{ width: "100%", height: 350 }}>
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
                      <Line type="monotone" name="Registrations" dataKey="count" stroke="#111" strokeWidth={3} dot={{ r: 4, fill: "#111", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>Not enough data</div>
                )}
              </div>
            </div>

            {/* Check-ins Over Time */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem", gridColumn: "1 / -1" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>Check-in Velocity (Day-Of)</h3>
              <div style={{ width: "100%", height: 350 }}>
                {checkinsOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={checkinsOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} allowDecimals={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        cursor={{ stroke: '#eaeaea', strokeWidth: 2 }}
                      />
                      <Line type="monotone" name="Check-ins" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No check-ins yet</div>
                )}
              </div>
            </div>

            {/* Attendance Rate */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>Check-in vs Not Arrived</h3>
              <div style={{ width: "100%", height: 350 }}>
                {attendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        dataKey="value"
                        nameKey="name"
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === "Checked In" ? "#10b981" : "#ef4444"} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.95rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "Demographics" && (
          <>
            {/* Age Demographics */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>Age Demographics</h3>
              <div style={{ width: "100%", height: 350 }}>
                {ageDemographics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ageDemographics}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {ageDemographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.95rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
                )}
              </div>
            </div>

            {/* First-Timers */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>First-Timers vs Returning</h3>
              <div style={{ width: "100%", height: 350 }}>
                {firstTimerData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={firstTimerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {firstTimerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === "First Timer" ? "#8b5cf6" : "#2b3ff2"} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.95rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
                )}
              </div>
            </div>

            {/* Registrant Status */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>Attendee Types</h3>
              <div style={{ width: "100%", height: 350 }}>
                {registrantStatuses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={registrantStatuses}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={110}
                        dataKey="value"
                      >
                        {registrantStatuses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.95rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "Acquisition" && (
          <>
            {/* Top Inviters */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>Top Evangelists (Who Invited)</h3>
              <div style={{ width: "100%", height: 350 }}>
                {topInviters.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topInviters} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eaeaea" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#111", fontWeight: 500 }} />
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} cursor={{ fill: '#f9fafb' }} />
                      <Bar name="Registrations" dataKey="value" fill="#2b3ff2" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
                )}
              </div>
            </div>

            {/* How They Heard */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>How They Heard About Us</h3>
              <div style={{ width: "100%", height: 350 }}>
                {referralSources.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={referralSources} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#111", fontWeight: 500 }} dy={10} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} cursor={{ fill: '#f9fafb' }} />
                      <Bar name="Registrations" dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "Branches" && (
          <>
            {/* Top Branches */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem", gridColumn: "1 / -1" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>Top Branches</h3>
              <div style={{ width: "100%", height: 400 }}>
                {topBranches.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topBranches} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#111", fontWeight: 500 }} dy={10} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} cursor={{ fill: '#f9fafb' }} />
                      <Bar name="Registrations" dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
                )}
              </div>
            </div>

            {/* Top External Branches */}
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem", gridColumn: "1 / -1" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>Top External Branches</h3>
              <div style={{ width: "100%", height: 400 }}>
                {topExternalBranches.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topExternalBranches} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#111", fontWeight: 500 }} dy={10} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} cursor={{ fill: '#f9fafb' }} />
                      <Bar name="Registrations" dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.9rem" }}>No data</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "Custom Data" && (
          <>
            {/* Dynamic Custom Fields */}
            {dynamicCharts.map((chart, i) => (
              <div key={`dynamic-${i}`} style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#4b5563" }}>{chart.title}</h3>
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chart.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        dataKey="value"
                      >
                        {chart.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.95rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}

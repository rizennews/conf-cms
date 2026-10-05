"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardCharts from "../DashboardCharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import pptxgen from "pptxgenjs";

export default function AnalyticsClient({ registrations, events, branches }: { registrations: Record<string, unknown>[], events: Record<string, unknown>[], branches: Record<string, unknown>[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>((events[0]?.id as string) || "");
  const router = useRouter();

  // Poll for real-time data updates every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [router]);

  if (events.length === 0) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280", background: "white", borderRadius: "8px", border: "1px solid #eaeaea" }}>
      No events available for analytics.
    </div>
  );

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];
  const filteredRegs = registrations.filter(r => r.eventId === selectedEventId);

  // Compute stats for DashboardCharts
  const totalRegs = filteredRegs.length;
  const checkedIn = filteredRegs.filter(r => r.status === "checked-in").length;
  const attendanceData = [
    { name: "Checked In", value: checkedIn },
    { name: "Not Arrived", value: totalRegs - checkedIn }
  ].filter(d => d.value > 0);

  // Status map (Member, Guest, Worker)
  const statusMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    let stat = (r.type as string) || "Guest";
    // Check custom fields just in case "Type" or "Status" exists
    if (r.customData) {
      try {
        const custom = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
        if (custom['Type'] || custom['type']) stat = custom['Type'] || custom['type'];
        if (custom['Are you a']) stat = String(custom['Are you a']);
      } catch { /* ignore */ }
    }
    statusMap[stat] = (statusMap[stat] || 0) + 1;
  });
  const registrantStatuses = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Referrals
  const referralMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    const src = (r.heardFrom as string) || "Other";
    referralMap[src] = (referralMap[src] || 0) + 1;
  });
  const referralSources = Object.entries(referralMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Inviters
  const inviterMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    const inv = r.invitees as string | undefined;
    if (inv && inv.trim().length > 0) {
      const trimmedInv = inv.trim();
      inviterMap[trimmedInv] = (inviterMap[trimmedInv] || 0) + 1;
    }
  });
  const topInviters = Object.entries(inviterMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // External Branches
  const branchMap = Object.fromEntries(branches.map(b => [b.id as string, b.name as string]));
  const branchCountMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    if (r.branchId !== "other") {
      const bName = branchMap[r.branchId as string] || "Unknown";
      branchCountMap[bName] = (branchCountMap[bName] || 0) + 1;
    }
  });
  const topBranches = Object.entries(branchCountMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Dates
  const dateMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    if (!r.createdAt) return;
    const date = new Date(r.createdAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateMap[date] = (dateMap[date] || 0) + 1;
  });
  const registrationsByDate = Object.entries(dateMap).map(([date, count]) => ({ date, count })).slice(-14);

  // Age
  const ageMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    let age = (r.ageRange as string) || "Unknown";
    if (r.customData) {
      try {
        const custom = typeof r.customData === 'string' ? JSON.parse(r.customData) : r.customData;
        if (custom['Age Range'] || custom['ageRange'] || custom['Age']) {
          age = String(custom['Age Range'] || custom['ageRange'] || custom['Age']);
        }
      } catch { /* ignore */ }
    }
    ageMap[age] = (ageMap[age] || 0) + 1;
  });
  const ageDemographics = Object.entries(ageMap).map(([name, value]) => ({ name, value }));

  // First Timer Breakdown
  let firstTimerCount = 0;
  let returningCount = 0;
  filteredRegs.forEach(r => {
    if (r.isFirstTime === true || String(r.isFirstTime) === 'true') firstTimerCount++;
    else if (r.isFirstTime === false || String(r.isFirstTime) === 'false') returningCount++;
  });
  const firstTimerData = [
    { name: "First Timer", value: firstTimerCount },
    { name: "Returning", value: returningCount }
  ].filter(d => d.value > 0);

  // Check-ins over time
  const checkinHourMap: Record<string, number> = {};
  filteredRegs.forEach(r => {
    if (r.status === "checked-in" && r.checkedInAt) {
      const d = new Date(r.checkedInAt as string);
      const hourStr = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      checkinHourMap[hourStr] = (checkinHourMap[hourStr] || 0) + 1;
    }
  });
  // Sort by time roughly
  const checkinsOverTime = Object.entries(checkinHourMap)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => {
      const isPm1 = a.time.includes('PM');
      const isPm2 = b.time.includes('PM');
      if (isPm1 && !isPm2) return 1;
      if (!isPm1 && isPm2) return -1;
      return a.time.localeCompare(b.time); // naive sort
    });

  // Dynamic Custom Charts
  let eventCustomFields: Record<string, unknown>[] = [];
  if (selectedEvent.customFields) {
    try { eventCustomFields = JSON.parse(selectedEvent.customFields as string); } catch { /* ignore */ }
  }
  
  const dynamicCharts: { title: string; data: { name: string; value: number }[] }[] = [];
  eventCustomFields.forEach(field => {
    if (field.type === "select" || field.type === "radio") {
      const fieldCounts: Record<string, number> = {};
      filteredRegs.forEach(r => {
        if (r.customData) {
          try {
            const cData = typeof r.customData === "string" ? JSON.parse(r.customData) : r.customData;
            const answer = cData[field.label as string] as string;
            if (answer) {
              fieldCounts[answer] = (fieldCounts[answer] || 0) + 1;
            }
          } catch { /* ignore */ }
        }
      });
      const data = Object.entries(fieldCounts).map(([name, value]) => ({ name, value }));
      if (data.length > 0) {
        dynamicCharts.push({ title: field.label as string, data });
      }
    }
  });

  const handleExportPdf = async () => {
    const input = document.getElementById("analytics-dashboard");
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${selectedEvent.name}-analytics.pdf`);
  };

  const handleExportPptx = async () => {
    const input = document.getElementById("analytics-dashboard");
    if (!input) return;
    
    // Capture the entire dashboard as an image
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pptx = new pptxgen();
    const slide = pptx.addSlide();
    
    // Add image to slide, scaled to fit
    slide.addImage({
      data: imgData,
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      sizing: { type: "contain", w: "100%", h: "100%" }
    });

    pptx.writeFile({ fileName: `${selectedEvent.name}-analytics.pptx` });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", margin: 0 }}>Select Event</h2>
          <select 
            value={selectedEventId} 
            onChange={e => setSelectedEventId(e.target.value)}
            style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", fontSize: "0.95rem", minWidth: "250px" }}
          >
            {events.map(e => <option key={e.id as string} value={e.id as string}>{e.name as string}</option>)}
          </select>
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            onClick={handleExportPdf}
            style={{ padding: "0.6rem 1rem", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export PDF
          </button>
          <button 
            onClick={handleExportPptx}
            style={{ padding: "0.6rem 1rem", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            Export PPTX
          </button>
        </div>
      </div>

      <div id="analytics-dashboard">
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #eaeaea", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#666", textTransform: "uppercase", fontWeight: 600 }}>Total Registrations</p>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#111" }}>{totalRegs}</p>
          </div>
          <div style={{ width: "1px", height: "40px", background: "#eaeaea" }}></div>
          <div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#666", textTransform: "uppercase", fontWeight: 600 }}>Checked In</p>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#10b981" }}>{checkedIn}</p>
          </div>
        </div>
      </div>

      <DashboardCharts 
        registrationsByDate={registrationsByDate}
        ageDemographics={ageDemographics}
        registrantStatuses={registrantStatuses}
        topInviters={topInviters}
        referralSources={referralSources}
        topBranches={topBranches}
        attendanceData={attendanceData}
        dynamicCharts={dynamicCharts}
        firstTimerData={firstTimerData}
        checkinsOverTime={checkinsOverTime}
      />
      </div>
    </div>
  );
}

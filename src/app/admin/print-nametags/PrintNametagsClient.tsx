"use client";

import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function PrintNametagsClient({ registrations, event }: { registrations: any[], event: any }) {
  useEffect(() => {
    // Automatically trigger print dialog when component mounts
    setTimeout(() => {
      window.print();
    }, 1000);
  }, []);

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <style>{`
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
        }
        .nametag-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* 2x4 on A4 roughly fits */
          gap: 0.5in;
          padding: 0.5in;
        }
        .nametag {
          width: 3.5in;
          height: 2.25in;
          border: 1px dashed #ccc;
          padding: 0.25in;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          page-break-inside: avoid;
        }
      `}</style>
      
      <div className="no-print" style={{ padding: "1rem", background: "#111", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Print Nametags - {event?.name}</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#a1a1aa" }}>{registrations.length} registrations found.</p>
        </div>
        <button onClick={() => window.print()} style={{ background: "white", color: "black", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
          Print Now
        </button>
      </div>

      <div className="nametag-grid">
        {registrations.map(r => (
          <div key={r.id} className="nametag">
            <div style={{ flex: 1, paddingRight: "1rem" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#111", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.fullName || "Guest"}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem" }}>
                {r.branchId || "VIP"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginTop: "auto" }}>
                {event?.name}
              </div>
            </div>
            <div style={{ width: "100px", height: "100px" }}>
              <QRCodeSVG value={r.id} size={100} level="H" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { clearImpersonation } from "./branches/actions";
import { useRouter } from "next/navigation";

export default function ImpersonationBanner({ branchId }: { branchId: string }) {
  const router = useRouter();
  return (
    <div style={{
      background: "#fffbeb",
      borderBottom: "1px solid #fde68a",
      padding: "0.75rem 1.5rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "#92400e",
      fontSize: "0.9rem",
      fontWeight: 500
    }}>
      <div>
        ⚠️ You are currently impersonating the branch: <strong>{branchId}</strong>. You are only seeing data for this branch.
      </div>
      <button 
        onClick={async () => {
          await clearImpersonation();
          router.push("/admin/branches");
        }}
        style={{
          background: "#f59e0b",
          border: "none",
          color: "white",
          padding: "0.3rem 0.8rem",
          borderRadius: "4px",
          fontSize: "0.8rem",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        Clear Impersonation
      </button>
    </div>
  );
}

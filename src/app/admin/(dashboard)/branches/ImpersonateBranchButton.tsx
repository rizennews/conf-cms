"use client";

import { useState } from "react";
import { impersonateBranch } from "./actions";
import { useRouter } from "next/navigation";

export default function ImpersonateBranchButton({ id, isCurrent }: { id: string, isCurrent?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImpersonate = async () => {
    setLoading(true);
    await impersonateBranch(id);
    router.push("/admin");
  };

  return (
    <button 
      onClick={handleImpersonate} 
      disabled={loading || isCurrent}
      style={{ 
        background: isCurrent ? "#f3f4f6" : "#eff6ff", 
        border: "none", 
        color: isCurrent ? "#9ca3af" : "#2b3ff2", 
        padding: "0.4rem 0.8rem", 
        borderRadius: "6px", 
        fontSize: "0.8rem", 
        fontWeight: 600,
        cursor: (loading || isCurrent) ? "not-allowed" : "pointer"
      }}
    >
      {loading ? "..." : isCurrent ? "Viewing" : "View Dashboard"}
    </button>
  );
}

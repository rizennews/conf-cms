"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlankEvent } from "./actions";

export default function CreateEventButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    const newEventId = await createBlankEvent();
    router.push(`/admin/events/${newEventId}`);
  };

  return (
    <button 
      onClick={handleCreate}
      disabled={loading}
      style={{ 
        background: "#2b3ff2", color: "white", border: "none", 
        padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 600, 
        cursor: "pointer", boxShadow: "0 2px 4px rgba(43, 63, 242, 0.2)"
      }}>
      {loading ? "Creating..." : "+ Create Event"}
    </button>
  );
}

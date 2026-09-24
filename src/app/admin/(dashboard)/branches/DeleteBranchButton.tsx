"use client";

import { useState } from "react";
import { deleteBranch } from "./actions";
import { Trash2 } from "lucide-react";

export default function DeleteBranchButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBranch(id);
    setIsDeleting(false);
    
    if (result.error) {
      alert(result.error);
    }
    setShowConfirm(false);
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        style={{
          padding: "0.4rem",
          background: "transparent",
          color: "#ef4444",
          border: "1px solid #fecaca",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isDeleting ? 0.5 : 1
        }}
        title="Delete Branch"
      >
        <Trash2 size={16} />
      </button>

      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", maxWidth: "400px", width: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#111", fontWeight: 600 }}>Delete Branch?</h3>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "2rem" }}>
              Are you sure you want to delete this branch? This action cannot be undone. You will not be able to delete it if attendees are still registered under this branch.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                style={{ padding: "0.6rem 1.25rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer", fontWeight: 500, color: "#374151" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ padding: "0.6rem 1.25rem", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500, opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? "Deleting..." : "Delete Branch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

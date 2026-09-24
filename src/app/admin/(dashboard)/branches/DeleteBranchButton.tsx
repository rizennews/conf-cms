"use client";

import { useState } from "react";
import { deleteBranch } from "./actions";
import { Trash2 } from "lucide-react";

export default function DeleteBranchButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this branch?");
    if (!confirm) return;
    
    setIsDeleting(true);
    const result = await deleteBranch(id);
    setIsDeleting(false);
    
    if (result.error) {
      alert(result.error);
    }
  };

  return (
    <button 
      onClick={handleDelete}
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
  );
}

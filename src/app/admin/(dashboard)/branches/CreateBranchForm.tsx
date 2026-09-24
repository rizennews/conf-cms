"use client";

import { useState } from "react";
import { createBranch } from "./actions";

export default function CreateBranchForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await createBranch(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
    }
    
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{ 
          background: "#2b3ff2", 
          color: "white", 
          border: "none", 
          padding: "0.75rem 1.5rem", 
          borderRadius: "8px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(43, 63, 242, 0.2)"
        }}
      >
        + Add Branch
      </button>

      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(17, 17, 17, 0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 50
        }}>
          <div style={{
            background: "#ffffff",
            padding: "2rem",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.2rem", color: "#111111" }}>Create New Branch</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#374151" }}>Branch Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="e.g. Multiply Sunday - North"
                  style={{
                    width: "100%", padding: "0.75rem", borderRadius: "8px",
                    border: "1px solid #d1d5db", fontSize: "1rem"
                  }}
                />
              </div>

              {error && <p style={{ color: "#ef4444", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#6b7280", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    background: "#2b3ff2", color: "white", border: "none", 
                    padding: "0.6rem 1.2rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer"
                  }}
                >
                  {loading ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

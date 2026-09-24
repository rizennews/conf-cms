import { db } from "../../../../db";
import { branches } from "../../../../db/schema";
import CreateBranchForm from "./CreateBranchForm";

export default async function BranchesPage() {
  const allBranches = await db.select().from(branches);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Branches</h1>
          <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>Manage church branches for multi-tenancy and data separation.</p>
        </div>
        <CreateBranchForm />
      </div>

      <div style={{ borderTop: "1px solid #eaeaea", paddingTop: "2rem" }}>
        {allBranches.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#666", fontSize: "0.95rem" }}>
            No branches yet. Add your first church branch to start managing local data.
          </div>
        ) : (
          <div style={{ border: "1px solid #eaeaea", borderRadius: "8px", background: "#fff", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eaeaea", background: "#fafafa" }}>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 500, color: "#111", fontSize: "0.85rem" }}>Name</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 500, color: "#111", fontSize: "0.85rem" }}>ID / Slug</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 500, color: "#111", fontSize: "0.85rem" }}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {allBranches.map((branch, i) => (
                  <tr key={branch.id} style={{ borderTop: i > 0 ? "1px solid #eaeaea" : "none" }}>
                    <td style={{ padding: "1rem 1.5rem", color: "#111", fontSize: "0.9rem" }}>{branch.name}</td>
                    <td style={{ padding: "1rem 1.5rem", color: "#666", fontSize: "0.9rem", fontFamily: "monospace" }}>{branch.id}</td>
                    <td style={{ padding: "1rem 1.5rem", color: "#666", fontSize: "0.9rem" }}>{new Date(branch.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

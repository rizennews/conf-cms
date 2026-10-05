import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../db";
import { activityLogs, user } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function LogsPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) redirect("/admin/login");

  const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const role = currentUser[0]?.role || "branch_head";

  if (role !== "super_admin") {
    redirect("/admin");
  }

  const logs = await db.select({
    id: activityLogs.id,
    userId: activityLogs.userId,
    userName: user.name,
    userEmail: user.email,
    action: activityLogs.action,
    details: activityLogs.details,
    createdAt: activityLogs.createdAt,
  })
  .from(activityLogs)
  .leftJoin(user, eq(activityLogs.userId, user.id))
  .orderBy(desc(activityLogs.createdAt))
  .limit(100); // Last 100 logs

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Activity Logs</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>Audit trail of actions taken by administrators.</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", overflow: "hidden" }}>
        {logs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#666", fontSize: "0.95rem" }}>
            No activity logs recorded yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #eaeaea", textAlign: "left" }}>
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "#374151", fontSize: "0.75rem", textTransform: "uppercase" }}>Time</th>
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "#374151", fontSize: "0.75rem", textTransform: "uppercase" }}>User</th>
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "#374151", fontSize: "0.75rem", textTransform: "uppercase" }}>Action</th>
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "#374151", fontSize: "0.75rem", textTransform: "uppercase" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #eaeaea" }}>
                  <td style={{ padding: "1rem 1.25rem", color: "#666", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ fontWeight: 500, color: "#111", fontSize: "0.9rem" }}>{log.userName || "Unknown"}</div>
                    <div style={{ color: "#666", fontSize: "0.8rem" }}>{log.userEmail}</div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ display: "inline-block", background: "#f3f4f6", color: "#374151", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#666", fontSize: "0.85rem", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../db";
import { activityLogs, user } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";import LogsTable from "./LogsTable";

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
  .limit(500); // Increased limit

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.03em" }}>Activity Logs</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>Advanced audit trail of system actions.</p>
      </div>

      <LogsTable initialLogs={logs.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString()
      }))} />
    </div>
  );
}

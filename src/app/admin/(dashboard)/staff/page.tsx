import { db } from "../../../../db";
import { user, branches } from "../../../../db/schema";
import StaffTable from "./StaffTable";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export default async function StaffPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  const currentUser = await db.select().from(user).where(eq(user.id, session?.user.id as string)).limit(1);
  if (currentUser.length === 0 || currentUser[0].role !== "super_admin") {
      redirect("/admin");
  }

  const allUsers = await db.select().from(user).orderBy(user.name);
  const allBranches = await db.select().from(branches).orderBy(branches.name);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Staff & Users</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>Manage system access, roles, and branch assignments.</p>
      </div>

      <div style={{ borderTop: "1px solid #eaeaea", paddingTop: "2rem" }}>
        <StaffTable users={allUsers} branches={allBranches} />
      </div>
    </div>
  );
}

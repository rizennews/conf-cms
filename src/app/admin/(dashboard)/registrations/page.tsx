import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../db";
import { registrations, user, events, branches } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import RegistrationsTable from "./RegistrationsTable";

export default async function RegistrationsPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  let role = "branch_head";
  let branchId = null;
  const currentUser = await db.select().from(user).where(eq(user.id, session?.user.id as string)).limit(1);
  if (currentUser.length > 0) {
    role = currentUser[0].role;
    branchId = currentUser[0].branchId;
  }

  let allRegs: any[] = [];
  if (role === "super_admin" || role === "admin" || role === "data_team") {
    allRegs = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  } else {
    if (branchId) {
      allRegs = await db.select().from(registrations).where(eq(registrations.branchId, branchId)).orderBy(desc(registrations.createdAt));
    } else {
      allRegs = [];
    }
  }

  const allEvents = await db.select().from(events);
  const allBranches = await db.select().from(branches);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Registrations</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>View, search, export, and bulk import all event sign-ups.</p>
      </div>

      <div style={{ borderTop: "1px solid #eaeaea", paddingTop: "2rem" }}>
        <RegistrationsTable 
          data={allRegs} 
          events={allEvents} 
          branches={allBranches}
          canBulkUpload={role === "super_admin" || role === "admin"} 
        />
      </div>
    </div>
  );
}


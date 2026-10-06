import { auth } from "../../../../lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../../../../db";
import { registrations, events, branches, user } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return null;

  const allEvents = await db.select().from(events);
  let allRegistrations = await db.select().from(registrations);
  const allBranchesData = await db.select().from(branches);

  const currentUser = await db.select().from(user).where(eq(user.id, session?.user.id as string)).limit(1);
  const userRole = currentUser[0]?.role || "branch_head";
  const userBranchId = currentUser[0]?.branchId;

  const cookieStore = await cookies();
  const impersonatedBranch = cookieStore.get("impersonatedBranch")?.value;
  const effectiveBranchId = (userRole === "super_admin" || userRole === "admin") && impersonatedBranch ? impersonatedBranch : (userRole === "branch_head" ? userBranchId : null);

  if (userRole === "data_team") {
    redirect("/admin");
  }

  if (effectiveBranchId) {
    allRegistrations = allRegistrations.filter(r => r.branchId === effectiveBranchId);
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
          {effectiveBranchId ? "Branch Analytics" : "Global Analytics"}
        </h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>
          {effectiveBranchId 
            ? "Visualize sign-ups, demographics, and check-in rates specific to your branch."
            : "Visualize global event sign-ups, demographics, and branch check-in rates."}
        </p>
      </div>
      
      <AnalyticsClient 
        registrations={allRegistrations} 
        events={allEvents} 
        branches={allBranchesData} 
        effectiveBranchId={effectiveBranchId}
      />
    </div>
  );
}

import { auth } from "../../../lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../../../db";
import { user } from "../../../db/schema";
import { eq, gte, and, sql } from "drizzle-orm";
import Sidebar from "./Sidebar";
import ImpersonationBanner from "./ImpersonationBanner";
import { registrations } from "../../../db/schema";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) redirect("/admin/login");

  // Fetch actual user role
  let role = "branch_head";
  const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  
  if (currentUser.length > 0) {
    role = currentUser[0].role;
    
    // Bootstrap: first user ever gets super_admin automatically
    if (role !== "super_admin") {
      const allUsers = await db.select().from(user).limit(2);
      if (allUsers.length === 1) {
        await db.update(user).set({ role: "super_admin" }).where(eq(user.id, session.user.id));
        role = "super_admin";
      }
    }
  }

  // Get today's registrations count for the badge
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get impersonation
  const cookieStore = await cookies();
  const impersonatedBranch = cookieStore.get("impersonatedBranch")?.value;
  const effectiveBranchId = (role === "super_admin" || role === "admin") && impersonatedBranch ? impersonatedBranch : (role === "branch_head" ? currentUser[0]?.branchId : null);

  let newRegistrations = 0;
  try {
    let query = db.select({ count: sql<number>`count(*)` }).from(registrations).where(gte(registrations.createdAt, today));
    if (effectiveBranchId) {
      query = db.select({ count: sql<number>`count(*)` }).from(registrations).where(and(gte(registrations.createdAt, today), eq(registrations.branchId, effectiveBranchId)));
    }
    const [{ count }] = await query;
    newRegistrations = Number(count);
  } catch (e) {
    console.error("Failed to fetch today's registrations:", e);
  }

  return (
    <div className="layout-root">
      <style>{`
        .layout-root { display: flex; min-height: 100vh; background: #f4f5f7; }
        @media (max-width: 768px) {
          .layout-root { flex-direction: column; }
        }
      `}</style>
      <Sidebar role={role} userName={session.user.name} newRegistrations={newRegistrations} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {(role === "super_admin" || role === "admin") && impersonatedBranch && (
          <ImpersonationBanner branchId={impersonatedBranch} />
        )}
        {/* Main content — extra top padding on mobile accounts for the sticky topbar */}
        <main style={{ flex: 1, padding: "2.5rem" }} className="dashboard-main">
          <style>{`
            @media (max-width: 768px) {
              .dashboard-main { padding: 1.25rem !important; }
            }
          `}</style>
          {children}
        </main>
      </div>
    </div>
  );
}

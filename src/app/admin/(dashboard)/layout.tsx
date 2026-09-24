import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../../../db";
import { user } from "../../../db/schema";
import { eq } from "drizzle-orm";
import Sidebar from "./Sidebar";

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

  return (
    <div className="layout-root">
      <style>{`
        .layout-root { display: flex; min-height: 100vh; background: #f4f5f7; }
        @media (max-width: 768px) {
          .layout-root { flex-direction: column; }
        }
      `}</style>
      <Sidebar role={role} userName={session.user.name} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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

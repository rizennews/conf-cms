import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../../../db";
import { events, branches } from "../../../db/schema";
import { eq } from "drizzle-orm";
import KioskClient from "./KioskClient";

export default async function KioskPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  // Require login to access Kiosk mode for security
  if (!session) redirect("/admin/login");

  // Fetch only active events
  const activeEvents = await db.select().from(events).where(eq(events.isActive, true));
  const allBranches = await db.select().from(branches);

  return <KioskClient events={activeEvents} branches={allBranches} />;
}

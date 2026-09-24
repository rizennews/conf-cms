import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../db";
import { registrations, user, events, branches } from "../../../db/schema";
import { eq, count, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get role
  let role = "branch_head";
  let userBranchId: string | null = null;
  const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  if (currentUser.length > 0) {
    role = currentUser[0].role;
    userBranchId = currentUser[0].branchId;
  }

  // Build query
  let query = db.select({
    id: registrations.id,
    fullName: registrations.fullName,
    email: registrations.email,
    whatsapp: registrations.whatsapp,
    address: registrations.address,
    ageRange: registrations.ageRange,
    isMember: registrations.isMember,
    isFirstTime: registrations.isFirstTime,
    branchId: registrations.branchId,
    heardFrom: registrations.heardFrom,
    invitees: registrations.invitees,
    eventId: registrations.eventId,
    status: registrations.status,
    createdAt: registrations.createdAt,
    customData: registrations.customData,
  }).from(registrations).orderBy(desc(registrations.createdAt));

  if (role === "branch_head" && userBranchId) {
    query = query.where(eq(registrations.branchId, userBranchId)) as any;
  }

  const allRegs = await query;

  // Build CSV
  const csvHeaders = [
    "ID", "Full Name", "Email", "WhatsApp", "Address", "Age Range",
    "Is Member", "First Timer", "Branch", "Heard From", "Invitees",
    "Event", "Status", "Registered At"
  ];

  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = allRegs.map((r: any) => [
    r.id,
    r.fullName,
    r.email,
    r.whatsapp,
    r.address,
    r.ageRange,
    r.isMember ? "Yes" : "No",
    r.isFirstTime ? "Yes" : "No",
    r.branchId,
    r.heardFrom,
    r.invitees,
    r.eventId,
    r.status,
    r.createdAt ? new Date(r.createdAt).toISOString() : "",
  ].map(escape).join(","));

  const csv = [csvHeaders.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

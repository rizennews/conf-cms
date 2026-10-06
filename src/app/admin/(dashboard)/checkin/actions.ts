"use server";

import { db } from "../../../../db";
import { registrations, activityLogs } from "../../../../db/schema";
import { eq, or, ilike, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "../../../../lib/auth";
import { headers, cookies } from "next/headers";
import { user } from "../../../../db/schema";

export async function searchRegistrations(query: string, eventId: string) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    
    let branchIdFilter = null;
    if (session) {
      const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
      const userRole = currentUser[0]?.role;
      const cookieStore = await cookies();
      const impersonatedBranch = cookieStore.get("impersonatedBranch")?.value;
      const isImpersonating = (userRole === "super_admin" || userRole === "admin") && impersonatedBranch;
      branchIdFilter = isImpersonating ? impersonatedBranch : (userRole === "branch_head" ? currentUser[0].branchId : null);
    }

    const conditions = [
      eq(registrations.eventId, eventId),
      or(
        ilike(registrations.fullName, `%${query}%`),
        ilike(registrations.email, `%${query}%`),
        ilike(registrations.whatsapp, `%${query}%`)
      )
    ];

    if (branchIdFilter) {
      conditions.push(eq(registrations.branchId, branchIdFilter));
    }

    const results = await db.select({
      id: registrations.id,
      fullName: registrations.fullName,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      branchId: registrations.branchId,
      status: registrations.status,
      eventId: registrations.eventId,
      customData: registrations.customData,
      createdAt: registrations.createdAt,
      checkedInAt: registrations.checkedInAt,
    })
    .from(registrations)
    .where(and(...conditions))
    .limit(10);

    return { results };
  } catch (err: unknown) {
    return { error: (err as Error).message, results: [] };
  }
}

export async function checkInById(registrationId: number) {
  try {
    const record = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
    
    await db.update(registrations)
      .set({ status: "checked-in", checkedInAt: new Date() })
      .where(eq(registrations.id, registrationId));

    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (session?.user?.id && record.length > 0) {
      await db.insert(activityLogs).values({
        userId: session.user.id,
        action: "check-in",
        details: JSON.stringify({ name: record[0].fullName || "Unknown", registrationId, data: record[0] }),
      });
    }

    revalidatePath("/admin/checkin");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function undoCheckInById(registrationId: number) {
  try {
    const record = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);

    await db.update(registrations)
      .set({ status: "registered", checkedInAt: null })
      .where(eq(registrations.id, registrationId));

    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (session?.user?.id && record.length > 0) {
      await db.insert(activityLogs).values({
        userId: session.user.id,
        action: "undo-check-in",
        details: JSON.stringify({ name: record[0].fullName || "Unknown", registrationId, data: record[0] }),
      });
    }

    revalidatePath("/admin/checkin");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function getRegistrationById(id: number) {
  try {
    const result = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
    return { registration: result[0] || null };
  } catch (err: unknown) {
    return { error: (err as Error).message, registration: null };
  }
}

export async function getAllRegistrations(eventId: string) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    
    let branchIdFilter = null;
    if (session) {
      const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
      const userRole = currentUser[0]?.role;
      const cookieStore = await cookies();
      const impersonatedBranch = cookieStore.get("impersonatedBranch")?.value;
      const isImpersonating = (userRole === "super_admin" || userRole === "admin") && impersonatedBranch;
      branchIdFilter = isImpersonating ? impersonatedBranch : (userRole === "branch_head" ? currentUser[0].branchId : null);
    }

    const conditions = [eq(registrations.eventId, eventId)];
    if (branchIdFilter) {
      conditions.push(eq(registrations.branchId, branchIdFilter));
    }

    const results = await db.select({
      id: registrations.id,
      fullName: registrations.fullName,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      branchId: registrations.branchId,
      status: registrations.status,
      eventId: registrations.eventId,
      customData: registrations.customData,
      createdAt: registrations.createdAt,
      checkedInAt: registrations.checkedInAt,
    })
    .from(registrations)
    .where(and(...conditions));

    return { results };
  } catch (err: unknown) {
    return { error: (err as Error).message, results: [] };
  }
}

export async function bulkCheckIn(ids: number[]) {
  if (!ids || ids.length === 0) return { success: true };
  try {
    await db.update(registrations)
      .set({ status: "checked-in", checkedInAt: new Date() })
      .where(inArray(registrations.id, ids));

    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (session?.user?.id) {
      await db.insert(activityLogs).values({
        userId: session.user.id,
        action: "bulk-check-in",
        details: JSON.stringify({ count: ids.length, ids }),
      });
    }

    revalidatePath("/admin/checkin");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

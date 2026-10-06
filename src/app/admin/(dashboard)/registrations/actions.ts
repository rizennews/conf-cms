"use server";

import { db } from "../../../../db";
import { registrations, branches, activityLogs } from "../../../../db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";

export async function bulkInsertRegistrations(rows: Record<string, unknown>[], eventId: string) {
  try {
    let inserted = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const branchId = (row.branchId as string) || "unknown";
        if (branchId !== "unknown") {
          const existing = await db.select().from(branches).where(eq(branches.id, branchId)).limit(1);
          if (existing.length === 0) {
            const branchName = branchId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            await db.insert(branches).values({ id: branchId, name: branchName });
          }
        }

        await db.insert(registrations).values({
          fullName: (row.fullName as string) || null,
          email: (row.email as string) || null,
          whatsapp: (row.whatsapp as string) || null,
          address: (row.address as string) || null,
          ageRange: (row.ageRange as string) || null,
          isMember: row.isMember === true || row.isMember === "Yes" || row.isMember === "true" ? true : false,
          isFirstTime: row.isFirstTime === true || row.isFirstTime === "Yes" || row.isFirstTime === "true" ? true : false,
          heardFrom: (row.heardFrom as string) || null,
          invitees: (row.invitees as string) || null,
          registrantStatus: (row.registrantStatus as string) || null,
          branchId,
          eventId,
          status: "registered",
          customData: (row.customData as string) || null,
        });
        inserted++;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`Row ${(row.fullName as string) || "?"}: ${msg}`);
      }
    }

    revalidatePath("/admin/registrations");
    return { success: true, inserted, errors };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
}

export async function deleteRegistration(id: number) {
  try {
    const record = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
    if (!record.length) return { error: "Registration not found" };

    await db.delete(registrations).where(eq(registrations.id, id));
    
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (session?.user?.id) {
      await db.insert(activityLogs).values({
        userId: session.user.id,
        action: "delete-registration",
        details: JSON.stringify({ name: record[0].fullName || "Unknown", data: record[0] }),
      });
    }

    revalidatePath("/admin/registrations");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
}

export async function bulkDeleteRegistrations(ids: number[]) {
  if (!ids || ids.length === 0) return { success: true };
  try {
    const records = await db.select().from(registrations).where(inArray(registrations.id, ids));
    if (!records.length) return { success: true };

    await db.delete(registrations).where(inArray(registrations.id, ids));
    
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (session?.user?.id) {
      const names = records.map(r => r.fullName).filter(Boolean).join(", ");
      await db.insert(activityLogs).values({
        userId: session.user.id,
        action: "bulk-delete-registration",
        details: JSON.stringify({ name: names, count: ids.length, data: records }),
      });
    }

    revalidatePath("/admin/registrations");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
}

export async function updateRegistration(id: number, data: Record<string, unknown>) {
  try {
    const existing = await db.select({ customData: registrations.customData }).from(registrations).where(eq(registrations.id, id)).limit(1);
    let updatedCustomData = existing[0]?.customData || null;

    if (data._staffNotes !== undefined) {
      let customObj: Record<string, unknown> = {};
      if (updatedCustomData) {
        try { customObj = typeof updatedCustomData === 'string' ? JSON.parse(updatedCustomData) : updatedCustomData; } catch { /* ignore */ }
      }
      
      if (data._staffNotes) {
        customObj._staffNotes = data._staffNotes;
      } else {
        delete customObj._staffNotes;
      }
      
      updatedCustomData = Object.keys(customObj).length > 0 ? JSON.stringify(customObj) : null;
    }

    await db.update(registrations).set({
      fullName: (data.fullName as string) || null,
      email: (data.email as string) || null,
      whatsapp: (data.whatsapp as string) || null,
      address: (data.address as string) || null,
      ageRange: (data.ageRange as string) || null,
      registrantStatus: (data.registrantStatus as string) || null,
      customData: updatedCustomData as string | null,
    }).where(eq(registrations.id, id));

    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (session?.user?.id) {
      await db.insert(activityLogs).values({
        userId: session.user.id,
        action: "update-registration",
        details: JSON.stringify({ registrationId: id, updatedFields: Object.keys(data) }),
      });
    }

    revalidatePath("/admin/registrations");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
}

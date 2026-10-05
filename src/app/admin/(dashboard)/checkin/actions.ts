"use server";

import { db } from "../../../../db";
import { registrations } from "../../../../db/schema";
import { eq, or, ilike, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function searchRegistrations(query: string, eventId: string) {
  try {
    const results = await db.select({
      id: registrations.id,
      fullName: registrations.fullName,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      branchId: registrations.branchId,
      status: registrations.status,
      eventId: registrations.eventId,
    })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        or(
          ilike(registrations.fullName, `%${query}%`),
          ilike(registrations.email, `%${query}%`),
          ilike(registrations.whatsapp, `%${query}%`)
        )
      )
    )
    .limit(10);

    return { results };
  } catch (err: unknown) {
    return { error: (err as Error).message, results: [] };
  }
}

export async function checkInById(registrationId: number) {
  try {
    await db.update(registrations)
      .set({ status: "checked-in" })
      .where(eq(registrations.id, registrationId));

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
    const results = await db.select({
      id: registrations.id,
      fullName: registrations.fullName,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      branchId: registrations.branchId,
      status: registrations.status,
      eventId: registrations.eventId,
    })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));

    return { results };
  } catch (err: unknown) {
    return { error: (err as Error).message, results: [] };
  }
}

export async function bulkCheckIn(ids: number[]) {
  if (!ids || ids.length === 0) return { success: true };
  try {
    await db.update(registrations)
      .set({ status: "checked-in" })
      .where(inArray(registrations.id, ids));

    revalidatePath("/admin/checkin");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

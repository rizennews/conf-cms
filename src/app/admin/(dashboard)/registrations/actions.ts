"use server";

import { db } from "../../../../db";
import { registrations, branches } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function bulkInsertRegistrations(rows: Record<string, unknown>[], eventId: string) {
  try {
    let inserted = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        // Ensure branch exists, create if not
        const branchId = (row.branchId as string) || "unknown";
        if (branchId !== "unknown") {
          const existing = await db.select().from(branches).where(eq(branches.id, branchId)).limit(1);
          if (existing.length === 0) {
            // Auto-create branch with a readable name from the ID
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

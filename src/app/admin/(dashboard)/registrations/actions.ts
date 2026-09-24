"use server";

import { db } from "../../../../db";
import { registrations, branches } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function bulkInsertRegistrations(rows: any[], eventId: string) {
  try {
    let inserted = 0;
    let errors: string[] = [];

    for (const row of rows) {
      try {
        // Ensure branch exists, create if not
        if (row.branchId) {
          const existing = await db.select().from(branches).where(eq(branches.id, row.branchId)).limit(1);
          if (existing.length === 0) {
            await db.insert(branches).values({ id: row.branchId, name: row.branchId });
          }
        }

        await db.insert(registrations).values({
          fullName: row.fullName || null,
          email: row.email || null,
          whatsapp: row.whatsapp || null,
          address: row.address || null,
          ageRange: row.ageRange || null,
          branchId: row.branchId || "unknown",
          eventId: eventId,
          status: "registered",
        });
        inserted++;
      } catch (e: any) {
        errors.push(`Row ${row.fullName || "?"}: ${e.message}`);
      }
    }

    revalidatePath("/admin/registrations");
    return { success: true, inserted, errors };
  } catch (err: any) {
    return { error: err.message };
  }
}

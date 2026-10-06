"use server";

import { db } from "../../../../db";
import { registrations, activityLogs } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";

export async function recoverRegistration(logId: number) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user?.id) return { error: "Unauthorized" };

    const log = await db.select().from(activityLogs).where(eq(activityLogs.id, logId)).limit(1);
    if (!log.length) return { error: "Log not found" };
    
    if (log[0].action !== "delete-registration" && log[0].action !== "bulk-delete-registration") {
      return { error: "This log does not contain a deleted registration." };
    }

    if (!log[0].details) return { error: "Log payload missing." };

    const details = JSON.parse(log[0].details);
    const dataToRestore = details.data;

    if (!dataToRestore) return { error: "No recoverable data found." };

    if (Array.isArray(dataToRestore)) {
      // Bulk restore
      for (const record of dataToRestore) {
        delete record.id; // Let the DB generate a new ID to avoid conflicts
        if (record.createdAt) record.createdAt = new Date(record.createdAt);
        if (record.checkedInAt) record.checkedInAt = new Date(record.checkedInAt);
        await db.insert(registrations).values(record);
      }
    } else {
      // Single restore
      delete dataToRestore.id;
      if (dataToRestore.createdAt) dataToRestore.createdAt = new Date(dataToRestore.createdAt);
      if (dataToRestore.checkedInAt) dataToRestore.checkedInAt = new Date(dataToRestore.checkedInAt);
      await db.insert(registrations).values(dataToRestore);
    }

    // Log the recovery
    await db.insert(activityLogs).values({
      userId: session.user.id,
      action: "recover-registration",
      details: JSON.stringify({ name: details.name, originalLogId: logId }),
    });

    revalidatePath("/admin/logs");
    revalidatePath("/admin/registrations");
    revalidatePath("/admin/analytics");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
}

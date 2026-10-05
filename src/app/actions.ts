"use server";

import { db } from "../db";
import { registrations, branches } from "../db/schema";
import { eq } from "drizzle-orm";

export async function submitRegistration(data: any) {
  try {
    const {
      fullName,
      email,
      whatsapp,
      address,
      ageRange,
      isMember,
      isFirstTime,
      heardFrom,
      invitees,
      registrantStatus,
      branchName,
      otherBranch,
      eventId
    } = data;

    let branchId = "";
    
    if (branchName === "Other") {
      branchId = "other";
      // Ensure 'Other' category exists in branches
      const existingOther = await db.select().from(branches).where(eq(branches.id, "other")).limit(1);
      if (existingOther.length === 0) {
        await db.insert(branches).values({ id: "other", name: "Other (External)" });
      }
    } else {
      let finalBranchName = branchName || "Unknown";
      const existing = await db.select().from(branches).where(eq(branches.name, finalBranchName)).limit(1);
      
      if (existing.length > 0) {
        branchId = existing[0].id;
      } else {
        branchId = finalBranchName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await db.insert(branches).values({ id: branchId, name: finalBranchName });
      }
    }

    const [inserted] = await db.insert(registrations).values({
      fullName,
      email,
      whatsapp,
      address,
      ageRange,
      isMember: isMember === "Yes",
      isFirstTime: isFirstTime === "Yes",
      branchId,
      heardFrom,
      invitees,
      registrantStatus,
      eventId,
      customData: JSON.stringify({ 
        ...(branchName === "Other" && otherBranch ? { specifiedBranch: otherBranch } : {}),
        ...(data.customData || {})
      })
    }).returning({ id: registrations.id });

    return { success: true, id: inserted.id };
  } catch (err: any) {
    return { error: "Failed to submit registration: " + err.message };
  }
}

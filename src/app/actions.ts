"use server";

import { db } from "../db";
import { registrations, branches } from "../db/schema";
import { eq } from "drizzle-orm";

export async function submitRegistration(data: any) {
  try {
    const custom = data.customData || {};
    
    // Find fields using case-insensitive keyword matching
    const findField = (keywords: string[]) => {
      const key = Object.keys(custom).find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
      return key ? custom[key] : null;
    };

    const fullName = findField(["name"]);
    const email = findField(["email"]);
    const whatsapp = findField(["contact", "number", "whatsapp", "phone"]);
    const address = findField(["address", "location"]);
    const ageRange = findField(["age"]);
    const isMember = findField(["member"]) === "Yes";
    const isFirstTime = findField(["first time", "first-time"]) === "Yes";
    const heardFrom = findField(["hear", "heard"]);
    const invitees = findField(["invitees"]);
    let branchId = findField(["branch", "church"]);

    // If they typed a custom "Other" branch
    if (branchId === "Other" || (!branchId && custom.otherBranch)) {
      const branchName = branchId === "Other" ? "Other" : branchId || "Unknown";
      const slug = branchName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const existing = await db.select().from(branches).where(eq(branches.id, slug));
      if (existing.length === 0) {
        await db.insert(branches).values({ id: slug, name: branchName });
      }
      branchId = slug;
    }

    await db.insert(registrations).values({
      fullName,
      email,
      whatsapp,
      address,
      ageRange,
      isMember,
      isFirstTime,
      branchId,
      heardFrom,
      invitees,
      eventId: data.eventId,
      customData: JSON.stringify(custom)
    });

    return { success: true };
  } catch (err: any) {
    return { error: "Failed to submit registration: " + err.message };
  }
}

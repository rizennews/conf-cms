"use server";

import { db } from "../db";
import { registrations, branches } from "../db/schema";
import { eq } from "drizzle-orm";

export async function submitRegistration(data: any) {
  try {
    const custom = data.customData || {};
    
    // Find fields using case-insensitive keyword matching
    const findField = (keywords: string[], exclude: string[] = []) => {
      const key = Object.keys(custom).find(k => {
        const lower = k.toLowerCase();
        return keywords.some(kw => lower.includes(kw)) && !exclude.some(ex => lower.includes(ex));
      });
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
    let branchName = findField(["branch", "church"], ["member"]) || "Unknown";
    if (branchName === "Other" && custom.otherBranch) {
      branchName = custom.otherBranch;
    }

    let branchId = "";
    const existing = await db.select().from(branches).where(eq(branches.name, branchName)).limit(1);
    
    if (existing.length > 0) {
      branchId = existing[0].id;
    } else {
      branchId = branchName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await db.insert(branches).values({ id: branchId, name: branchName });
    }

    const [inserted] = await db.insert(registrations).values({
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
    }).returning({ id: registrations.id });

    return { success: true, id: inserted.id };
  } catch (err: any) {
    return { error: "Failed to submit registration: " + err.message };
  }
}

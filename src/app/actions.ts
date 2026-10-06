"use server";

import { db } from "../db";
import { registrations, branches, activityLogs } from "../db/schema";
import { eq, and } from "drizzle-orm";

interface RegistrationInput {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  ageRange?: string;
  isMember?: string;
  isFirstTime?: string;
  heardFrom?: string;
  invitees?: string;
  registrantStatus?: string;
  branchName?: string;
  otherBranch?: string;
  eventId?: string;
  customData?: Record<string, unknown>;
  website?: string; // Honeypot
}

import { headers } from "next/headers";

// Simple in-memory rate limiter (per Edge instance) to protect against DoS/Spam
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function submitRegistration(data: RegistrationInput) {
  try {
    // 1. IP Rate Limiting
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || "unknown-ip";
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 5; // Max 5 registrations per minute per IP
    
    const ipData = rateLimitMap.get(ip);
    if (ipData) {
      if (now > ipData.resetTime) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      } else {
        if (ipData.count >= maxRequests) {
          return { error: "You are registering too fast. Please wait a minute and try again." };
        }
        ipData.count++;
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    }
    // Spam protection: honeypot check
    if (data.website) {
      return { id: 999999, success: true };
    }

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

    // Duplicate check
    if (eventId) {
      if (email) {
        const existingEmail = await db.select().from(registrations).where(and(eq(registrations.eventId, eventId), eq(registrations.email, email))).limit(1);
        if (existingEmail.length > 0) return { error: "This email has already been used to register for this event." };
      }
      if (whatsapp) {
        const existingPhone = await db.select().from(registrations).where(and(eq(registrations.eventId, eventId), eq(registrations.whatsapp, whatsapp))).limit(1);
        if (existingPhone.length > 0) return { error: "This phone number has already been used to register for this event." };
      }
    }
    
    if (!branchName || branchName.toLowerCase() === "other") {
      branchId = "other";
      // Ensure 'Other' category exists in branches
      const existingOther = await db.select().from(branches).where(eq(branches.id, "other")).limit(1);
      if (existingOther.length === 0) {
        await db.insert(branches).values({ id: "other", name: "Other (External)" });
      }
    } else {
      const finalBranchName = branchName;
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

    // Log the public registration
    await db.insert(activityLogs).values({
      action: "public-registration",
      details: JSON.stringify({ name: fullName, eventId, data: { fullName, email, whatsapp, address, ageRange, branchId, isMember, isFirstTime, heardFrom, invitees, registrantStatus, customData: data.customData } }),
    });

    return { success: true, id: inserted.id };
  } catch (err: unknown) {
    return { error: "Failed to submit registration: " + (err instanceof Error ? err.message : String(err)) };
  }
}

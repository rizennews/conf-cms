"use server";

import { db } from "../../../../db";
import { events } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveEvent(data: { id?: string; name: string; slug: string; deadline?: Date | null; isActive?: boolean; isMainEvent?: boolean; customFields: string }) {
  try {
    if (data.isMainEvent) {
      await db.update(events).set({ isMainEvent: false });
    }

    if (data.id) {
      await db.update(events).set({
        name: data.name,
        slug: data.slug,
        deadline: data.deadline || null,
        isActive: data.isActive,
        isMainEvent: data.isMainEvent,
        customFields: data.customFields
      }).where(eq(events.id, data.id));
    } else {
      const id = "evt_" + Math.random().toString(36).substring(2, 9);
      await db.insert(events).values({
        id,
        name: data.name,
        slug: data.slug,
        deadline: data.deadline || null,
        isActive: data.isActive,
        isMainEvent: data.isMainEvent,
        customFields: data.customFields
      });
    }
    
    revalidatePath("/admin/events");
    return { success: true };
  } catch (err: any) {
    if (err.code === '23505') {
      return { error: "An event with this slug URL already exists." };
    }
    return { error: "Failed to save event: " + err.message };
  }
}

export async function createBlankEvent() {
  const id = "evt_" + Math.random().toString(36).substring(2, 9);
  
  const defaultFields = [
    { label: "Full Name", type: "text" },
    { label: "Email Address", type: "email" },
    { label: "WhatsApp Number", type: "tel" },
    { label: "Age Range", type: "select" },
    { label: "Are you a church member?", type: "checkbox" },
    { label: "Is this your first time?", type: "checkbox" },
    { label: "Branch", type: "select" }
  ];

  await db.insert(events).values({
    id,
    name: "Untitled Event",
    slug: "event-" + Math.random().toString(36).substring(2, 6),
    customFields: JSON.stringify(defaultFields)
  });
  
  revalidatePath("/admin/events");
  return id;
}

export async function deleteEvent(id: string) {
  try {
    await db.delete(events).where(eq(events.id, id));
    revalidatePath("/admin/events");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to delete event: " + err.message };
  }
}

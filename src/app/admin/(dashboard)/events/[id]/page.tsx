import { db } from "../../../../../db";
import { events } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import FormBuilder from "./FormBuilder";


export default async function EventBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  let eventData = null;
  const resolvedParams = await params;
  
  if (resolvedParams.id !== "new") {
    const records = await db.select().from(events).where(eq(events.id, resolvedParams.id)).limit(1);
    eventData = records[0];

    if (eventData) {
      let customFields = [];
      try {
        customFields = JSON.parse(eventData.customFields || "[]");
      } catch {}
      
      let updated = false;
      for (const f of customFields) {
        if (f.label.toLowerCase().trim() === "branch") {
          const { branches } = await import("../../../../../db/schema");
          const allBranches = await db.select().from(branches);
          const branchNames = allBranches.map((b: Record<string, unknown>) => b.id === 'other' ? 'Other' : String(b.name));
          if (!branchNames.includes("Other")) branchNames.push("Other");
          
          // Check if the branch names list is different at all
          const isDifferent = !f.options || f.options.length !== branchNames.length || !f.options.every((opt: string, i: number) => opt === branchNames[i]);
          if (isDifferent) {
            f.options = branchNames;
            updated = true;
          }
        }
      }

      if (updated) {
        await db.update(events).set({ customFields: JSON.stringify(customFields) }).where(eq(events.id, eventData.id));
        eventData.customFields = JSON.stringify(customFields);
      }
    }
  }

  return <FormBuilder initialEvent={eventData ? { ...eventData, customFields: eventData.customFields || undefined } : null} />;
}

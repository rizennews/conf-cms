import { db } from "./src/db";
import { events } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function addStatusToEvents() {
  const allEvents = await db.select().from(events);
  for (const event of allEvents) {
    let fields = [];
    try {
      if (event.customFields) fields = JSON.parse(event.customFields);
    } catch (e) {
      console.error("Error parsing fields for", event.id);
    }
    
    const hasStatus = fields.some((f: any) => f.label.toLowerCase().includes("status"));
    
    if (!hasStatus) {
      fields.push({
        id: Math.random().toString(36).substring(2, 9),
        label: "Registrant Status",
        description: "Are you a member, guest, or worker?",
        type: "select",
        options: ["Member", "First-time Guest", "Regular Attendee", "Worker / Volunteer", "Minister / Clergy"],
        required: true
      });
      
      await db.update(events).set({ customFields: JSON.stringify(fields) }).where(eq(events.id, event.id));
      console.log(`Updated event ${event.name}`);
    } else {
      console.log(`Event ${event.name} already has a status field.`);
    }
  }
  console.log("Done.");
}

addStatusToEvents().catch(console.error).finally(() => process.exit(0));

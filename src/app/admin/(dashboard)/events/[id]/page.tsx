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
  }

  return <FormBuilder initialEvent={eventData} />;
}

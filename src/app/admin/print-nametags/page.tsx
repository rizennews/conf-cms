import { db } from "../../../db";
import { registrations, events, branches } from "../../../db/schema";
import { eq } from "drizzle-orm";
import PrintNametagsClient from "./PrintNametagsClient";

export default async function PrintNametagsPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const resolvedParams = await searchParams;
  const eventId = resolvedParams.eventId;
  
  if (!eventId) {
    return <div>Please specify an eventId in the URL to print nametags.</div>;
  }
  
  const allRegs = await db.select().from(registrations).where(eq(registrations.eventId, eventId));
  const eventRecords = await db.select().from(events).where(eq(events.id, eventId));
  
  return <PrintNametagsClient registrations={allRegs} event={eventRecords[0]} />;
}

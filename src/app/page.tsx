import Gallery from "../components/Gallery";
import { db } from "../db";
import { events, branches } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export default async function Home() {
  const allBranches = await db.select().from(branches);
  
  // Try to find an explicitly marked main event first
  let eventsList = await db.select().from(events).where(and(eq(events.isMainEvent, true), eq(events.isActive, true))).limit(1);
  
  // Fallback to the latest active event if none is marked as main
  if (eventsList.length === 0) {
    eventsList = await db.select().from(events).where(eq(events.isActive, true)).orderBy(desc(events.createdAt)).limit(1);
  }
  
  const activeEvent = eventsList.length > 0 ? eventsList[0] : null;

  return (
    <main>
      <Gallery branches={allBranches} event={activeEvent} />
    </main>
  );
}

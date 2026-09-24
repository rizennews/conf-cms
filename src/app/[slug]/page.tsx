import { notFound } from "next/navigation";
import Gallery from "../../components/Gallery";
import { db } from "../../db";
import { events, branches } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const eventsList = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, resolvedParams.slug), eq(events.isActive, true)))
    .limit(1);

  if (eventsList.length === 0) {
    notFound();
  }

  const allBranches = await db.select().from(branches);
  const activeEvent = eventsList[0];

  return (
    <main>
      <Gallery branches={allBranches} event={activeEvent} autoOpen={true} />
    </main>
  );
}

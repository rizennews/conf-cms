import { notFound } from "next/navigation";
import Gallery from "../../components/Gallery";
import { db } from "../../db";
import { events, branches } from "../../db/schema";
import { eq, and } from "drizzle-orm";

import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  
  const eventsList = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, resolvedParams.slug), eq(events.isActive, true)))
    .limit(1);

  if (eventsList.length === 0) {
    return {
      title: "Event Not Found",
    };
  }

  const activeEvent = eventsList[0];
  const title = `${activeEvent.name} | Event Registration`;
  const description = `Register for ${activeEvent.name} and join us for an incredible experience.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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

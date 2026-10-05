import { notFound } from "next/navigation";
import Gallery from "../../components/Gallery";
import { db } from "../../db";
import { events, branches } from "../../db/schema";
import { eq, and } from "drizzle-orm";

import { Metadata, ResolvingMetadata } from "next";

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
      images: [
        {
          url: "https://r2.rizen.link/11c210ab-e9f8-450a-85d1-3957ce6c2438/6ce5beea1e7f60ce9d0ce4684a0d8ff0.png", // Fallback hero image from gallery
          width: 1200,
          height: 630,
          alt: activeEvent.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://r2.rizen.link/11c210ab-e9f8-450a-85d1-3957ce6c2438/6ce5beea1e7f60ce9d0ce4684a0d8ff0.png"],
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

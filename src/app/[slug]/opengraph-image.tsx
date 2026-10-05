import { ImageResponse } from 'next/og';
import { db } from '../../../db';
import { events } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'edge';

// Image metadata
export const alt = 'Event Cover Image';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image(
  { params }: { params: { slug: string } }
) {
  // We need to fetch the event name from the database based on the slug
  let eventName = "Event Registration";
  let eventDate = "Join us!";
  
  try {
    const eventsList = await db
      .select()
      .from(events)
      .where(and(eq(events.slug, params.slug), eq(events.isActive, true)))
      .limit(1);
      
    if (eventsList.length > 0) {
      eventName = eventsList[0].name as string;
      if (eventsList[0].deadline) {
        const date = new Date(eventsList[0].deadline as string);
        eventDate = `Register by ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
      }
    }
  } catch (e) {
    // Silently fall back to default text on DB error
  }

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(43,63,242,0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
          }}
        />
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
            gap: '20px',
          }}
        >
          <div style={{ width: '40px', height: '40px', background: '#2b3ff2', borderRadius: '8px' }} />
          <h2 style={{ fontSize: '32px', color: '#888', margin: 0, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            LifeCity Church
          </h2>
        </div>

        <h1
          style={{
            fontSize: '84px',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '30px',
            letterSpacing: '-0.03em',
            maxWidth: '900px',
          }}
        >
          {eventName}
        </h1>

        <p
          style={{
            fontSize: '36px',
            color: '#a1a1aa',
            margin: 0,
            fontWeight: 500,
          }}
        >
          {eventDate}
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}

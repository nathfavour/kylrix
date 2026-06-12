import { ImageResponse } from 'next/og';
import { getPublicGoalDataSecure } from '@/lib/actions/secure-ops';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goal = await getPublicGoalDataSecure(id);

  const title = goal?.title || 'Shared Goal';
  const description = goal?.description || 'Track deliverables, milestones, and automations.';
  const status = goal?.status || 'todo';
  const priority = goal?.priority || 'medium';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'radial-gradient(circle at 50% 50%, #161412 0%, #0A0908 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%)',
          }}
        />

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#A855F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#fff',
              }}
            >
              K
            </div>
            <span style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)' }}>
              KYLRIX FLOW
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#9B9691', fontFamily: 'monospace' }}>
            GOAL ID: {id.substring(0, 8)}
          </span>
        </div>

        {/* Middle Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: 'auto 0' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                color: '#C084FC',
              }}
            >
              {status}
            </span>
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#FBBF24',
              }}
            >
              {priority} Priority
            </span>
          </div>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: 0,
              color: '#fff',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              lineHeight: 1.5,
              maxWidth: '800px',
            }}
          >
            {description.length > 180 ? description.substring(0, 180) + '...' : description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '20px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#9B9691' }}>
            The only agentic workspace where productivity tools and agents coexist.
          </span>
          <span style={{ fontSize: '13px', color: '#A855F7', fontWeight: 'bold' }}>
            kylrix.space
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

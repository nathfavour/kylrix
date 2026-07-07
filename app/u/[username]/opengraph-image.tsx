import { ImageResponse } from 'next/og';
import { UsersService } from '@/lib/services/users';

export const alt = 'Kylrix User Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function UserProfileOGImage(props: {
  params: Promise<{ username: string }>;
}) {
  const params = await props.params;
  const username = params.username;

  let displayName = username;
  let bioText = 'View my profile on Kylrix.';
  let avatarUrl = '';
  let tags: string[] = [];
  let tipEnabled = false;

  try {
    const profile = await UsersService.getProfile(username);
    if (profile) {
      displayName = profile.displayName || profile.username || username;
      bioText = profile.bio || 'Sovereign agentic user profile.';
      tags = (profile.tags || []) as string[];
      
      // Parse preferences
      try {
        const prefs = typeof profile.preferences === 'string'
          ? JSON.parse(profile.preferences)
          : profile.preferences || {};
        if (prefs.tags) tags = prefs.tags;
        tipEnabled = prefs.tipEnabled ?? false;
      } catch {}

      if (profile.avatar) {
        avatarUrl = `https://api.kylrix.space/v1/storage/buckets/profile_pictures/files/${profile.avatar}/view?project=67fe9627001d97e37ef3`;
      }
    }
  } catch (err) {
    console.error('[UserProfileOGImage] Failed to fetch profile:', err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          background: '#0A0908',
          color: '#ffffff',
          fontFamily: 'system-ui',
          position: 'relative',
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '400px',
            height: '400px',
            background: 'rgba(99, 102, 241, 0.08)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }}
        />

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontWeight: 900,
                fontSize: '18px',
              }}
            >
              K
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.04em' }}>Kylrix Connect</span>
          </div>
          {tipEnabled && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#F59E0B',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>⚡</span> Tips Active
            </div>
          )}
        </div>

        {/* Profile Card Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flex: 1, margin: '40px 0' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '32px',
                border: '3px solid rgba(255, 255, 255, 0.08)',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '32px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '3px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px',
                fontWeight: 900,
                color: '#6366F1',
              }}
            >
              {displayName.substring(0, 1).toUpperCase()}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: '#ffffff',
                }}
              >
                {displayName}
              </span>
              <span
                style={{
                  fontSize: '18px',
                  color: '#6366F1',
                  fontWeight: 700,
                  marginTop: '4px',
                }}
              >
                @{username}
              </span>
            </div>
            <span
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.5,
                maxWidth: '650px',
              }}
            >
              {bioText}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '24px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Sovereign OS Profile
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {tags.slice(0, 5).map((tag, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                #{tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

import type { Metadata } from 'next';
import { Profile } from '@/components/profile/ProfileRedesign';
import { UsersService } from '@/lib/services/users';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  try {
    const { username } = await params;
    const profile = await UsersService.getProfile(username);
    const fallbackImage = 'https://kylrix.space/logo_social.png';

    if (!profile) {
      return {
        title: `@${username} · Kylrix User`,
        description: `View @${username}'s profile on Kylrix.`,
        openGraph: {
          title: `@${username} · Kylrix User`,
          description: `View @${username}'s profile on Kylrix.`,
          images: [{ url: fallbackImage, width: 320, height: 320 }],
        },
        twitter: {
          card: 'summary',
          title: `@${username} · Kylrix User`,
          description: `View @${username}'s profile on Kylrix.`,
          images: [fallbackImage],
        },
      };
    }

    const displayName = profile.displayName || profile.username || username;
    const bioText = profile.bio ? profile.bio.substring(0, 160).trim() + '…' : `View @${username}'s profile on Kylrix.`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URI || 'https://kylrix.space';
    const ogImage = `${baseUrl}/u/${profile.username || username}/opengraph-image`;

    return {
      title: `${displayName} (@${profile.username || username}) · Kylrix`,
      description: bioText,
      openGraph: {
        title: `${displayName} (@${profile.username || username}) · Kylrix`,
        description: bioText,
        type: 'profile',
        username: profile.username || username,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${displayName}'s profile preview`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${displayName} (@${profile.username || username}) · Kylrix`,
        description: bioText,
        images: [ogImage],
      },
    };
  } catch (error) {
    console.error('Error generating profile metadata:', error);
    return {
      title: 'Kylrix User Profile',
      description: 'Connect and view user profile on the sovereign agentic OS.',
    };
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  
  // Parallel Fetch: Profile data + Server-side session check (if needed)
  // For now, we fetch the profile to pre-hydrate the client component
  const profile = await UsersService.getProfile(username);
  
  return (
    <div className="w-full pointer-events-auto">
      <Profile 
        username={username} 
        initialProfile={profile ? JSON.parse(JSON.stringify(profile)) : null} 
      />
    </div>
  );
}

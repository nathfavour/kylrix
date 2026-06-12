import type { Metadata } from 'next';
import { getPublicGoalDataSecure } from '@/lib/actions/secure-ops';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const goal = await getPublicGoalDataSecure(id);

    if (!goal) {
      return {
        title: 'Goal Not Found | Kylrix Flow',
        description: 'This goal is private or does not exist.',
      };
    }

    const title = `${goal.title} | Shared Goal`;
    const description = goal.description || `Status: ${goal.status} · Priority: ${goal.priority}`;
    const previewImage = `/flow/goal/${id}/opengraph-image?v=${encodeURIComponent(
      goal.updatedAt || id
    )}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: [
          {
            url: previewImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [previewImage],
      },
    };
  } catch (e) {
    return {
      title: 'Shared Goal | Kylrix Flow',
      description: 'Collaborate on tasks, milestones, and high-velocity goals.',
    };
  }
}

export default function GoalPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

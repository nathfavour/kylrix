import React from 'react';
import { validatePublicVaultAccess } from '@/lib/appwrite/vault';
import SharedVaultClient from '../../SharedVaultClient';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; key?: string[] }>;
}): Promise<Metadata> {
  const fallbackImage = 'https://www.kylrix.space/logo_social.png';

  try {
    const { id } = await params;
    const credential = await validatePublicVaultAccess(id);

    if (!credential) {
      return {
        title: 'Shared Secret · Kylrix',
        description: 'View this shared credential securely.',
        openGraph: {
          title: 'Shared Secret · Kylrix',
          description: 'View this shared credential securely.',
          images: [{ url: fallbackImage, width: 1200, height: 630 }],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Shared Secret · Kylrix',
          description: 'View this shared credential securely.',
          images: [fallbackImage],
        },
      };
    }

    // name is encrypted, so we show a generic preview (safe: no secret data in OG)
    const displayTitle = 'Shared Password · Kylrix';
    const displayDesc =
      'Someone shared a password with you via Kylrix Vault. Open this link to view the credential.';

    return {
      title: displayTitle,
      description: displayDesc,
      openGraph: {
        title: displayTitle,
        description: displayDesc,
        images: [{ url: fallbackImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: displayTitle,
        description: displayDesc,
        images: [fallbackImage],
      },
    };
  } catch {
    return {
      title: 'Shared Secret · Kylrix',
      description: 'View shared credentials securely.',
      openGraph: {
        title: 'Shared Secret · Kylrix',
        description: 'View shared credentials securely.',
        images: [{ url: fallbackImage, width: 1200, height: 630 }],
      },
    };
  }
}

export default async function SharedVaultPage({
  params,
}: {
  params: Promise<{ id: string; key?: string[] }>;
}) {
  const { id, key } = await params;

  // Server-side validation: if not public, show not-found
  const credential = await validatePublicVaultAccess(id);
  if (!credential) return notFound();

  const dekFragment = key?.[0] ?? undefined;

  // Pass the raw encrypted credential to the client for client-side decryption
  return (
    <SharedVaultClient
      credentialId={id}
      dekFragment={dekFragment}
      rawCredential={JSON.parse(JSON.stringify(credential))}
    />
  );
}

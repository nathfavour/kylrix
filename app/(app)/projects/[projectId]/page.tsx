'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function LegacyProjectDetailPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const projectId = params?.projectId;
    if (projectId) {
      router.replace(`/workspaces/${projectId}`);
    } else {
      router.replace('/workspaces');
    }
  }, [router, params]);

  return null;
}

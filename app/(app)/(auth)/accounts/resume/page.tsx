'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLastEcosystemRoute } from '@/lib/ecosystem/state-tracker';
import { resolveAuthenticatedEntryPath } from '@/lib/ecosystem/resume-route';
import { Box, CircularProgress } from '@/lib/mui-tailwind/material';

/**
 * Client resume fallback when middleware cookie is missing but local history exists.
 */
export default function ResumePage() {
  const router = useRouter();

  useEffect(() => {
    const lastState = getLastEcosystemRoute();
    router.replace(resolveAuthenticatedEntryPath(lastState?.path));
  }, [router]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
      <CircularProgress sx={{ color: '#6366F1' }} />
    </Box>
  );
}

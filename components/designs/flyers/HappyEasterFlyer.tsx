'use client';

import { forwardRef } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import FlyerShell from './FlyerShell';
import type { DesignFlyerProps } from '../types';

const HappyEasterFlyer = forwardRef<HTMLDivElement, DesignFlyerProps>(function HappyEasterFlyer(props, ref) {
  return (
    <FlyerShell
      ref={ref}
      {...props}
      accent="#6366F1"
      backgroundA="#161412"
      backgroundB="#2D2B29"
      eyebrow="HAPPY EASTER"
      title="He Is Risen"
      subtitle=""
    >
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: 5, overflow: 'hidden' }}>
        {/* Dynamic Backlighting - Grounding the scene in light */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 50% 60%, rgba(99, 102, 241, 0.25) 0%, transparent 70%),
              radial-gradient(circle at 50% 50%, rgba(253, 230, 138, 0.15) 0%, transparent 50%),
              linear-gradient(to top, #242220 0%, #2D2B29 40%, #1E1B4B 100%)
            `,
          }}
        />

        {/* The Resurrection Scene (Crosses + Defined Tomb) */}
        <Box
          component="img"
          src="/designs/resurrection-scene.svg"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
            filter: 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.3))',
          }}
        />
        
        {/* Grounding Atmospheric Overlay & Mist */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(to top, rgba(36, 34, 32, 1) 0%, rgba(36, 34, 32, 0.4) 30%, rgba(36, 34, 32, 0) 60%),
              radial-gradient(circle at 50% 100%, ${alpha('#6366F1', 0.08)} 0%, transparent 60%)
            `,
            zIndex: 3,
          }}
        />
        
        {/* Subtle Ground Mist for Footer Transition */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '35%',
            background: 'linear-gradient(to top, rgba(22, 20, 18, 0.85) 0%, transparent 100%)',
            filter: 'blur(50px)',
            opacity: 0.7,
            zIndex: 4,
          }}
        />
      </Box>
    </FlyerShell>
  );
});

export default HappyEasterFlyer;

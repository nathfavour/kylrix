'use client';

import React, { forwardRef } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import Logo from '@/components/Logo';
import type { DesignFlyerProps } from '../types';

interface FlyerShellProps extends DesignFlyerProps {
  accent: string;
  title: React.ReactNode;
  subtitle: string;
  eyebrow: string;
  backgroundA: string;
  backgroundB: string;
  children: React.ReactNode;
}

const FlyerShell = forwardRef<HTMLDivElement, FlyerShellProps>(function FlyerShell(
  { accent, title, eyebrow, className, children },
  ref
) {
  return (
    <Box
      ref={ref}
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 5',
        minHeight: { xs: 900, lg: 1080 },
        borderRadius: 6,
        overflow: 'hidden',
        isolation: 'isolate',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(145deg, #2D2B29 0%, #242220 100%)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          p: { xs: 4, md: 14 },
          pt: { xs: 8, md: 18 }, // Elite Tier top breathing room
          pb: { xs: 10, md: 14 },
        }}
      >
        {/* Balanced Top Hierarchy */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 3,
              py: 1.2,
              borderRadius: 99,
              bgcolor: alpha(accent, 0.1),
              color: accent,
              border: `1px solid ${alpha(accent, 0.2)}`,
              fontWeight: 900,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
              mb: 6, // Refined hierarchy gap
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              lineHeight: 0.82,
              letterSpacing: '-0.06em',
              fontSize: { xs: '3.5rem', md: '7.5rem' },
              color: 'white',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', flexGrow: 1, width: '100%', mb: 4 }}>
          {children}
        </Box>

        {/* Cohesive Elevated Footer */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 3.5,
            pt: 8,
            borderTop: '1px solid rgba(255,255,255,0.035)',
            width: '85%',
          }}
        >
          <Logo app="root" variant="icon" size={64} />
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              letterSpacing: '0.6em',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            KYLRIX.SPACE
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default FlyerShell;

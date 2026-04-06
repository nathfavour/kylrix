import { Box, Typography, alpha } from '@mui/material';
import Logo from '@/components/Logo';
import HappyEasterFlyer from './HappyEasterFlyer';
import type { DesignFlyerDefinition } from '../types';

const HappyEasterPreview = () => (
  <Box
    sx={{
      position: 'relative',
      height: 120,
      borderRadius: 4,
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #161412 0%, #0A0908 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      p: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/designs/easter-calvary.svg)',
        backgroundSize: 'cover',
        opacity: 0.3,
      }}
    />
    <Typography
      variant="caption"
      sx={{
        position: 'relative',
        color: '#6366F1',
        letterSpacing: '0.3em',
        fontWeight: 900,
        textTransform: 'uppercase',
      }}
    >
      He Is Risen
    </Typography>
  </Box>
);

export const DESIGN_FLYERS: DesignFlyerDefinition[] = [
  {
    slug: 'happy-easter',
    title: 'Happy Easter',
    subtitle: '',
    description: '',
    accent: '#6366F1',
    component: HappyEasterFlyer,
    preview: HappyEasterPreview,
  },
];

export const DESIGN_DEFAULT_SLUG = 'happy-easter';

export const getDesignFlyerBySlug = (slug: string) => DESIGN_FLYERS.find((flyer) => flyer.slug === slug) || null;

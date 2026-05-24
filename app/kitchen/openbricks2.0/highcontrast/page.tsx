'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Stack, InputBase, Button } from '@mui/material';
import Logo from '@/components/common/Logo';

export default function HighContrastPage() {
  const [testText, setTestText] = useState('Type high contrast thoughts here...');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000000', color: '#FFFFFF', py: 8, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Stack spacing={8}>
          
          {/* Header */}
          <Box sx={{ borderBottom: '2px solid #FFFFFF', pb: 4 }}>
            <Typography variant="overline" sx={{ color: '#6366F1', fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}>
              EXPERIMENTAL STAGE 2.0
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, fontFamily: 'var(--font-outfit)', letterSpacing: '-0.04em', mt: 1, mb: 2 }}>
              Ultra High Contrast
            </Typography>
            <Typography sx={{ opacity: 0.7, fontSize: '1.2rem', fontFamily: 'var(--font-satoshi)', maxWidth: '800px', lineHeight: 1.6 }}>
              A high-precision study in absolute contrast. We reject smooth blending, subtle grays, and shadows. Here, we carve components using pitch black voids, thick solid white border profiles, and stark high-saturation primary pivots.
            </Typography>
          </Box>

          {/* Grid of Contrast Studies */}
          <Grid container spacing={6}>
            
            {/* Study 1: The Monolith Panel */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ 
                p: 5, 
                bgcolor: '#000000', 
                borderRadius: '0px', // Strict razor corners
                border: '3px solid #FFFFFF', // Stark white border
                boxShadow: '8px 8px 0px #6366F1', // Saturated solid indigo shadow block
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  transform: 'translate(-3px, -3px)',
                  boxShadow: '11px 11px 0px #6366F1'
                }
              }}>
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, color: '#6366F1', mb: 2 }}>
                  STUDY_01 // THE SOLID MONOLITH
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'var(--font-outfit)', mb: 2 }}>
                  Infinite Solidity
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-satoshi)', fontSize: '1rem', opacity: 0.8, lineHeight: 1.7, mb: 3 }}>
                  By discarding border radiuses and soft outlines, components feel like heavy physical machine panels. The solid `#6366F1` offset shadow block anchors it firmly onto the black canvas.
                </Typography>
                <Button sx={{ 
                  bgcolor: '#FFFFFF', 
                  color: '#000000', 
                  fontWeight: 900, 
                  fontFamily: 'var(--font-space-grotesk)',
                  borderRadius: '0px',
                  border: '2px solid #000000',
                  px: 4,
                  py: 1.5,
                  boxShadow: '3px 3px 0px #6366F1',
                  '&:hover': {
                    bgcolor: '#F2F2F2',
                    transform: 'translate(-1px, -1px)',
                    boxShadow: '4px 4px 0px #6366F1'
                  }
                }}>
                  Execute Action
                </Button>
              </Paper>
            </Grid>

            {/* Study 2: Stark Quad Input */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ 
                p: 5, 
                bgcolor: '#000000', 
                borderRadius: '0px', 
                border: '3px solid #FFFFFF', 
                boxShadow: '8px 8px 0px #EC4899', 
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  transform: 'translate(-3px, -3px)',
                  boxShadow: '11px 11px 0px #EC4899'
                }
              }}>
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, color: '#EC4899', mb: 2 }}>
                  STUDY_02 // BRUTALIST FOCUS WELL
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'var(--font-outfit)', mb: 2 }}>
                  Precision Inputs
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-satoshi)', fontSize: '1rem', opacity: 0.8, mb: 3 }}>
                  Active input typing with stark high contrast. The writing surface sits in pure pitch black `#000000`, framed by a thick white border that reacts with deep solid pink on active state focus.
                </Typography>

                <Box sx={{ 
                  bgcolor: '#000000', 
                  border: '2px solid #FFFFFF', 
                  p: 2,
                  '&:focus-within': {
                    borderColor: '#EC4899'
                  }
                }}>
                  <InputBase 
                    fullWidth
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    sx={{ 
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-space-grotesk)',
                      fontSize: '1.15rem'
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Study 3: The Carved Logo In High Contrast */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ 
                p: 6, 
                bgcolor: '#000000', 
                borderRadius: '0px', 
                border: '3px solid #FFFFFF', 
                boxShadow: '8px 8px 0px #10B981' 
              }}>
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, color: '#10B981', mb: 3 }}>
                  STUDY_03 // ECOSYSTEM MARK IN PURE CONTRAST
                </Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={6} alignItems="center">
                  <Box sx={{ 
                    p: 4, 
                    bgcolor: '#000000', 
                    border: '3px solid #FFFFFF',
                    boxShadow: '4px 4px 0px #000000',
                    display: 'inline-flex'
                  }}>
                    <Logo app="note" size={120} variant="icon" />
                  </Box>

                  <Stack spacing={2}>
                    <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'var(--font-outfit)' }}>
                      High-Contrast Hexagon Render
                    </Typography>
                    <Typography sx={{ fontFamily: 'var(--font-satoshi)', opacity: 0.8, maxWidth: '600px', lineHeight: 1.7 }}>
                      By utilizing a thick `#000000` contour line surrounding the entire outer perimeter of the app hexagon, the logo stays perfectly separated and incredibly solid even when placed directly against white or pure black backgrounds. High contrast solidifies the geometric profile.
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

          </Grid>

          {/* Solid Footing */}
          <Box sx={{ textAlign: 'center', py: 4, opacity: 0.4, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', borderTop: '2px solid #FFFFFF' }}>
            OPENBRICKS 2.0 • STARK HIGH CONTRAST STUDY • VER 2.0
          </Box>

        </Stack>
      </Container>
    </Box>
  );
}

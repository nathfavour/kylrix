'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Paper, Divider, Stack } from '@mui/material';
import Logo from '@/components/Logo';

export default function LogoPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff', py: 8 }}>
      <Container maxWidth="lg">
        <Stack spacing={8}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontFamily: '"Clash Display", sans-serif' }}>
              KYLRIX IDENTITY
            </Typography>
            <Typography sx={{ opacity: 0.6, fontSize: '1.2rem' }}>
              The visual core of an autonomous ecosystem.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 4, opacity: 0.8, letterSpacing: '0.1em' }}>
              FULL BRANDING
            </Typography>
            <Paper sx={{ 
              p: 6, 
              bgcolor: 'rgba(255,255,255,0.03)', 
              borderRadius: 4, 
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center'
            }}>
              <Logo size={40} />
              <Logo size={60} />
              <Logo size={80} />
              <Logo size={120} />
            </Paper>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 4, opacity: 0.8, letterSpacing: '0.1em' }}>
              ICON VARIANTS
            </Typography>
            <Paper sx={{ 
              p: 6, 
              bgcolor: 'rgba(255,255,255,0.03)', 
              borderRadius: 4, 
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center'
            }}>
              <Logo size={40} variant="icon" />
              <Logo size={60} variant="icon" />
              <Logo size={80} variant="icon" />
              <Logo size={160} variant="icon" />
            </Paper>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 4, opacity: 0.8, letterSpacing: '0.1em' }}>
              COLOR SYSTEM
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <Logo size={60} color="#00F5FF" variant="icon" sx={{ mb: 2, mx: 'auto', justifyContent: 'center' }} />
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>NEON CYAN (#00F5FF)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <Logo size={60} color="#FF00F5" variant="icon" sx={{ mb: 2, mx: 'auto', justifyContent: 'center' }} />
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>MAGENTA (#FF00F5)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <Logo size={60} color="#00FF94" variant="icon" sx={{ mb: 2, mx: 'auto', justifyContent: 'center' }} />
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>LIME (#00FF94)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <Logo size={60} color="#FFFFFF" variant="icon" sx={{ mb: 2, mx: 'auto', justifyContent: 'center' }} />
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>WHITE (#FFFFFF)</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          <Grid container spacing={8}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>The Spine & Node</Typography>
              <Typography sx={{ opacity: 0.7, lineHeight: 1.8 }}>
                Kylrix's "K" is not just a letter, but a schematic. The vertical spine represents the stable 
                infrastructure of the Vault. The angled branches are the convergent flows of intelligence, 
                connecting at nodes that represent user touchpoints.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Scalability</Typography>
              <Typography sx={{ opacity: 0.7, lineHeight: 1.8 }}>
                Designed to be legible at 16px and majestic at 1600px. The stroke weights and node radii 
                are mathematically linked to the canvas size, ensuring the "intelligent" feel is never 
                lost in translation.
              </Typography>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

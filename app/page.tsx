'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Grid2 as Grid, 
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Globe, 
  ChevronRight, 
  Download,
  LayoutDashboard,
  MessageSquare,
  Lock,
  StickyNote,
  Terminal
} from 'lucide-react';
import Link from 'next/link';

// Mock Component to simulate live app behavior
const LiveAppWidget = ({ name, icon: Icon, color }: any) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <Paper 
      sx={{ 
        p: 3, 
        height: '100%',
        background: alpha('#0A0A0A', 0.4),
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.4s ease',
        '&:hover': {
          background: alpha(color, 0.05),
          borderColor: alpha(color, 0.4),
          boxShadow: `0 20px 40px ${alpha(color, 0.1)}`,
        }
      }}
    >
      <Stack spacing={2}>
        <Box 
          sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: '12px', 
            background: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}
        >
          <Icon size={24} />
        </Box>
        <Box>
          <Typography variant="h4" gutterBottom>{name}</Typography>
          <Typography variant="body2">Experience the future of {name.toLowerCase()} with zero-knowledge security and AI-driven orchestration.</Typography>
        </Box>
        <Button 
          variant="outlined" 
          endIcon={<ChevronRight size={16} />}
          sx={{ 
            width: 'fit-content',
            borderColor: alpha(color, 0.2),
            '&:hover': { borderColor: color, color: color }
          }}
        >
          Explore
        </Button>
      </Stack>
    </Paper>
  </motion.div>
);

export default function LandingPage() {
  const theme = useTheme();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <Box component="main">
      {/* Navigation */}
      <Box 
        component="nav" 
        sx={{ 
          position: 'fixed', 
          top: 0, 
          width: '100%', 
          zIndex: 1000,
          p: 3,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="h4" 
              sx={{ 
                letterSpacing: '-0.05em', 
                fontWeight: 900,
                background: 'linear-gradient(90deg, #F2F2F2 0%, #00F5FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              KYLRIX
            </Typography>
            <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {['Products', 'Docs', 'Developers', 'Downloads'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'rgba(255,255,255,0.6)',
                      '&:hover': { color: '#00F5FF' },
                      transition: 'color 0.2s'
                    }}
                  >
                    {item}
                  </Typography>
                </Link>
              ))}
            </Stack>
            <Button variant="contained">Get Started</Button>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 25, pb: 20 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                px: 2, 
                py: 1, 
                borderRadius: '50px', 
                border: '1px solid rgba(0, 245, 255, 0.3)',
                background: 'rgba(0, 245, 255, 0.05)',
                mb: 3,
                display: 'inline-block'
              }}
            >
              AI-POWERED ORCHESTRATION IS HERE
            </Typography>
          </motion.div>
          
          <Typography variant="h1">
            Redefining the <Box component="span" sx={{ color: '#00F5FF' }}>Ecosystem</Box> <br />
            of Intelligent Tools.
          </Typography>
          
          <Typography variant="subtitle1" sx={{ maxWidth: 700 }}>
            Kylrix is a unified suite of ultra-secure applications designed for the modern creator. 
            Experience zero-knowledge privacy and seamless AI intelligence across your entire workflow.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 4 }}>
            <Button size="large" variant="contained">Explore the Suite</Button>
            <Button size="large" variant="outlined" startIcon={<Download size={20} />}>Download Clients</Button>
          </Stack>
        </Stack>
      </Container>

      {/* Flagship Products Grid */}
      <Box sx={{ py: 15, background: 'rgba(5,5,5,0.5)' }}>
        <Container maxWidth="xl">
          <Stack spacing={1} mb={8} textAlign="center">
            <Typography variant="subtitle2">THE FLAGSHIPS</Typography>
            <Typography variant="h2">Engineered for Excellence.</Typography>
          </Stack>

          <Grid container spacing={4}>
            {[
              { name: 'Flow', icon: LayoutDashboard, color: '#00F5FF' },
              { name: 'Connect', icon: MessageSquare, color: '#A855F7' },
              { name: 'Vault', icon: Lock, color: '#F43F5E' },
              { name: 'Note', icon: StickyNote, color: '#F59E0B' },
              { name: 'CLI', icon: Terminal, color: '#10B981' },
              { name: 'Accounts', icon: ShieldCheck, color: '#6366F1' },
            ].map((app) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={app.name}>
                <LiveAppWidget {...app} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Tech Stack / Stats */}
      <Container maxWidth="lg" sx={{ py: 20 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h2" gutterBottom>Built for the <br />High-Speed Web.</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
              Leveraging Next.js, Material UI, and Appwrite to deliver a desktop-grade experience in the browser. 
              Our zero-knowledge architecture ensures that your data belongs exclusively to you.
            </Typography>
            <Stack spacing={3}>
              {[
                { icon: ShieldCheck, title: 'Zero-Knowledge Security', desc: 'AES-256-GCM encryption on the client-side.' },
                { icon: Zap, title: 'Instant Synchronization', desc: 'Real-time state updates across all your devices.' },
                { icon: Cpu, title: 'AI Orchestration', desc: 'Smart context-aware features that learn with you.' },
              ].map((feature, i) => (
                <Stack key={i} direction="row" spacing={3} alignItems="flex-start">
                  <Box sx={{ p: 1, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#00F5FF' }}>
                    <feature.icon size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontSize: '1.1rem', mb: 0.5 }}>{feature.title}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>{feature.desc}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
             <motion.div style={{ y: y1 }}>
                <Paper 
                  sx={{ 
                    p: 1, 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <Box 
                    sx={{ 
                      aspectRatio: '16/10', 
                      background: '#000', 
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <Typography 
                      variant="h1" 
                      sx={{ 
                        fontSize: '8rem', 
                        opacity: 0.05, 
                        position: 'absolute',
                        fontWeight: 900
                      }}
                    >
                      K
                    </Typography>
                    <Stack spacing={2} sx={{ width: '80%', zIndex: 1 }}>
                       <Box sx={{ height: 12, width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: 6 }} />
                       <Box sx={{ height: 12, width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }} />
                       <Box sx={{ height: 12, width: '90%', background: 'rgba(255,255,255,0.1)', borderRadius: 6 }} />
                       <Box sx={{ height: 80, width: '100%', background: 'rgba(0, 245, 255, 0.1)', borderRadius: 3, mt: 4, border: '1px solid rgba(0, 245, 255, 0.2)' }} />
                    </Stack>
                  </Box>
                </Paper>
             </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg">
           <Grid container spacing={8}>
              <Grid size={{ xs: 12, md: 4 }}>
                 <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>KYLRIX</Typography>
                 <Typography variant="body2" sx={{ opacity: 0.5 }}>The future of AI-powered secure productivity. Built with precision for the modern web.</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                 <Grid container spacing={4}>
                    {['Product', 'Resources', 'Legal', 'Social'].map((cat) => (
                      <Grid size={{ xs: 6, sm: 3 }} key={cat}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#fff' }}>{cat}</Typography>
                        <Stack spacing={1}>
                          <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#00F5FF' } }}>Link One</Typography>
                          <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#00F5FF' } }}>Link Two</Typography>
                          <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#00F5FF' } }}>Link Three</Typography>
                        </Stack>
                      </Grid>
                    ))}
                 </Grid>
              </Grid>
           </Grid>
           <Typography variant="caption" sx={{ display: 'block', mt: 10, opacity: 0.3, textAlign: 'center' }}>
             © 2026 Kylrix Ecosystem. All rights reserved.
           </Typography>
        </Container>
      </Box>
    </Box>
  );
}

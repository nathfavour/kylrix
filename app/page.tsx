'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Grid, 
  alpha,
  Divider,
  AppBar,
  Toolbar
} from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight,
  LayoutDashboard,
  MessageSquare,
  Lock,
  StickyNote,
  Terminal,
  Layers,
  Fingerprint,
  Cpu
} from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <AppBar position="fixed" sx={{ bgcolor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(30px)', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: { xs: 80, md: 100 }, justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.05em', color: '#fff' }}>KYLRIX</Typography>
          </Link>
          
          <Stack direction="row" spacing={6} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {['Products', 'Developers', 'Docs', 'Downloads'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700, 
                    opacity: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'all 0.3s',
                    '&:hover': { opacity: 1, color: '#00F5FF' }
                  }}
                >
                  {item}
                </Typography>
              </Link>
            ))}
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" sx={{ borderRadius: 100, px: 4 }}>
              Launch Console
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const ProductCard = ({ app }: any) => (
  <motion.div whileHover={{ y: -12 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
    <Box 
      sx={{ 
        p: { xs: 5, md: 6 }, 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        gap: 4,
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        transition: 'all 0.4s',
        '&:hover': { borderColor: 'rgba(0, 245, 255, 0.3)', background: 'rgba(15, 15, 15, 0.9)' }
      }}
    >
      <Box sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: 'rgba(0, 245, 255, 0.05)', border: '1px solid rgba(0, 245, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F5FF' }}>
        <app.icon size={32} strokeWidth={1.5} />
      </Box>
      
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>{app.name}</Typography>
        <Typography variant="body1" sx={{ opacity: 0.5, lineHeight: 1.8 }}>{app.desc}</Typography>
      </Box>

      <Box sx={{ mt: 'auto', pt: 4 }}>
         <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00F5FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
           Explore {app.name} <ChevronRight size={14} />
         </Typography>
      </Box>
    </Box>
  </motion.div>
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const apps = [
    { name: 'Flow', icon: LayoutDashboard, desc: 'Advanced AI orchestration for high-fidelity task management and event-driven workflows.' },
    { name: 'Vault', icon: Lock, desc: 'Zero-knowledge security for your most sensitive assets, credentials, and cryptographic keys.' },
    { name: 'Connect', icon: MessageSquare, desc: 'Encrypted peer-to-peer communication layer with integrated AI assistance.' },
    { name: 'CLI', icon: Terminal, desc: 'A powerful, native terminal client for developers to interface with the Kylrix ecosystem.' },
    { name: 'Note', icon: StickyNote, desc: 'Privacy-first intelligent note-taking and knowledge synthesis powered by local AI.' },
    { name: 'Accounts', icon: ShieldCheck, desc: 'Unified identity management using WebAuthn for passwordless, secure authentication.' },
  ];

  return (
    <Box component="main" sx={{ pt: 12 }}>
      <Navbar />
      <div className="bg-mesh" />
      
      {/* Hero Section */}
      <Container maxWidth="xl">
        <motion.div style={{ opacity }}>
          <Stack spacing={8} alignItems="center" textAlign="center" sx={{ pt: { xs: 15, md: 25 }, pb: { xs: 15, md: 30 } }}>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 6,
                  color: '#00F5FF',
                  letterSpacing: '0.4em',
                  fontWeight: 900,
                  textTransform: 'uppercase'
                }}
              >
                The Future of Secure Productivity
              </Typography>
              <Typography variant="h1" sx={{ mb: 6, fontWeight: 900 }}>
                The Architecture <br /> 
                of <Box component="span" sx={{ color: '#00F5FF' }}>Intelligence.</Box>
              </Typography>
              <Typography variant="subtitle1" sx={{ maxWidth: 850, mx: 'auto', opacity: 0.6, fontSize: '1.4rem' }}>
                A premium ecosystem of secure, AI-driven applications engineered 
                for absolute performance, privacy, and precision.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
              <Button size="large" variant="contained" color="primary" sx={{ px: 6, py: 2.5, fontSize: '1.1rem' }}>
                Get Started Free
              </Button>
              <Button size="large" variant="outlined" sx={{ px: 6, py: 2.5, fontSize: '1.1rem' }}>
                System Documentation
              </Button>
            </Stack>
          </Stack>
        </motion.div>
      </Container>

      {/* Flagships Grid */}
      <Box sx={{ py: { xs: 20, md: 30 }, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.01)' }}>
        <Container maxWidth="xl">
          <Stack spacing={4} mb={15} textAlign="center">
            <Typography variant="subtitle2" sx={{ color: '#00F5FF' }}>THE ECOSYSTEM</Typography>
            <Typography variant="h2">Engineered without compromise.</Typography>
          </Stack>

          <Grid container spacing={4}>
            {apps.map((app) => (
              <Grid size={{ xs: 12, md: 4 }} key={app.name}>
                <ProductCard app={app} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Infrastructure Section */}
      <Box sx={{ py: { xs: 20, md: 30 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={15} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={10}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 4, color: '#00F5FF' }}>CORE INFRASTRUCTURE</Typography>
                  <Typography variant="h2" sx={{ mb: 4 }}>Private. Local. <br />Professional.</Typography>
                  <Typography variant="body1" sx={{ opacity: 0.5, maxWidth: 600, fontSize: '1.25rem' }}>
                    Every Kylrix app is powered by a high-performance infrastructure layer built for zero-knowledge privacy and lightning-fast edge execution.
                  </Typography>
                </Box>
                
                <Stack spacing={8}>
                  {[
                    { icon: Fingerprint, title: 'Zero-Knowledge Privacy', desc: 'Your data is encrypted locally before it ever touches the network.' },
                    { icon: Layers, title: 'Modular Systems', desc: 'Plug-and-play components that scale with your digital workflow.' },
                    { icon: Cpu, title: 'Edge Intelligence', desc: 'Optimized local AI processing for minimum latency and maximum security.' }
                  ].map((f, i) => (
                    <Stack key={i} direction="row" spacing={5}>
                      <Box sx={{ color: '#00F5FF', pt: 1 }}>
                        <f.icon size={36} strokeWidth={1.5} />
                      </Box>
                      <Box>
                        <Typography variant="h3" sx={{ mb: 2, fontSize: '2rem' }}>{f.title}</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.4 }}>{f.desc}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Box 
                sx={{ 
                  p: { xs: 6, md: 10 }, 
                  minHeight: 650, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  bgcolor: 'rgba(5,5,5,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Stack spacing={8}>
                  <Terminal size={80} strokeWidth={0.5} sx={{ opacity: 0.1, color: '#00F5FF' }} />
                  <Typography variant="h2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 400, opacity: 0.9 }}>
                    <Box component="span" sx={{ color: '#00F5FF' }}>$</Box> kylrix auth <br />
                    <Box component="span" sx={{ opacity: 0.3 }}>
                      &gt; Initializing handshake...<br />
                      &gt; Secure Tunnel Established.<br />
                      &gt; P2P Sync Active.
                    </Box>
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Link href="/developers">
                    <Button size="large" variant="outlined" endIcon={<ArrowRight size={24} />} sx={{ px: 5, py: 2 }}>
                      Developer Console
                    </Button>
                  </Link>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 15, borderTop: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(5,5,5,0.8)' }}>
        <Container maxWidth="xl">
          <Grid container spacing={10}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 900 }}>KYLRIX</Typography>
              <Typography variant="body1" sx={{ opacity: 0.4, maxWidth: 400 }}>
                The future of AI-powered secure productivity. Precision engineered for the modern era of privacy and intelligence.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={10} justifyContent="flex-end">
                {[
                  { title: 'Resources', links: ['Documentation', 'Developers', 'Downloads', 'Status'] },
                  { title: 'Ecosystem', links: ['Vault', 'Flow', 'Connect', 'Note'] },
                  { title: 'Company', links: ['About', 'Privacy', 'Terms', 'Contact'] }
                ].map((col) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={col.title}>
                    <Typography variant="subtitle2" sx={{ mb: 5, color: '#fff', opacity: 0.3, letterSpacing: '0.2em' }}>{col.title}</Typography>
                    <Stack spacing={2.5}>
                      {col.links.map(link => (
                        <Link key={link} href={`/${link.toLowerCase()}`}>
                          <Typography variant="body2" sx={{ fontWeight: 500, opacity: 0.5, '&:hover': { opacity: 1, color: '#00F5FF' } }}>{link}</Typography>
                        </Link>
                      ))}
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ mt: 15, pt: 10, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.2 }}>
              © 2026 Kylrix Organization. Built with absolute precision.
            </Typography>
            <Stack direction="row" spacing={4}>
              {['Twitter', 'GitHub', 'Discord'].map(social => (
                <Typography key={social} variant="caption" sx={{ opacity: 0.2, '&:hover': { opacity: 1, color: '#00F5FF' }, cursor: 'pointer' }}>
                  {social}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

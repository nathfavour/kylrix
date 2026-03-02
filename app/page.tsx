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
  IconButton
} from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Cpu, 
  ChevronRight, 
  ArrowRight,
  LayoutDashboard,
  MessageSquare,
  Lock,
  StickyNote,
  Terminal,
  Activity,
  Layers,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: 80 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>KYLRIX</Typography>
          
          <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {['Products', 'Developers', 'Docs', 'Downloads'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500, 
                    opacity: 0.6,
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s'
                  }}
                >
                  {item}
                </Typography>
              </Link>
            ))}
          </Stack>

          <Button variant="outlined" size="small" sx={{ borderRadius: 8 }}>Launch Console</Button>
        </Stack>
      </Container>
    </Box>
  );
};

const ProductCard = ({ app }: any) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Box 
        className="glass-card"
        sx={{ 
          p: 4, 
          height: '100%',
          display: 'flex', 
          flexDirection: 'column',
          gap: 3,
          transition: 'border-color 0.3s',
          '&:hover': { borderColor: 'rgba(255,255,255,0.2) !important' }
        }}
      >
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <app.icon size={24} strokeWidth={1.5} />
        </Box>
        
        <Box>
          <Typography variant="h4" sx={{ mb: 1.5 }}>{app.name}</Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6, opacity: 0.5 }}>{app.desc}</Typography>
        </Box>

        <Box sx={{ mt: 'auto', pt: 2 }}>
           <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
             Explore <ChevronRight size={14} />
           </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const apps = [
    { name: 'Flow', icon: LayoutDashboard, desc: 'Advanced AI orchestration for high-fidelity task management and event-driven workflows.' },
    { name: 'Vault', icon: Lock, desc: 'Zero-knowledge security for your most sensitive assets, credentials, and cryptographic keys.' },
    { name: 'Connect', icon: MessageSquare, desc: 'Encrypted peer-to-peer communication layer with integrated AI assistance.' },
    { name: 'CLI', icon: Terminal, desc: 'A powerful, native terminal client for developers to interface with the Kylrix ecosystem.' },
    { name: 'Note', icon: StickyNote, desc: 'Privacy-first intelligent note-taking and knowledge synthesis powered by local AI.' },
    { name: 'Accounts', icon: ShieldCheck, desc: 'Unified identity management using WebAuthn for passwordless, secure authentication.' },
  ];

  return (
    <Box component="main">
      <Navbar />
      <div className="light-leak" style={{ top: '10%', left: '-10%' }} />
      <div className="light-leak" style={{ bottom: '10%', right: '-10%', animationDelay: '-5s' }} />

      {/* Hero Section */}
      <Container maxWidth="lg">
        <motion.div style={{ opacity }}>
          <Stack spacing={4} alignItems="center" textAlign="center" sx={{ pt: 30, pb: 20 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 4,
                  opacity: 0.5,
                  letterSpacing: '0.3em'
                }}
              >
                EST. 2026 — KYLRIX ORGANIZATION
              </Typography>
            </motion.div>
            
            <Typography variant="h1" className="text-gradient">
              The Architecture <br />
              of Intelligence.
            </Typography>
            
            <Typography variant="subtitle1" sx={{ maxWidth: 650, mb: 4 }}>
              A premium ecosystem of secure, AI-driven applications engineered 
              for precision, privacy, and absolute performance.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 4 }}>
              <Button size="large" variant="contained">Get Started</Button>
              <Button size="large" variant="outlined">Documentation</Button>
            </Stack>
          </Stack>
        </motion.div>
      </Container>

      {/* Product Grid */}
      <Box sx={{ py: 20, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.01)' }}>
        <Container maxWidth="lg">
          <Stack spacing={2} mb={10} textAlign="left">
            <Typography variant="subtitle2">The Ecosystem</Typography>
            <Typography variant="h2" sx={{ maxWidth: 800 }}>Precision-engineered software for the modern era.</Typography>
          </Stack>

          <Grid container spacing={3}>
            {apps.map((app) => (
              <Grid size={{ xs: 12, md: 4 }} key={app.name}>
                <ProductCard app={app} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Deep Tech / Infrastructure */}
      <Box sx={{ py: 20 }}>
        <Container maxWidth="lg">
          <Grid container spacing={10} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>Core Infrastructure</Typography>
                  <Typography variant="h2" sx={{ mb: 3 }}>Secure by Design.</Typography>
                  <Typography variant="body1" sx={{ opacity: 0.5, maxWidth: 500 }}>
                    Our foundation is built on absolute privacy. Every byte is encrypted, every interaction is verified, and no data ever leaves your control without your explicit consent.
                  </Typography>
                </Box>
                
                <Stack spacing={4}>
                  {[
                    { icon: Fingerprint, title: 'Zero-Knowledge Privacy', desc: 'End-to-end encryption ensures your data remains yours alone.' },
                    { icon: Layers, title: 'Modular Systems', desc: 'A deeply integrated suite that works together seamlessly.' },
                    { icon: Cpu, title: 'Edge Performance', desc: 'Optimized for local processing to minimize latency.' }
                  ].map((f, i) => (
                    <Stack key={i} direction="row" spacing={3}>
                      <Box sx={{ color: 'primary.main', pt: 0.5 }}>
                        <f.icon size={20} strokeWidth={1.5} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ mb: 1, fontSize: '1.2rem' }}>{f.title}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.4 }}>{f.desc}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Box 
                className="glass-card" 
                sx={{ 
                  p: 6, 
                  aspectRatio: '1/1', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Stack spacing={4}>
                  <Terminal size={48} strokeWidth={1} sx={{ opacity: 0.2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: '1.5rem', opacity: 0.8 }}>
                    $ kylrix auth --secure<br />
                    <Box component="span" sx={{ opacity: 0.4 }}>
                      &gt; Initializing handshake...<br />
                      &gt; P2P tunnel established.<br />
                      &gt; Ready for secure orchestration.
                    </Box>
                  </Typography>
                  <Link href="/developers">
                    <Button variant="outlined" endIcon={<ArrowRight size={16} />}>Developer Console</Button>
                  </Link>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={4}>
            <Box>
              <Typography variant="h4" sx={{ mb: 2 }}>KYLRIX</Typography>
              <Typography variant="body2" sx={{ opacity: 0.4 }}>The future of AI-powered secure productivity.</Typography>
            </Box>
            
            <Stack direction="row" spacing={8}>
              <Stack spacing={2}>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.3, textTransform: 'uppercase' }}>Resources</Typography>
                <Link href="/docs"><Typography variant="body2" sx={{ opacity: 0.5 }}>Documentation</Typography></Link>
                <Link href="/developers"><Typography variant="body2" sx={{ opacity: 0.5 }}>Developers</Typography></Link>
                <Link href="/downloads"><Typography variant="body2" sx={{ opacity: 0.5 }}>Downloads</Typography></Link>
              </Stack>
              <Stack spacing={2}>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.3, textTransform: 'uppercase' }}>Legal</Typography>
                <Link href="/terms"><Typography variant="body2" sx={{ opacity: 0.5 }}>Terms</Typography></Link>
                <Link href="/privacy"><Typography variant="body2" sx={{ opacity: 0.5 }}>Privacy</Typography></Link>
              </Stack>
            </Stack>
          </Stack>
          <Typography variant="caption" sx={{ mt: 10, display: 'block', opacity: 0.2 }}>
            © 2026 Kylrix Organization. Built with precision.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Grid, 
  Paper,
  alpha,
  useTheme,
  Avatar,
  IconButton,
  Chip
} from '@mui/material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Menu,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';

// Dynamic Island Navigation
const DynamicIslandNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <Box sx={{ position: 'fixed', top: 32, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
      <motion.div
        animate={{ 
          width: scrolled ? 'fit-content' : '100%',
          maxWidth: scrolled ? '600px' : '1200px',
          borderRadius: scrolled ? 40 : 16,
          padding: scrolled ? '12px 24px' : '16px 32px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: scrolled ? '32px' : '12px'
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontSize: scrolled ? '1.2rem' : '1.8rem',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            color: '#fff'
          }}
        >
          KYLRIX
        </Typography>

        <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {['Products', 'Docs', 'Downloads'].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  opacity: 0.6,
                  '&:hover': { opacity: 1, color: '#00F5FF' },
                  transition: 'all 0.2s'
                }}
              >
                {item}
              </Typography>
            </Link>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            <Activity size={18} />
          </IconButton>
          <Button 
            size={scrolled ? "small" : "medium"} 
            variant="contained" 
            sx={{ borderRadius: 10 }}
          >
            Launch
          </Button>
        </Stack>
      </motion.div>
    </Box>
  );
};

// High-Fidelity App UI Widget
const LivingWidget = ({ app }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Paper 
        className="glass-card"
        sx={{ 
          p: 1, 
          height: 480, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'border 0.4s',
          '&:hover': { borderColor: alpha(app.color, 0.4) }
        }}
      >
        {/* App Title Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: alpha(app.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: app.color }}>
              <app.icon size={18} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>Kylrix {app.name}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
             <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
             <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
          </Stack>
        </Box>

        {/* Dynamic App Content Sim */}
        <Box sx={{ p: 3, flex: 1, position: 'relative' }}>
          {app.name === 'Flow' && (
            <Stack spacing={2}>
              {[1, 2, 3].map(i => (
                <motion.div key={i} whileHover={{ x: 10 }} style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Box sx={{ height: 10, width: 100, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 5 }} />
                    <Chip size="small" label="High" sx={{ height: 16, fontSize: '0.6rem', color: app.color, bgcolor: alpha(app.color, 0.1) }} />
                  </Stack>
                </motion.div>
              ))}
              <Box sx={{ mt: 4, p: 2, borderRadius: 3, bgcolor: alpha(app.color, 0.05), border: `1px dashed ${alpha(app.color, 0.2)}` }}>
                <Typography variant="caption" sx={{ color: app.color }}>AI Orchestration Active...</Typography>
              </Box>
            </Stack>
          )}

          {app.name === 'Vault' && (
             <Stack spacing={3} alignItems="center" sx={{ pt: 4 }}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }}>
                  <Fingerprint size={80} color={app.color} opacity={0.3} />
                </motion.div>
                <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.3em' }}>AES-256-GCM</Typography>
                <Box sx={{ width: '100%', height: 40, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }} />
             </Stack>
          )}

          {app.name === 'CLI' && (
             <Box sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#00F5FF', p: 1 }}>
                <div style={{ opacity: 0.5 }}>$ kylrix connect --shared-id=XYZ</div>
                <div style={{ color: '#fff' }}>Establishing P2P link...</div>
                <div>[OK] Handshake complete</div>
                <div>[OK] Encryption active</div>
                <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ display: 'inline-block', width: 6, height: 12, background: '#00F5FF' }} />
             </Box>
          )}

          <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <Typography variant="h4" sx={{ mb: 1 }}>{app.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.5, fontSize: '0.8rem' }}>{app.desc}</Typography>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default function LandingPage() {
  const theme = useTheme();
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const apps = [
    { name: 'Flow', icon: LayoutDashboard, color: '#00F5FF', desc: 'Context-driven orchestration for tasks and events.' },
    { name: 'Vault', icon: Lock, color: '#F43F5E', desc: 'Zero-knowledge management for keys and passwords.' },
    { name: 'Connect', icon: MessageSquare, color: '#A855F7', desc: 'Secure P2P communication with AI support.' },
    { name: 'CLI', icon: Terminal, color: '#10B981', desc: 'Native terminal client for the Kylrix ecosystem.' },
    { name: 'Note', icon: StickyNote, color: '#F59E0B', desc: 'Privacy-focused AI note-taking & intelligence.' },
    { name: 'Accounts', icon: ShieldCheck, color: '#6366F1', desc: 'Unified identity and WebAuthn management.' },
  ];

  return (
    <Box component="main">
      <DynamicIslandNav />
      <div className="light-leak" style={{ top: '-10%', left: '-10%' }} />
      <div className="light-leak" style={{ bottom: '-10%', right: '-10%', animationDelay: '-5s' }} />

      {/* Hero Section */}
      <Container maxWidth="lg">
        <motion.div style={{ scale, opacity }}>
          <Stack spacing={4} alignItems="center" textAlign="center" sx={{ pt: 35, pb: 25 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography 
                variant="subtitle2" 
                className="glass-card"
                sx={{ 
                  px: 3, 
                  py: 1, 
                  borderRadius: 10,
                  mb: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  letterSpacing: '0.15em',
                  color: '#fff'
                }}
              >
                <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00F5FF' }} />
                NEXT-GEN AI ORCHESTRATION
              </Typography>
            </motion.div>
            
            <Typography variant="h1" className="text-gradient">
              The Architecture of <br />
              <Box component="span" className="accent-gradient">Digital Intelligence.</Box>
            </Typography>
            
            <Typography variant="subtitle1" sx={{ maxWidth: 700, opacity: 0.7 }}>
              A premium suite of secure, AI-driven applications engineered for those 
              who demand absolute privacy and maximum productivity.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 6 }}>
              <Button size="large" variant="contained" endIcon={<ArrowRight size={20} />} sx={{ px: 5, py: 2 }}>Get Started Free</Button>
              <Button size="large" variant="outlined" sx={{ px: 5, py: 2 }}>Ecosystem Docs</Button>
            </Stack>
          </Stack>
        </motion.div>
      </Container>

      {/* Product Showcase */}
      <Box sx={{ py: 20, position: 'relative' }}>
        <Container maxWidth="xl">
          <Stack spacing={1} mb={12} textAlign="center">
            <Typography variant="subtitle2" className="accent-gradient">THE FLAGSHIPS</Typography>
            <Typography variant="h2" className="text-gradient">Engineered for absolute performance.</Typography>
          </Stack>

          <Grid container spacing={4}>
            {apps.map((app) => (
              <Grid size={{ xs: 12, md: 4 }} key={app.name}>
                <LivingWidget app={app} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Deep Tech Section */}
      <Box sx={{ py: 20, background: 'linear-gradient(180deg, transparent 0%, rgba(0, 245, 255, 0.03) 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={12} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
               <Stack spacing={4}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#00F5FF', mb: 1 }}>INFRASTRUCTURE</Typography>
                    <Typography variant="h2" className="text-gradient">Ultra-Standard Backend.</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.6 }}>
                    Every Kylrix app is powered by our high-performance infrastructure layer. 
                    From real-time synchronization with Appwrite to client-side encryption, 
                    we leave no room for compromise.
                  </Typography>
                  
                  <Stack spacing={3}>
                    {[
                      { icon: Fingerprint, title: 'Zero-Knowledge Privacy', desc: 'Your data is encrypted before it ever leaves your device.' },
                      { icon: Layers, title: 'Modular Architecture', desc: 'Plug-and-play components across the entire ecosystem.' },
                      { icon: Cpu, title: 'Edge Intelligence', desc: 'Local AI processing for lightning-fast responsiveness.' }
                    ].map((f, i) => (
                      <motion.div key={i} whileHover={{ x: 10 }}>
                        <Stack direction="row" spacing={3}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#00F5FF' }}>
                            <f.icon size={24} />
                          </Box>
                          <Box>
                            <Typography variant="h4" sx={{ fontSize: '1.2rem', mb: 0.5 }}>{f.title}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.5 }}>{f.desc}</Typography>
                          </Box>
                        </Stack>
                      </motion.div>
                    ))}
                  </Stack>
               </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
               <motion.div
                 initial={{ rotateY: 20, rotateX: 10 }}
                 whileInView={{ rotateY: 0, rotateX: 0 }}
                 transition={{ duration: 1 }}
               >
                  <Paper className="glass-card" sx={{ p: 4, height: 500, display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid rgba(0, 245, 255, 0.2)' }}>
                     <Stack spacing={4}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                           <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                           <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                           <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
                        </Box>
                        <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)' }}>
                           <Typography variant="caption" sx={{ color: '#00F5FF', display: 'block', mb: 1 }}>// ecosystem.config.ts</Typography>
                           <Typography variant="caption" sx={{ color: '#F2F2F2', display: 'block' }}>
                             export const KYLRIX_STREAMS = &#123;<br />
                             &nbsp;&nbsp;encryption: &quot;AES-256-GCM&quot;,<br />
                             &nbsp;&nbsp;orchestration: &quot;KylrixFlow-v2&quot;,<br />
                             &nbsp;&nbsp;auth: &quot;WebAuthn&quot;,<br />
                             &nbsp;&nbsp;latency: &quot;&lt; 20ms&quot;<br />
                             &#125;;
                           </Typography>
                        </Box>
                        <Stack direction="row" spacing={2}>
                           <Avatar sx={{ bgcolor: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)' }}>AI</Avatar>
                           <Box sx={{ flex: 1, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '0 16px 16px 16px' }}>
                              <Typography variant="caption" sx={{ opacity: 0.6 }}>The architecture is optimized for real-time secure streams.</Typography>
                           </Box>
                        </Stack>
                     </Stack>
                  </Paper>
               </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 15, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
         <Container maxWidth="lg">
            <Stack spacing={8}>
               <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={4}>
                  <Box sx={{ maxWidth: 300 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>KYLRIX</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.4 }}>The future of AI-powered secure productivity. Engineered for precision.</Typography>
                  </Box>
                  <Grid container spacing={8}>
                    {['Product', 'Company', 'Social'].map(cat => (
                      <Grid size={{ xs: 6, sm: 4 }} key={cat}>
                        <Typography variant="subtitle2" sx={{ mb: 3, color: '#fff' }}>{cat}</Typography>
                        <Stack spacing={1.5}>
                          {['Feature One', 'Feature Two', 'Feature Three'].map(link => (
                            <Typography key={link} variant="caption" sx={{ opacity: 0.5, '&:hover': { color: '#00F5FF', opacity: 1 }, cursor: 'pointer' }}>{link}</Typography>
                          ))}
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
               </Stack>
               <Typography variant="caption" sx={{ opacity: 0.2, textAlign: 'center' }}>© 2026 Kylrix Organization. All rights reserved.</Typography>
            </Stack>
         </Container>
      </Box>
    </Box>
  );
}

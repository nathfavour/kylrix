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
  Paper,
  Divider
} from '@mui/material';
import { 
  Code2, 
  Key, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  Terminal,
  Cpu,
  Layers,
  Fingerprint,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: 80 }}>
          <Link href="/">
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>KYLRIX</Typography>
          </Link>
          
          <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
             <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9 }}>Developers</Typography>
             <Link href="/docs"><Typography variant="body2" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>Documentation</Typography></Link>
             <Link href="/api"><Typography variant="body2" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>API Reference</Typography></Link>
          </Stack>

          <Button variant="contained" size="small" sx={{ borderRadius: 8 }}>Console</Button>
        </Stack>
      </Container>
    </Box>
  );
};

const DevSection = ({ icon: Icon, title, description, children }: any) => (
  <Box sx={{ py: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <Grid container spacing={8}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={3}>
          <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
            <Icon size={28} strokeWidth={1.5} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ mb: 2 }}>{title}</Typography>
            <Typography variant="body1" sx={{ opacity: 0.5, lineHeight: 1.6 }}>{description}</Typography>
          </Box>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {children}
      </Grid>
    </Grid>
  </Box>
);

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => (
  <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', overflowX: 'auto' }}>
    <Typography variant="caption" sx={{ opacity: 0.3, display: 'block', mb: 2, textTransform: 'uppercase' }}>{language}</Typography>
    <pre style={{ margin: 0, color: '#f2f2f2' }}>
      <code>{code}</code>
    </pre>
  </Paper>
);

export default function DevelopersPage() {
  return (
    <Box component="main">
      <Navbar />
      <div className="bg-mesh" />
      
      {/* Hero */}
      <Box sx={{ pt: 15, pb: 10, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="subtitle2" sx={{ mb: 4, opacity: 0.5, letterSpacing: '0.3em' }}>DEVELOPER PORTAL</Typography>
          <Typography variant="h1" className="text-gradient" sx={{ mb: 4 }}>Build for the <br />Private Web.</Typography>
          <Typography variant="subtitle1" sx={{ mb: 6 }}>
            Kylrix provides the infrastructure to build secure, AI-powered applications 
            and extensions with zero-knowledge privacy at the core.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button size="large" variant="contained">Create Client ID</Button>
            <Button size="large" variant="outlined">Read Docs</Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Extensions */}
        <DevSection 
          icon={Code2}
          title="Extensions"
          description="Extend the Kylrix ecosystem with custom capabilities. Build tools that live directly within Flow, Vault, or Note."
        >
          <Stack spacing={4}>
            <Typography variant="body1">
              Extensions are modular bundles that can hook into Kylrix events, add new UI components, or provide custom AI tools.
            </Typography>
            <CodeBlock 
              language="typescript"
              code={`import { Extension } from '@kylrix/sdk';

export default new Extension({
  id: 'my-custom-tool',
  name: 'Intelligence Booster',
  onActivate: async (context) => {
    console.log('Kylrix Extension Active');
  }
});`}
            />
            <Button variant="outlined" sx={{ alignSelf: 'flex-start' }} endIcon={<ArrowRight size={16} />}>Extension Guide</Button>
          </Stack>
        </DevSection>

        {/* Client IDs & Auth */}
        <DevSection 
          icon={Fingerprint}
          title="OAuth & Client IDs"
          description="Register your third-party applications to interact with the Kylrix ecosystem securely."
        >
          <Stack spacing={4}>
            <Typography variant="body1">
              Manage your Client IDs and Secrets to authorize your applications for P2P communication and secure data access.
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 4, height: '100%', borderStyle: 'dashed' }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>Register Application</Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.5 }}>Generate unique credentials for your platform to interface with Kylrix APIs.</Typography>
                  <Button variant="contained" fullWidth>New Client ID</Button>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>Permissions</Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.5 }}>Configure granular Scopes for your application, from Read-Only to Full-Sync.</Typography>
                  <Stack spacing={1}>
                    {['identity:read', 'vault:write', 'flow:execute'].map(scope => (
                      <Box key={scope} sx={{ px: 2, py: 1, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)' }}>{scope}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </DevSection>

        {/* Sign in with Kylrix */}
        <DevSection 
          icon={ShieldCheck}
          title="Sign in with Kylrix"
          description="Leverage our WebAuthn-based identity system to provide passwordless, secure login for your users."
        >
          <Stack spacing={4}>
            <Typography variant="body1">
              Implement the most secure authentication method on the web. No passwords, just high-fidelity biometric or hardware security.
            </Typography>
            <Box 
              className="glass-card" 
              sx={{ 
                p: 4, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 3,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<Typography variant="h4" sx={{ color: 'inherit', fontWeight: 900 }}>K</Typography>}
                sx={{ 
                  bgcolor: '#fff', 
                  color: '#000', 
                  px: 4, 
                  py: 1.5,
                  '&:hover': { bgcolor: '#f2f2f2' } 
                }}
              >
                Sign in with Kylrix
              </Button>
              <Typography variant="caption" sx={{ opacity: 0.4 }}>Biometric / WebAuthn Secured</Typography>
            </Box>
            <CodeBlock 
              language="html"
              code={`<button data-kylrix-signin data-client-id="YOUR_CLIENT_ID">
  Sign in with Kylrix
</button>
<script src="https://auth.kylrix.space/sdk.js"></script>`}
            />
          </Stack>
        </DevSection>

        {/* CLI Tooling */}
        <DevSection 
          icon={Terminal}
          title="CLI Tooling"
          description="The professional way to manage your Kylrix environment and developer workflows."
        >
          <Stack spacing={4}>
            <Typography variant="body1">
              Install the Kylrix CLI to manage extensions, register clients, and test secure P2P connections from your terminal.
            </Typography>
            <CodeBlock 
              code={`$ npm install -g @kylrix/cli
$ kylrix login
$ kylrix extension init`}
            />
          </Stack>
        </DevSection>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 10, mt: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg">
          <Typography variant="caption" sx={{ opacity: 0.2 }}>
            © 2026 Kylrix Organization. Built with precision for developers.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '@/theme/ThemeProvider';
import { DataNexusProvider } from '@/context/DataNexusContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { ClientProviders } from './ClientProviders';

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

import GlobalShell from '@/components/GlobalShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://kylrix.space'),
  title: {
    default: 'Kylrix · The Sovereign Agentic OS',
    template: '%s · Kylrix',
  },
  description: 'The deeply interconnected, zero-knowledge workspace where people create and agents execute.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kylrix.space',
    siteName: 'Kylrix',
    images: [
      {
        url: '/logo_social.png',
        width: 1200,
        height: 630,
        alt: 'Kylrix Ecosystem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kylrix · The Sovereign Agentic OS',
    description: 'The deeply interconnected, zero-knowledge workspace.',
    images: ['/logo_social.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#6366F1',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={mono.variable}>
      <head>
        <link rel="preconnect" href="https://api.kylrix.space" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.kylrix.space" />

        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var match = document.cookie.match(new RegExp('(^| )kylrix_pulse_v2=([^;]+)'));
              if (match) {
                var d = JSON.parse(decodeURIComponent(match[2]));
                d.avatarBase64 = localStorage.getItem('kylrix_avatar_pulse_v2_' + d.$id);
                window.__KYLRIX_PULSE__ = d;
                document.documentElement.setAttribute('data-kylrix-pulse', 'true');
                var s = document.createElement('style');
                s.innerHTML = '[data-kylrix-pulse="true"] #navbar-connect-btn { display: none !important; }';
                document.head.appendChild(s);
              }
            } catch(e) {}
          })();
        `}} />
        
        <link 
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap" 
          rel="stylesheet" 
          crossOrigin="anonymous"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
          crossOrigin="anonymous"
        />
      </head>
      <body className={mono.className}>
        <ThemeRegistry>
          <DataNexusProvider>
            <LayoutProvider>
              <ClientProviders>
                <GlobalShell>
                  {children}
                </GlobalShell>
              </ClientProviders>
            </LayoutProvider>
          </DataNexusProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

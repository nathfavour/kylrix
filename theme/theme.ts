'use client';

import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

const getDesignTokens = (): ThemeOptions => ({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00F5FF', // Electric Teal
      contrastText: '#000000',
    },
    secondary: {
      main: '#F2F2F2', // Titanium
    },
    background: {
      default: '#000000', // The Void
      paper: '#0A0A0A',   // The Surface
    },
    text: {
      primary: '#F2F2F2',   // Titanium
      secondary: '#A1A1AA', // Gunmetal
      disabled: '#404040',  // Carbon
    },
    divider: 'rgba(255, 255, 255, 0.08)', // Subtle Border
  },
  typography: {
    fontFamily: 'var(--font-satoshi), "Satoshi", sans-serif',
    h1: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '4.5rem',
      fontWeight: 900,
      letterSpacing: '-0.05em',
      lineHeight: 1.1,
      color: '#F2F2F2',
    },
    h2: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '3.5rem',
      fontWeight: 900,
      letterSpacing: '-0.04em',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '2.5rem',
      fontWeight: 900,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '1.75rem',
      fontWeight: 800,
    },
    subtitle1: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.5,
      color: '#A1A1AA',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#00F5FF',
    },
    body1: {
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#A1A1AA',
    },
    button: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 20,
  },
  shadows: Array(25).fill('none') as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000000',
          color: '#F2F2F2',
          fontFamily: 'var(--font-satoshi), "Satoshi", sans-serif',
          scrollbarColor: '#222222 transparent',
          overflowX: 'hidden',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid #000000',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '14px',
          padding: '12px 28px',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textTransform: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        containedPrimary: {
          backgroundColor: '#00F5FF',
          color: '#000000',
          boxShadow: '0 0 0 rgba(0, 245, 255, 0)',
          '&:hover': {
            backgroundColor: '#00E5EE',
            boxShadow: '0 0 30px rgba(0, 245, 255, 0.4)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          color: '#F2F2F2',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.7)',
          backdropFilter: 'blur(30px) saturate(180%)',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
        },
      },
    },
  },
});

export const theme = createTheme(getDesignTokens());
export default theme;

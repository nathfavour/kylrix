'use client';

import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

const getDesignTokens = (): ThemeOptions => ({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F2F2F2', // Titanium
      contrastText: '#000000',
    },
    secondary: {
      main: '#A1A1AA', // Zinc/Steel
    },
    background: {
      default: '#000000', // Deep Black
      paper: '#0A0A0A',   // Surface
    },
    text: {
      primary: '#F2F2F2',   // Titanium
      secondary: '#A1A1AA', // Zinc
      disabled: '#404040',
    },
    divider: 'rgba(255, 255, 255, 0.05)',
  },
  typography: {
    fontFamily: 'var(--font-satoshi), "Satoshi", sans-serif',
    h1: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '5rem',
      fontWeight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 1.05,
      color: '#F2F2F2',
    },
    h2: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '3.75rem',
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    h3: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#A1A1AA',
    },
    subtitle2: {
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      color: '#F2F2F2',
      opacity: 0.6,
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
          borderRadius: '12px',
          padding: '12px 32px',
          fontSize: '0.9rem',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          textTransform: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          backgroundColor: '#F2F2F2',
          color: '#000000',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 40px rgba(255, 255, 255, 0.1)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          color: '#F2F2F2',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(12, 12, 12, 0.6)',
          backdropFilter: 'blur(40px) saturate(120%)',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
        },
      },
    },
  },
});

export const theme = createTheme(getDesignTokens());
export default theme;

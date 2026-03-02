import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LogoProps {
  sx?: any;
  size?: number;
  color?: string;
  variant?: 'full' | 'icon';
  component?: any;
  href?: string;
}

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const Logo: React.FC<LogoProps> = ({ 
  sx, 
  size = 40, 
  color = "#00F5FF", 
  variant = 'full',
  component,
  href
}) => {
  return (
    <LogoContainer 
      sx={sx} 
      component={component} 
      href={href}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#00A3FF" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* The "K" Stylized */}
        <path
          d="M30 20V80"
          stroke="url(#logo-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        <path
          d="M70 20L35 50L70 80"
          stroke="url(#logo-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Connection Points */}
        <circle cx="30" cy="20" r="5" fill="#fff" />
        <circle cx="30" cy="80" r="5" fill="#fff" />
        <circle cx="70" cy="20" r="5" fill="#fff" />
        <circle cx="70" cy="80" r="5" fill="#fff" />
        <circle cx="35" cy="50" r="5" fill="#fff" />
      </svg>
      
      {variant === 'full' && (
        <Typography 
          sx={{ 
            fontWeight: 900, 
            letterSpacing: '-0.04em', 
            color: '#fff',
            fontSize: { xs: `${size * 0.7}px`, md: `${size * 0.8}px` },
            textTransform: 'uppercase',
            fontFamily: '"Clash Display", sans-serif'
          }}
        >
          KYLRIX
        </Typography>
      )}
    </LogoContainer>
  );
};

export default Logo;

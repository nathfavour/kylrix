import { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Paper, 
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
  alpha
} from '@/lib/mui-tailwind/material';
import {
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  PushPin as PinIcon,
} from '@/lib/mui-tailwind/icons';
import type { Credentials } from '@/lib/appwrite/types';
import { Shield, ExternalLink } from 'lucide-react';

export default function CredentialItem({
  credential,
  onCopy,
  _isDesktop,
  onEdit,
  onDelete,
  onClick,
  onTogglePin,
  isBlurEnabled = false,
}: {
  credential: Credentials;
  onCopy: (value: string) => void;
  _isDesktop?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
  onTogglePin?: () => void;
  isBlurEnabled?: boolean;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copyAnchorEl, setCopyAnchorEl] = useState<null | HTMLElement>(null);

  const handleCopy = (value: string) => {
    onCopy(value);
    setCopyAnchorEl(null);
  };

  const getFaviconUrl = (url: string | null | undefined) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(credential.url);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        px: 2.25,
        py: 1.75,
        mb: 1.5,
        borderRadius: '24px',
        bgcolor: '#161412',
        border: '1px solid #34322F',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        backgroundImage: 'none',
        // Extreme concentration: pinpoint lift shadow
        boxShadow: `0 4px 4px -4px rgba(0,0,0,0.9), 0 2px 3px -3px ${alpha('#252321', 0.9)}`,
        '&:hover': {
          bgcolor: '#1C1A18',
          borderColor: alpha('#10B981', 0.2),
          transform: 'translateY(-2px)',
          // Tight hover shadow
          boxShadow: `0 8px 10px -8px rgba(0,0,0,1), 0 6px 8px -6px ${alpha('#252321', 1.0)}`,
          '& .fav-box': { borderColor: alpha('#10B981', 0.2), bgcolor: alpha('#10B981', 0.05) }
        }
      }}
    >
      {/* Icon */}
      <Box 
        className="fav-box"
        sx={{ 
            width: 52, 
            height: 52, 
            borderRadius: '16px', 
            bgcolor: 'rgba(255, 255, 255, 0.02)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}
      >
        {faviconUrl ? (
          <Box component="img" src={faviconUrl} sx={{ width: 32, height: 32 }} />
        ) : (
          <Typography sx={{ fontWeight: 900, color: '#10B981', fontSize: '1.3rem', fontFamily: 'var(--font-clash)' }}>
            {credential.name?.charAt(0)?.toUpperCase() || "?"}
          </Typography>
        )}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.35, pr: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          {credential.isPinned && <PinIcon sx={{ fontSize: 14, color: '#F59E0B', flexShrink: 0 }} />}
          <Typography
            component="span"
            noWrap
            sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.25, fontFamily: 'var(--font-clash)', fontSize: '1rem' }}
          >
            {credential.name}
          </Typography>
        </Box>
        <Typography
          component="span"
          noWrap
          sx={{
            color: '#9B9691',
            fontWeight: 500,
            fontSize: '0.85rem',
            lineHeight: 1.35,
            fontFamily: 'var(--font-satoshi)',
            filter: isBlurEnabled ? 'blur(4px)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        >
          {credential.username}
        </Typography>
        {(credential as any).sharedFrom && (
          <Chip
            size="small"
            label={`Received from ${(credential as any).sharedFrom}`}
            sx={{
              mt: 1,
              height: 20,
              fontSize: '0.62rem',
              fontWeight: 900,
              bgcolor: alpha('#10B981', 0.08),
              color: '#10B981',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}
          />
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
        {!isMobile ? (
          <>
            <Tooltip title="Copy Email">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopy(credential.username || ''); }} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <PersonIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Secret">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopy(credential.password || ''); }} sx={{ color: '#10B981', '&:hover': { bgcolor: alpha('#10B981', 0.1) } }}>
                <LockIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Record">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Destroy">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }} sx={{ color: 'rgba(255,255,255,0.15)', '&:hover': { color: '#FF453A', bgcolor: alpha('#FF453A', 0.05) } }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setCopyAnchorEl(e.currentTarget); }} sx={{ color: '#10B981' }}>
              <ContentCopyIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }} sx={{ color: 'text.secondary' }}>
              <MoreVertIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </>
        )}
      </Box>

      <Menu
        anchorEl={copyAnchorEl}
        open={Boolean(copyAnchorEl)}
        onClose={() => setCopyAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              bgcolor: '#161412',
              border: '1px solid #34322F',
              backgroundImage: 'none',
              minWidth: 200,
              py: 1,
            },
          },
        }}
      >
        <MenuItem onClick={() => handleCopy(credential.username || '')} sx={{ py: 1.25, px: 2.5, gap: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 'auto' }}><PersonIcon sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Copy Username" slotProps={{ primary: { sx: { fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.3 } } }} />
        </MenuItem>
        <MenuItem onClick={() => handleCopy(credential.password || '')} sx={{ py: 1.25, px: 2.5, gap: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 'auto' }}><LockIcon sx={{ fontSize: 18, color: '#10B981' }} /></ListItemIcon>
          <ListItemText primary="Copy Secret" slotProps={{ primary: { sx: { fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.3, color: '#10B981' } } }} />
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              bgcolor: '#161412',
              border: '1px solid #34322F',
              backgroundImage: 'none',
              minWidth: 180,
              py: 1,
            },
          },
        }}
      >
        <MenuItem onClick={() => { onEdit(); setAnchorEl(null); }} sx={{ py: 1.25, px: 2.5, gap: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 'auto' }}><EditIcon sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Edit Record" slotProps={{ primary: { sx: { fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.3 } } }} />
        </MenuItem>
        <MenuItem onClick={() => { onTogglePin?.(); setAnchorEl(null); }} sx={{ py: 1.25, px: 2.5, gap: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 'auto' }}><PinIcon sx={{ fontSize: 18, color: credential.isPinned ? '#F59E0B' : 'inherit' }} /></ListItemIcon>
          <ListItemText primary={credential.isPinned ? 'Unpin Secret' : 'Pin Secret'} slotProps={{ primary: { sx: { fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.3 } } }} />
        </MenuItem>
        <MenuItem onClick={() => { onDelete(); setAnchorEl(null); }} sx={{ py: 1.25, px: 2.5, gap: 1.5, color: '#FF453A' }}>
          <ListItemIcon sx={{ minWidth: 'auto' }}><DeleteIcon sx={{ fontSize: 18, color: '#FF453A' }} /></ListItemIcon>
          <ListItemText primary="Destroy" slotProps={{ primary: { sx: { fontWeight: 900, fontSize: '0.85rem', lineHeight: 1.3 } } }} />
        </MenuItem>
      </Menu>
    </Paper>
  );
}

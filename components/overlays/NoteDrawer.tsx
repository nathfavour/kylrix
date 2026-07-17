import React from 'react';
import { Box, Typography, IconButton } from '@/lib/openbricks/primitives';
import { Check } from 'lucide-react';
import { Drawer } from '@/lib/openbricks/primitives';
import { useNoteDrawer } from '@/context/NoteDrawerContext';
import { useDrawerState } from '@/components/ui/DrawerStateContext';
import CreateNoteForm from '@/app/(app)/app/(app)/notes/CreateNoteForm';

const DRAWER_SX = {
  borderTopLeftRadius: '24px',
  borderTopRightRadius: '24px',
  bgcolor: '#161412',
  borderTop: '1px solid #34322F',
  backgroundImage: 'none',
  maxWidth: 720,
  width: '100%',
  mx: 'auto'
};

export function NoteDrawer() {
  const { isOpen, close } = useNoteDrawer();
  const { setIsDrawerOpen } = useDrawerState();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const composerCloseRef = React.useRef<(() => void) | null>(null);

  const closeDrawerShell = React.useCallback(() => {
    setIsDrawerOpen(false);
    close();
  }, [close, setIsDrawerOpen]);

  const requestComposerClose = React.useCallback(() => {
    if (composerCloseRef.current) {
      composerCloseRef.current();
      return;
    }
    closeDrawerShell();
  }, [closeDrawerShell]);

  React.useEffect(() => {
    setIsDrawerOpen(isOpen);
    return () => setIsDrawerOpen(false);
  }, [isOpen, setIsDrawerOpen]);

  return (
    <Drawer 
      anchor="bottom" 
      open={isOpen} 
      onClose={requestComposerClose}
      PaperProps={{ 
          sx: { 
            ...DRAWER_SX,
            height: isExpanded ? '92dvh' : '60dvh',
            transition: 'height 0.3s ease-in-out',
            pointerEvents: 'auto'
          }
      }}
      ModalProps={{
          keepMounted: false,
          disableScrollLock: false,
          disablePortal: true,
      }}
    >
      <Box 
        sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 1.5, 
            cursor: 'pointer',
            borderBottom: '1px solid #34322F',
            pointerEvents: 'auto'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: '#3D3A36' }} aria-hidden />
      </Box>

      <Box sx={{ p: 1.5, flex: 1, overflowY: 'auto', pointerEvents: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-clash)' }}>
            {isExpanded ? 'Full Screen Note' : 'New Note'}
          </Typography>
          <IconButton onClick={requestComposerClose} sx={{ color: '#9B9691' }}>
            <Check size={20} />
          </IconButton>
        </Box>

        <CreateNoteForm
            onNoteCreated={() => {
              setIsExpanded(false);
            }}
            onRegisterClose={(close) => {
              composerCloseRef.current = close;
            }}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onClose={closeDrawerShell}
        />
      </Box>
    </Drawer>
  );
}

---
name: ui.drawer-sidebar-desktop-translation
description: Direct layout translation of mobile drawers into unified desktop sidebars. Outlines rules for anchor placement, dimensions, stacking behavior, and responsive CSS structure to ensure perfect visual balance on both mobile and desktop screen sizes.
disable-model-invocation: true
---

# Drawer to Sidebar Desktop Translation

## 🏗️ Architectural Layout Mandates

### 1. Orientation & Anchor Mapping
Bottom and top drawers must translate dynamically to sidebars on desktop to respect the screen aspect ratio and optimize visual ergonomics.

* **Mobile Bottom Drawer** maps directly to a **Right Sidebar** on desktop.
  * Mobile: `anchor="bottom"`, width `100%`, height capped at `max 60vh` (`60dvh`).
  * Desktop: `anchor="right"`, height `100dvh` (tall as screen), width `30%` (normal baseline) to `40%` (for high density configurations).
* **Mobile Top Drawer** maps directly to a **Left Sidebar** on desktop.
  * Mobile: `anchor="top"`, width `100%`, height capped at `max 60vh` (`60dvh`).
  * Desktop: `anchor="left"`, height `100dvh` (tall as screen), width `30%` (normal baseline) to `40%` (for high density configurations).

---

### 2. Dimension Standards
* **Drawers (Mobile / Bottom & Top)**:
  * **Width:** `100%` (full screen).
  * **Height:** Around **60% high** (`max-height: 60vh / 60dvh`) to allow users to maintain background context.
* **Sidebars (Desktop / Left & Right)**:
  * **Height:** **100% tall** (`height: 100vh / 100dvh`) spanning from the top of the viewport to the bottom.
  * **Width:** **30% wide** (standard baseline, e.g., 400px - 480px) to **40% wide** (for dashboards, complex inputs, or logs).

---

### 3. Stacked Multi-Step Sidebars
Just as mobile layouts can overlay multiple drawers sequentially (e.g. stacking a Masterpass authentication sheet on top of a repository settings sheet), **desktop layouts must support stacked sidebars**.
* Stacked sidebars overlay sequentially on the same side.
* Ensure z-indexes and backdrops are clean (`keepMounted: false` and `disablePortal: true`) so that unmounting physically cleans up closed steps in the stacked stack.

---

### 4. Implementation Example (MUI / Tailwind / Custom CSS)
Always use responsive media hooks or media queries to compute the `anchor` and `PaperProps` dynamically.

```tsx
import { useMediaQuery, useTheme } from '@mui/material';

const theme = useTheme();
const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

// Compute responsive anchor:
const anchor = isDesktop ? 'right' : 'bottom';

// Compute responsive PaperProps styles:
const paperSx = {
  bgcolor: '#161412',
  border: 'none',
  boxSizing: 'border-box' as const,
  ...(isDesktop ? {
    height: '100vh',
    width: '35%',
    maxWidth: '480px',
    borderTopLeftRadius: '26px',
    borderBottomLeftRadius: '26px',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
  } : {
    maxHeight: '90vh',
    width: '100%',
    borderTopLeftRadius: '26px',
    borderTopRightRadius: '26px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  })
};
```

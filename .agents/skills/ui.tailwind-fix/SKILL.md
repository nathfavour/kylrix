---
name: ui.tailwind-fix
description: Row and card text layout fixes after Tailwind v4 + OpenBricks migration. Use when list rows, cards, or drawer items have clipped text, crushed line-height, or copy touching container edges. Pattern derived from ConnectTopbar Contextual Quick Actions.
---

# ui.tailwind-fix

## When to use

Apply this skill when fixing UI that uses `@/lib/openbricks/primitives` (`Box`, `Typography`, `Paper`, `Stack`) and text looks like thin slivers, overlaps, or sits flush against borders—especially after the Tailwind v4 migration.

Pair with `ui.tailwind-v4` for token/config rules; this skill is **layout and typography structure only**.

## Root causes (post-migration)

1. **`lineHeight` as a number in `sx`** must stay unitless (e.g. `1.35`). The shim must not convert it to `px` (substring match on `"height"` breaks `lineHeight`).
2. **Default `<p>` margins** on `Typography` without `component="span"` stack and crush multi-line blocks.
3. **`Paper` default `p-4` class** fights `sx` padding unless `sx` defines `p` / `px` / `py`.
4. **Absolute children** (dots, dismiss buttons) without reserved space force `pl`/`pr` hacks and collide with title rows.
5. **Title + meta on one row** without a dedicated text column causes horizontal squeeze.
6. **Nested double-padding squish (Default Paper/Card Padding)**: Standard containers like `Paper` or `Card` apply default paddings (`p-4` or `p-6`) if padding isn't explicitly overridden in `sx` (e.g., `p: 0`). When nested, these layers accumulate, crushing the remaining width on mobile and standard viewports. This forces inner text, icons, and action buttons to wrap, clash, and overlay. Always define `p: 0` on outer layout containers and only pad the inner content blocks.
7. **Unstructured Typography Placement**: Relying on standard typography elements without a dedicated, flex-based stacked text column leads to layout collapse. Elements must be wrapped in structured, padded flex columns to maintain consistent alignment.

## The reference pattern: Contextual Quick Actions

Each row is a single interactive surface with a **flat flex row** and a **stacked text column**. No absolute overlays on the text area.

### Required structure

```tsx
<Box
  component="button"
  sx={{
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 2.25,
    py: 1.5,
    borderRadius: '18px',
    textAlign: 'left',
    // surface styles…
  }}
>
  {/* 1. Fixed icon slot */}
  <Box
    sx={{
      width: 38,
      height: 38,
      borderRadius: '12px',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    }}
  >
    {icon}
  </Box>

  {/* 2. Stacked copy column */}
  <Box
    sx={{
      minWidth: 0,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.35,
      pr: 0.5,
    }}
  >
    <Typography
      component="span"
      sx={{ fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.25 }}
      noWrap
    >
      {title}
    </Typography>
    <Typography
      component="span"
      sx={{
        color: 'rgba(255,255,255,0.66)',
        fontWeight: 600,
        fontSize: '0.76rem',
        lineHeight: 1.35,
      }}
    >
      {description}
    </Typography>
  </Box>
</Box>
```

### Checklist (every list row / card header)

| Rule | Do | Don't |
|------|----|-------|
| Container | `display: 'flex'`, `alignItems: 'center'` (or `flex-start` for tall cards) | `position: 'relative'` + absolute text |
| Padding | Explicit `px: 2.25`, `py: 1.5` (or `p: 3` on cards) | Bare `p: 2` with overlays |
| Icon | Fixed `width`/`height`, `flexShrink: 0` | Icon in same flex row as title+timestamp |
| Text block | `minWidth: 0`, `flex: 1`, `flexDirection: 'column'`, `gap: 0.35`–`0.75` | Title and subtitle on one horizontal row |
| Typography | `component="span"`, unitless `lineHeight` (1.2–1.55) | Default `<p>` / omitted `lineHeight` |
| Secondary line | Its own `Typography` below title | `noWrap` on both lines unless intentional |
| Actions | Separate column `flexShrink: 0` or footer row | `position: 'absolute'` over copy |

### Cards: use the Note card shell (`components/ui/NoteCard.tsx`)

**Reference:** `/note` grid cards. This is the canonical fix for jam-packed project/template cards.

#### What Note cards do right

| Technique | Note card | Typical broken project card |
|-----------|-----------|----------------------------|
| Shell | `Card` + regions, not one `Paper` blob | Single `Paper` with one `p` value |
| Padding | `CardHeader` **`p: 2.5`** + `CardContent` **`p: 2.5`, `pt: 0`** | Only outer `p: 3` on the whole card |
| Outer inset | `Card` keeps default **`p-6`** (24px) unless `sx` sets padding | No second inset layer |
| Header/body split | Title + actions in **header**; body + tags in **content** | Title, meta, body, footer in one `Stack` |
| Header/body gap | `CardHeader` **`pb: 0.5`** then content **`pt: 0`** | `Stack spacing={2}` only (~16px) between everything |
| Body rhythm | Content `lineHeight: 1.6`, `fontSize: 0.85rem` | Tight `gap: 0.5` (~4px) between lines |
| Footer separation | Tags row **`mt: 1.5`** inside `CardContent` | Footer `pt: 2` glued to summary with no body margin |
| Typography | `component="span"`, unitless `lineHeight` | Default `<p>` or missing line height |
| Actions | Icon buttons in header row, `flexShrink: 0` | Actions overlapping text column |

#### Required card structure (match NoteCard)

```tsx
const NAV_SURFACE = '#161412';

<Card
  onClick={onOpen}
  sx={{
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    overflow: 'hidden',
    bgcolor: NAV_SURFACE,
    border: '1px solid',
    borderColor: '#34322F',
    borderRadius: '28px',
    boxShadow: 'none',
    // optional fixed height for grids
  }}
>
  <CardHeader
    sx={{ pb: 0.5, p: 2.5 }}
    title={
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        {/* title block + optional icon + action buttons */}
      </Box>
    }
  />

  <CardContent
    sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 0,
      p: 2.5,
      pt: 0,
    }}
  >
    <Typography component="span" sx={{ fontSize: '0.85rem', lineHeight: 1.6, /* body */ }}>
      {summary}
    </Typography>

    <Box sx={{ mt: 1.5, /* footer chips / meta */ }}>
      …
    </Box>
  </CardContent>
</Card>
```

#### Fluid card grids (no breakpoint column counting)

Do **not** use `Grid size={{ xs: 12, md: 6, lg: 4 }}` to guess columns. That breaks when the main lane is narrow (e.g. `/projects` beside sidebars) and forces squeezed thirds on wide breakpoints.

Use **CSS auto-fill + minmax** so column count follows **available width**, not hardcoded breakpoints:

```tsx
const PROJECT_CARD_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
  gap: 3,
  width: '100%',
  alignItems: 'stretch',
} as const;

<Box sx={PROJECT_CARD_GRID_SX}>
  {items.map((item) => (
    <Box key={item.id} sx={{ minWidth: 0, display: 'flex' }}>
      <ProjectCard /> {/* Card: width 100%, height 100% */}
    </Box>
  ))}
</Box>
```

- **`min(100%, 340px)`**: one full-width card per row on narrow viewports (mobile)  
- **`auto-fill`**: adds another column only when a **340px** track fits—scales across phone, tablet, laptop, ultra-wide, and sidebar layouts  
- **`minWidth: 0`** on cell wrappers: text truncation/clamp works inside grid children  
- Tune **`340px`** only if card content needs more horizontal room (not per-breakpoint spans)  

#### Do not (project-card anti-pattern)

```tsx
// BAD: one Paper, one padding, everything in a single Stack
<Paper sx={{ p: 3 }}>
  <Stack spacing={2}>
    <Box>icon + title + summary + actions</Box>
    <Box borderTop>footer</Box>
  </Stack>
</Paper>
```

### Shim reminders

- `Card` / `Paper` / `CardContent`: skip default Tailwind `p-*` classes when `sx` sets padding.
- `CardHeader` must render `title` React elements **without** an extra `text-sm` wrapper.
- Spacing in `sx`: `p: 2.5` → 20px per region; prefer **`gap: 0.75`–`1`** inside text columns, not `0.35`–`0.5` on cards.
- List rows: `gap: 0.35` is fine; **cards need larger internal gaps**.

## Anti-pattern: Diagnostics-style alerts

```tsx
// BAD: relative card, absolute dismiss, title + time on one row
<Box sx={{ position: 'relative', p: 2 }}>
  <IconButton sx={{ position: 'absolute', top: 10, right: 10 }} />
  <Box sx={{ pr: 4 }}>
    <Box sx={{ display: 'flex' }}>
      <Typography>{title}</Typography>
      <Typography>{time}</Typography>
    </Box>
    <Typography>{message}</Typography>
  </Box>
</Box>
```

Refactor to: dismiss in a right `flexShrink: 0` column, title/time stacked or time on its own line, message in the text column with `gap`.

## Vault (`/vault`) patterns

### Credential list rows (`CredentialItem`)

Match the quick-actions row structure (not a single crushed `Stack`):

- Outer `Paper`: `display: 'flex'`, `alignItems: 'center'`, `gap: 1.5`, `px: 2.25`, `py: 1.75`, opaque `#161412`, border `#34322F`.
- Favicon slot: fixed `52×52`, `flexShrink: 0`.
- Text column: `flex: 1`, `minWidth: 0`, `flexDirection: 'column'`, `gap: 0.35`.
- Title + username: separate `Typography` with `component="span"`, `lineHeight: 1.25` / `1.35`.
- Actions: `flexShrink: 0`; mobile ⋯ menus use `Menu` + `anchorEl` (shim supports `PaperProps` / `slotProps.paper`).

### Vault overview

- Stat tiles: fluid `repeat(auto-fill, minmax(min(100%, 200px), 1fr))` — same rule as project grids.
- Section `Paper`: opaque `#161412`, **no** `backdropFilter` / translucent shells.
- Recent-item links: icon slot + stacked text column + chevron (`flexShrink: 0`).

### Vault landing (`/vault`)

- **Routing**: exact path `/vault` is **public** (password generator). Signed-in users redirect to `/vault` after `isAuthReady` (masterpass unlock runs there via `SudoModal`).
- Hero copy: `Typography component="span"`, solid accent color (no gradient text).
- **Password display**: do **not** use a cramped `TextField` for read-only output. Use the quick-actions row shell:

```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.25, py: 1.75, borderRadius: '20px', bgcolor: '#1C1A18', border: '1px solid rgba(255,255,255,0.08)', minHeight: 56 }}>
  <Box sx={{ minWidth: 0, flex: 1, flexDirection: 'column', gap: 0.35, pr: 0.5 }}>
    <Typography component="span" sx={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', lineHeight: 1.35, wordBreak: 'break-all' }}>
      {password}
    </Typography>
  </Box>
  <Stack direction="row" sx={{ flexShrink: 0 }}>{/* copy / refresh */}</Stack>
</Box>
```

## Icon imports (migration pitfall)

**Never** default-import from `@/lib/openbricks/icons`:

```tsx
// BAD — default export is a Proxy object, not a component → "Element type is invalid"
import ContentCopyIcon from '@/lib/openbricks/icons';

// GOOD
import { ContentCopy as ContentCopyIcon } from '@/lib/openbricks/icons';
```

## Context menus (three-dot / right-click)

- `openMenu({ x, y, items, appType })` from `ContextMenuContext`.
- Card ⋯ button: `getBoundingClientRect()` → `y: rect.bottom + 4`, `x: rect.right`, `transformOrigin: { horizontal: 'right' }`.
- `Menu` shim must honor `anchorReference="anchorPosition"` and `anchorPosition` (not only `anchorEl`).

## Shim props to strip or support

| Prop | Component | Fix |
|------|-----------|-----|
| `labelPlacement` | `FormControlLabel` | Handle layout; do not pass to `<label>` |
| `readOnly` / `InputProps.readOnly` | `TextField` | Set native `readOnly` on `<input>` |
| `PaperProps.sx` | `Menu` | Merge into menu panel styles |
| `slotProps.primary.sx` | `ListItemText` | Apply to primary span |

## Grid Density & Stacking Comparison (What Fixes vs. What Botches)

| Layout Technique | What Works (Fixes) | What Fails (Reintroduces Squeeze) |
|------------------|---------------------|-----------------------------------|
| Grid Wrapper | Responsive `<Grid container spacing={3}>` with discrete column mapping (`xs: 12`, `md: 6`) | CSS auto-fill `minmax(min(100%, 340px), 1fr)` templates when the container is narrow, forcing columns to shrink below minimum safe content width. |
| Typography | Explicit `component="span"` with custom flex blocks resetting default margins and using inline block displays. | Default `<Typography>` blocks rendering as `<p>` tags with default browser margin-top/bottom collapsing and squishing together. |
| Nested Padding | Clear separation: `p: 0` on outer `Paper`/`Card` elements, and padding only handled by the inner content blocks. | Accumulating padding layers by nesting Paper/Card elements without explicit `p: 0` overrides, squeezing text containers on mobile screens. |

## Tailwind v4 Layout & Bounding Box Guidelines (QA Feedback)

Layout bugs (especially in Tailwind v4) usually happen when elements fight over the bounding box, specifically when mixing absolute positioning with flex layouts.

### 1. Right Edge Clipping (The Arrow Cut in Half / Horizontal Overflow)
- **Culprit:** Combining `w-full` or `w-screen` with horizontal margins (`mx-*`), or having an un-shrinkable item inside a flex row pushing the layout out. In Tailwind, `w-full` plus explicit margins expands *beyond* 100%, forcing the container off the right edge of the screen.
- **Fix:**
  - **Remove `w-full`** if you are using `mx-*` on that container. Let the margins dictate the width naturally, or use padding (`px-*`) on the outer wrapper instead.
  - **Absolute Anchor:** Ensure the card/container explicitly has the `relative` class so that any absolute-positioned buttons (e.g. absolute `right-2 top-1/2 -translate-y-1/2`) anchor to the card itself, not the screen viewport.
  - **Safety Net:** Add `overflow-hidden` or `max-w-full` to the parent container.

### 2. Text Overlap & Alignment (Badge Smashing Description)
- **Culprit:** Flat DOM hierarchy causing descriptions or text elements to break out of the flex alignment used for the title and icon.
- **Fix (Group Your Text Content):**
  - Ensure the left icon/badge has `flex-shrink-0` to avoid being squeezed into oblivion.
  - Group all text elements (Title, Badge, Description) inside a single vertical flex column that controls its own inner space:
    ```html
    <div class="relative flex gap-4 p-4 w-full rounded-2xl bg-[#0a0a0a] overflow-hidden">
      <div class="flex-shrink-0">
        <!-- Icon -->
      </div>
      <div class="flex-1 min-w-0 flex flex-col gap-1">
        <h3 class="text-white font-bold truncate">Smart Action Workflows</h3>
        <div>
          <span class="bg-ash text-xs px-2 py-0.5 rounded">0 SAVED</span>
        </div>
        <p class="text-sm text-gray-400 mt-2 break-words">
          Record, share, and automate action sequences to boost execution speed.
        </p>
      </div>
      <div class="absolute right-2 top-1/2 -translate-y-1/2">
        <!-- Arrow / Action -->
      </div>
    </div>
    ```
  - **Key Classes:**
    - `flex-shrink-0` on left/right decorative or badge elements.
    - `flex-1 min-w-0` on the text column wrapper. `min-w-0` prevents long text strings or flex children from breaking parent bounds and causing overflow.

## Verification

After edits, confirm in DevTools:

- Computed `line-height` is unitless (~1.25–1.55), not `1.25px`.
- `margin` on title/description nodes is `0`.
- Padding on the interactive surface is ≥ 12px vertical, ≥ 16px horizontal.

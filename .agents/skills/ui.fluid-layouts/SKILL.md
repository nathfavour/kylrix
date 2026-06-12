---
name: ui.fluid-layouts
description: Unified specifications for dynamic, responsive canvas layouts. Explains the deprecation of rigid multi-column sections in favor of fluid UI morphs that adapt seamlessly to screen size and fill layout space.
---

# Fluid Responsive Canvas Layouts & Deprecation of Rigid Right Sections

We have deprecated the legacy `DesktopRightSection` and rigid multi-column panel logic. Splitting content into hard-coded layout columns made state syncing and data morphs between viewports extremely difficult, resulting in fragile code and awkward visual spaces.

Instead, we treat the user interface as a **fluid canvas** that morphs dynamically based on screen real estate.

---

## 1. Core Principles of Fluid Canvas Layouts

1. **Responsive Reflowing**: Avoid duplicate component declarations for different breakpoints (e.g., separate mobile and desktop instances of the same list). Instead, use a single CSS grid or flex flow that natively positions components.
2. **Context Enrichment**: When a screen has excess space (such as a wide desktop view), dynamically embed related interfaces or utilities (e.g., secure chats, calls, or history lists) to fill the canvas naturally without forcing users to navigate away.
3. **No Stacking Traps**: Do not let overlay sidebars or drawers block background interactions. Side drawers should overlay cleanly and unmount when inactive.

---

## 2. Dynamic Morph Example

Instead of using the rigid multi-column registry context (`SectionContext`), use Tailwind's screen-size grids to reflow the layout components:

```tsx
// Example of fluid responsive layout grid
return (
  <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-start">
    {/* Primary App View */}
    <div className="flex flex-col gap-6">
      <MainComposer />
    </div>

    {/* Secondary Context Shelf (Moves below on mobile, aligns right on desktop) */}
    <div className="bg-[#161412] border border-[#34322F] rounded-3xl p-5">
      <ContextList data={items} />
    </div>
  </div>
);
```

---

## 3. Deprecation of DesktopRightSection

All future layouts must bypass the legacy `MultiSectionContainer` and implement native grid structures that flow automatically. This prevents state sync mismatches and enables seamless transitions when resizing windows.

# ui.tailwind-v4

## Description
Expert guidance for working with Tailwind CSS v4, focusing on the CSS-first configuration model, Design Tokens via CSS variables, and the new Oxide engine.

## Context
Tailwind CSS v4 is a major evolution that moves configuration from JavaScript (`tailwind.config.js`) into CSS using native variables and new at-rules. It uses a high-performance engine (Oxide) for lightning-fast builds and automatic content detection.

## Instructions

### 1. CSS-First Configuration
- **Design Tokens:** Define all design tokens (colors, spacing, fonts, breakpoints) within a `@theme` block in your main CSS file (usually `globals.css`).
- **Variable Syntax:** Use the `--color-*`, `--spacing-*`, `--font-*` naming conventions.
- **Example:**
  ```css
  @theme {
    --color-primary: #6366f1;
    --font-sans: "Inter", sans-serif;
    --spacing-128: 32rem;
  }
  ```

### 2. Directives & Imports
- **Entry Point:** Use `@import "tailwindcss";` instead of the old `@tailwind base;` etc.
- **Content Detection:** v4 automatically detects content. Use `@source` only to explicitly include or exclude paths or for safelisting.
  - `include`: `@source "../path/to/files";`
  - `exclude`: `@source not "../path/to/ignore";`
- **Configuration Files:** Avoid using `tailwind.config.js`. If you must use it, reference it via `@config "../tailwind.config.js";`, but prefer moving everything to the CSS `@theme` block.

### 3. Loading Plugins
- **JavaScript Plugins:** Use the `@plugin` directive to load legacy or custom JS plugins.
  ```css
  @plugin "@tailwindcss/typography";
  ```

### 4. Breaking Changes & New Features
- **Gradients:** Use `bg-linear-to-r` instead of `bg-gradient-to-r`.
- **Borders:** `border` now defaults to `currentColor`.
- **Opacity:** Prefer the slash syntax: `bg-primary/50`.
- **Spacing:** Spacing values are now dynamic; you can use arbitrary values like `p-[var(--my-spacing)]` or native variables directly.

### 5. Best Practices
- **No JS Config:** Aim for zero `tailwind.config.js` files.
- **Native CSS:** Leverage native CSS features (logical properties, container queries, etc.) which Tailwind v4 supports deeply.
- **Oxide Engine:** Respect the build performance by narrowing `@source` globs if the project size is massive.

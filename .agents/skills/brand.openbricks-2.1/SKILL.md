---
name: brand.openbricks-2.1
description: OpenBricks 2.1 design language specifications for premium layout surfaces, subtle radial gradients, organic typography spacing, and custom interactive glows that elevate UI beyond standard template-y Tailwind layouts.
---

# brand.openbricks-2.1

OpenBricks 2.1 is the design language designed to give Kylrix its unique, deep, premium hacker-aesthetic. It is defined by low-contrast borders, glowing ambient backdrops, generous spacing, and custom tactile inputs.

## Core Mandates

### 1. Ambient Radial Gradients (No Flat Black)
Never use flat, plain black `#000000` for pages, views, or sheets. Always layer a soft, high-positioned radial gradient above the black backdrop:
```css
background-image: radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
```
This ambient spotlight creates depth and anchors the eye to the primary form or content.

### 2. Natural Casing & Readability (No Forced Caps)
Avoid loud, aggressive `uppercase` classes for body copy, buttons, error messages, and form labels. Use natural Sentence Case or Title Case:
- **Form Labels**: Use `font-semibold text-zinc-300 font-satoshi text-sm` to maintain high readability.
- **Form Titles**: Use `font-clash text-white tracking-tight text-3xl md:text-4xl`.
- **technical indicators**: Only indicators, keys, or monospaced stamps can use `uppercase tracking-wider font-mono`.

### 3. Tactile Card Surfaces & Margins
- Outer containers (modals, drawers, and form cards) should have a background of `#161412` (`--color-surface`) or `#0B0A09`.
- Use a roundedness of `rounded-[28px]` for parent cards, and `rounded-xl` for interactive inputs.
- Borders must be extremely thin: `border border-white/5` or `border-[#34322F]`.
- Double-paddings or double-margins inside nested containers must be cleared with `p-0` on outer shells, and handled by inner layouts.

### 4. Interactive Glows & Focus States
Inputs, select controls, and buttons should react tactually to focus and hover:
- **Selects / Inputs / Textareas**: On focus, apply a subtle glow border and ring:
  ```html
  class="focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 focus:outline-none"
  ```
- **Primary Action Buttons**: Apply a tactile hover translateY and a custom shadow:
  ```html
  class="bg-[#6366F1] text-black shadow-[0_8px_30px_rgb(99,102,241,0.2)] hover:bg-[#5254E8] hover:translate-y-[-1px] transition-all duration-200"
  ```

### 5. Organic Font Pairing
Ensure the correct font pairs are consistently applied:
- **`font-clash` (Clash Display)**: Reserved strictly for main page headers, card titles, and primary panel headings.
- **`font-satoshi` (Satoshi)**: Used for paragraphs, field labels, option text, user inputs, and standard buttons.
- **`font-mono` (JetBrains Mono)**: Used for metadata tags, technical logs, codes, keys, and status bubbles.

### 6. Bounding Box & Spacing Rhythm
Avoid squashing elements by leaving vertical breathing room. Instead of a flat vertical pile:
- Space form fields with a nested column wrapper (`flex flex-col gap-6` or `space-y-6`).
- Group label text and its input closely (`flex flex-col gap-2`).
- Set explicit vertical paddings on buttons and inputs (`py-3.5` to `py-4`) to make them feel spacious.

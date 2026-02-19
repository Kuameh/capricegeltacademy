---
description: Design System For CGA
---

# Design System Documentation: CGA Academy

This document defines the visual design system used in the CGA Academy (Caprice Gelt Academy) project. It provides specifications for design tokens, background systems, and UI components to ensure consistency across the application.

---

## 1. Design Tokens

### Color Palette
| Token | Value | Usage |
| :--- | :--- | :--- |
| `bg-deep` | `#000000` | Global background color. |
| `bg-panel` | `#0a0a0a` | Background for cards and panels. |
| `text-primary` | `#ffffff` | Primary headings and important text. |
| `text-secondary` | `#666666` | Labels, descriptions, and secondary info. |
| `text-tertiary` | `#444444` | Dividers and disabled-like states. |
| `accent-gold` | `#FFB800` | Primary action color, icons, and highlights. |
| `accent-glow` | `rgba(255, 184, 0, 0.4)` | Glow effects for gold accents. |
| `border-dim` | `#222222` | Subtle borders and grid lines. |
| `border-dash` | `#333333` | More prominent secondary borders. |

### Typography
- **Main Font**: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Mono Font**: `"Space Mono", "Courier New", monospace`

| Style | Specs | Usage |
| :--- | :--- | :--- |
| **Hero Heading** | `72px`, `600`, Line-height `0.95` | Main page titles. Gradient: `linear-gradient(180deg, #fff 0%, #aaa 100%)`. |
| **Section Heading** | `600`, Letter-spacing `-0.02em` | H1, H2, H3 default. |
| **Technical Label** | `10px`, `500`, Uppercase, `0.15em` letter-spacing | Metadata, HUD labels, input headers. |
| **Values (Mono)** | `Mono font`, `tabular-nums` | Numerical data, amounts, and rates. |
| **Nav Item** | `14px`, Color: `var(--text-secondary)` | Navigation links. |

### Spacing System
- **Global Padding**: `40px` (desktop sides).
- **Component Gaps**: `24px` (cards), `32px` (hero typography), `48px` (stats).
- **Grid Layout**: 4-column overlay with proportional divisions.

### Bento Grid Layout
A dynamic, asymmetric grid system for hierarchical feature showcase.
- **Desktop Implementation**: `grid-template-areas` with 3 columns and 2 rows.
    - `video video curated`
    - `multi  live  curated`
- **Responsive Stack**: 
    - Tablet (992px): 1-column layout (standard stack).
    - Mobile (768px): Single-column vertical stack.
- **Card Assignments**: 
    - `.feat-video`: `grid-area: video`
    - `.feat-curated`: `grid-area: curated`
    - `.feat-multi`: `grid-area: multi`
    - `.feat-live`: `grid-area: live`

### Logo & Favicon
The brand identity is centered around the official CGA SVG logo.
- **Logo File**: `assets/images/cga-logo.svg` (Recolored to `#FFB800` for dark mode visibility).
- **Implementation**: Used as an `<img>` with class `.logo-img` and as a site favicon.
- **Favicon**: `<link rel="icon" type="image/svg+xml" href="assets/images/cga-logo.svg">`.
- **Styling**:
    - Default: `drop-shadow(0 0 8px var(--accent-glow))`
    - Hover: `drop-shadow(0 0 14px var(--accent-lime))` transition.

---

## 2. Background & Atmosphere

### Grid Overlay
A fixed-position system that provides visual structure.
- **Implementation**: `display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;`
- **Border Style**: `1px dashed var(--border-dim)`

### Radar System
A complex background animation used to convey "active liquidity."
- **Rings**: Concentric circles with varying styles (dashed, solid, radial gradients).
- **Acid Arc**: Conic gradients (`conic-gradient`) with `mask-image` to create sharp or blurred circular segments.
    - **Animation**: `pulse-rotate 8s infinite linear`.
- **Scanner**: A single gold line scanning 360 degrees.
- **HUD Labels**: Technical labels positioned at `top`, `right`, `bottom`, `left` of the radar container.

---

## 3. UI Components

### Cinematic Video Card (`.feat-video`)
A premium content card with embedded media.
- **Overlay**: 80% height gradient (`linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 30%, transparent 100%)`).
- **Interaction**: 
    - Play/Pause toggle on click.
    - Glassmorphic `.video-play-btn` (`backdrop-filter: blur(16px)`).
- **Badges**: Floating `.video-badge` at top-left.
- **Poster/Source**: High-resolution stock footage (e.g., UHD/4K trading-related animations).

### Status Badges
Used for live indicators and content categorisation.
- **Live Badge**: Red background (`rgba(255, 60, 60, 0.12)`) with a pulsing dot animation.
- **Standard Badge**: Semi-transparent black with gold border.

### Feature Card Refinements
- **Shimmer Effect**: A gold light sweep on hover transition.
- **Glassmorphism**: Consistent `backdrop-filter: blur(20px)` on all card backgrounds.
- **Hover States**: 3px vertical lift + enhanced gold border opacity + deep shadow.

---

## 4. Implementation Notes

1. **Anti-Aliasing**: Use `-webkit-font-smoothing: antialiased;` globally to maintain crisp typography on dark backgrounds.
2. **Layering**: Ensure `z-index` hierarchy:
    - Grid Overlay: `0`
    - Main Content: `10`
    - Nav: `100` (Mix-blend-mode: exclusion)
3. **Glassmorphism**: Use `backdrop-filter: blur(20px)` on all panels for a premium depth effect.
4. **Interactive Video**: Use `IntersectionObserver` to autoplay muted preview videos when they enter the viewport.
5. **Shimmer Animation**: Implemented via `::after` pseudo-element with a moving linear gradient.


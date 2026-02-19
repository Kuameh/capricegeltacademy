# Design System Documentation: Offramp Protocol

This document defines the visual design system used in the Offramp Protocol project. It provides specifications for design tokens, background systems, and UI components to ensure consistency across the application.

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
| `accent-lime` | `#D4FF00` | Primary action color, icons, and highlights. |
| `accent-glow` | `rgba(212, 255, 0, 0.4)` | Glow effects for lime accents. |
| `border-dim` | `#222222` | Subtle borders and grid lines. |
| `border-dash` | `#333333` | More prominent secondary borders. |

### Typography
- **Main Font**: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Mono Font**: `"Space Mono", "Courier New", monospace`

| Style | Specs | Usage |
| :--- | :--- | :--- |
| **Hero Heading** | `82px`, `600`, Line-height `0.9` | Main page titles. Gradient: `linear-gradient(180deg, #fff 0%, #aaa 100%)`. |
| **Section Heading** | `600`, Letter-spacing `-0.02em` | H1, H2, H3 default. |
| **Technical Label** | `10px`, `500`, Uppercase, `0.15em` letter-spacing | Metadata, HUD labels, input headers. |
| **Values (Mono)** | `Mono font`, `tabular-nums` | Numerical data, amounts, and rates. |
| **Nav Item** | `14px`, Color: `var(--text-secondary)` | Navigation links. |

### Spacing System
- **Global Padding**: `40px` (desktop sides).
- **Component Gaps**: `24px` (cards), `32px` (hero typography), `48px` (stats).
- **Grid Layout**: 4-column overlay with proportional divisions.

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
- **Scanner**: A single lime line scanning 360 degrees.
- **HUD Labels**: Technical labels positioned at `top`, `right`, `bottom`, `left` of the radar container.

---

## 3. UI Components

### Primary Button (`.btn-primary`)
The main call-to-action component.
- **Specs**:
    ```css
    background: var(--accent-lime);
    color: black;
    padding: 16px;
    border-radius: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    ```
- **States**: 
    - Hover: `transform: scale(1.02); box-shadow: 0 0 20px var(--accent-glow);`
- **Anatomy**: Includes a trailing `.btn-arrow` (black circle with `➜` icon).

### Small CTA (`.cta-small`)
Secondary or utility action (e.g., "Connect Wallet").
- **Specs**:
    ```css
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 8px 16px;
    border-radius: 100px;
    font-size: 13px;
    ```
- **States**: 
    - Hover: `background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.3);`

### Converter Card (`.converter-card`)
The central transaction container.
- **Specs**:
    ```css
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid #333;
    border-radius: 24px;
    padding: 32px;
    ```

### Currency Input Group
Reusable input pattern for currency values.
- **Anatomy**: `.label-technical` (Top) + `.currency-input` (Large text) + `.currency-badge` (Badge right).
- **Badges**:
    ```css
    background: #111;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #333;
    font-size: 14px;
    ```

### Compliance Badge
A subtle status indicator for institutional trust.
- **Implementation**: Flex container with `background: rgba(255, 255, 255, 0.05)`, border-radius `6px`.
- **Status Dot**: `6px` lime circle with `box-shadow` glow.

---

## 4. Implementation Notes

1. **Anti-Aliasing**: Use `-webkit-font-smoothing: antialiased;` globally to maintain crisp typography on dark backgrounds.
2. **Layering**: Ensure `z-index` hierarchy:
    - Grid Overlay: `0`
    - Main Content: `10`
    - Nav: `100` (Mix-blend-mode: exclusion)
3. **Glassmorphism**: Use `backdrop-filter: blur(20px)` on all panels for a premium depth effect.
4. **Dynamic States**: Currency conversion rates should have a "jitter" or "live pulse" feel (implemented via JS setters on readonly inputs).

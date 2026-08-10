# 06 — Brand & Design System

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#1878B4` | Buttons, links, active states, brand accent |
| Primary Dark | `#125E8C` | Hover states, darker variant |
| Primary Tint | `#EAF4FB` | Light backgrounds, tag fills |
| Primary Hover | `#15699E` | Button hover |
| Accent Black | `#0A0A0A` | High-contrast accent |

### Background Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Background | `#F7F9FB` | `#0F1117` | Page background |
| Surface | `#FFFFFF` | `#1A1D27` | Card/panel background |
| Border | `#E7ECF1` | `#2A2D3A` | Dividers, card borders |

### Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Text | `#14181C` | `#E8EAED` | Primary text |
| Text Secondary | `#374151` | `#D1D5DB` | Secondary text |
| Text Muted | `#6B7280` | `#9CA3AF` | Labels, timestamps |

### Status Colors

| Status | Color | Tint (Light) | Usage |
|--------|-------|-------------|-------|
| Success / Available | `#22C55E` | `#DCFCE7` | In stock, successful syndication |
| Warning / Pending | `#F59E0B` | `#FEF3C7` | Pending syndication, low stock |
| Danger / Sold / Failed | `#EF4444` | `#FEE2E2` | Sold out, failed syndication, delete actions |
| Archived / Inactive | `#6B7280` | — | Archived listings, inactive states |
| Active / Primary | `#1878B4` | — | Active syndication status |

### Dark Mode

Dark mode is toggled via a `.dark` class on the `<html>` element. All CSS custom properties are overridden in the `.dark` selector. Theme preference is persisted to `localStorage`.

**Admin Portal** (`src/index.css`): Full dark mode token set in `.dark` class.

**Admin App** (`src/config/theme.js`): Complete light/dark theme object with `colors`, `spacing`, `radii`, `shadows`, `typography`.

**Public Website** (`src/styles.css`): OKLCH color system with dark mode via `html.light` class (inverted naming — dark is default).

## Typography

### Font Families

| Context | Font | Weight | Source |
|---------|------|--------|--------|
| **Headings** | Poppins | 600, 700 | Google Fonts (admin-portal `index.html`) |
| **Body** | Inter | 400, 500, 600 | Google Fonts (admin-portal `index.html`) |
| **Ethiopic** | Noto Sans Ethiopic | 400 | Google Fonts (public website `__root.tsx`) |
| **Serif** | Instrument Serif | — | Google Fonts (public website `__root.tsx`) |

### Type Scale (Admin Portal)

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Page title | 24px | 700 | Poppins |
| Section heading | 16px | 600 | Poppins |
| Body text | 14px | 400–500 | Inter |
| Small text / labels | 13px | 600 | Inter |
| Caption / timestamp | 12px | 400 | Inter |
| Badge text | 11px | 600 | Inter |
| Stat value | 32px | 700 | Poppins |

### Spacing Scale

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Small buttons, badges |
| `--radius-md` | 12px | Inputs, cards |
| `--radius-lg` | 16px | Modals, large cards |
| `--radius-xl` | 24px | Special elements |

### Shadows

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(10,10,10,0.06)` |
| `--shadow-md` | `0 4px 12px rgba(10,10,10,0.08)` |
| `--shadow-lg` | `0 12px 32px rgba(10,10,10,0.12)` |

### Transitions

| Token | Value |
|-------|-------|
| `--transition-fast` | 150ms ease |
| `--transition-normal` | 200ms ease |

## Brand Assets

### Logo & Icon Files

| File | Location | Used By |
|------|----------|---------|
| `bros_icon_concept4_monogram_clean.png` | `admin-app/assets/` | App icon, adaptive icon, splash |
| `bros_splash_full_concept4.png` | `admin-app/assets/` | Splash screen |
| `device-illustration.png` | `admin-app/assets/` | Login screen hero |
| `favicon-96x96.png` | `admin-portal/public/`, `public-website/public/images/favicon/` | Browser tab icon |
| `hero.png` | `admin-portal/src/assets/` | Admin portal hero |
| `bros_desktop_light_HD.jpg` | `public-website/public/images/` | Desktop hero (light) |
| `bros_desktop_dark_HD.jpg` | `public-website/public/images/` | Desktop hero (dark) |
| `bros_mobile_light_HD.png` | `public-website/public/images/` | Mobile hero (light) |
| `bros_mobile_dark_HD.png` | `public-website/public/images/` | Mobile hero (dark) |
| Brand logos | `public-website/public/images/brands/` | Brand marquee on homepage |

### Splash Screen

- Background: `#1878B4` (primary blue)
- Image: `bros_splash_full_concept4.png`
- Resize mode: `contain`

### App Icons

- iOS: `bros_icon_concept4_monogram_clean.png` (1024x1024)
- Android adaptive: Same image with `#1878B4` background

## Component Patterns

### Button Variants

| Variant | Background | Text | Hover |
|---------|-----------|------|-------|
| `primary` | `#1878B4` | White | `#125E8C` |
| `secondary` | Transparent | `#1878B4` | `#EAF4FB` |
| `ghost` | Transparent | `#6B7280` | `#F7F9FB` |
| `danger` | `#EF4444` | White | `#DC2626` |
| `danger-tint` | `#FEE2E2` | `#EF4444` | `#FECACA` |
| `success` | `#22C55E` | White | `#16A34A` |

### Input Fields

- Height: 44px
- Border: 1px solid `var(--color-border)`
- Border radius: `var(--radius-md)` (12px)
- Focus ring: `0 0 0 3px rgba(24,120,180,0.15)`
- Error state: Red border + error message text

### Status Badges

- Pill shape with colored dot (6px circle)
- Two sizes: `sm` (padding 3px/10px, font 12px) and `md` (padding 5px/14px, font 13px)
- Label auto-formatted: first char uppercase, rest lowercase

### Data Tables

- Row hover highlighting
- Pagination: page number buttons (max 5 visible, sliding window)
- Shows "Showing X-Y of Z" counter
- Action buttons visible on hover (desktop), always visible (mobile)

## Tech Debt / Inconsistencies

- **ContactSettings.tsx** uses Tailwind utility classes (`className="..."`) instead of the inline styles + CSS custom properties pattern used by all other admin-portal pages. This is inconsistent with the design system approach.
- **Public Website** uses OKLCH color space while admin-portal/app use hex colors. The color values are semantically equivalent but technically different.
- **Public Website** dark mode uses `html.light` class (inverted naming — dark is default), while admin-portal uses `html.dark` class (dark mode added via `.dark` class). This inconsistency could confuse developers switching between codebases.
- **Admin App** has a separate `theme.js` file with color tokens that should be kept in sync with the admin-portal's `index.css` tokens manually. No shared token source.

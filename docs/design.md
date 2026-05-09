# Frontend Design Baseline

This document defines the implementation-facing design system for the MVP. It is intentionally narrow: clean, minimal, white background, mostly solid fills, and an orange primary brand color.

If implementation details conflict with visual preference, favor consistency, readability, and development simplicity.

## 1. Design Direction

- Overall tone: minimal, calm, and product-focused.
- Backgrounds: white by default.
- Color usage: mostly solid colors, limited tint surfaces, no decorative gradients as a core pattern.
- Primary emphasis: orange for key actions and progress cues.
- Corners: soft but restrained.
- Shadows: subtle and rare.
- Motion: functional only; do not use ornamental animation.

## 2. Color System

### Core palette

Use these values as the default tokens.

| Token | Value | Usage |
| --- | --- | --- |
| `--color-bg` | `#FFFFFF` | App background |
| `--color-surface` | `#FFFFFF` | Cards, panels, inputs |
| `--color-surface-muted` | `#F7F7F8` | Secondary sections, disabled fills |
| `--color-border` | `#E5E7EB` | Default border |
| `--color-border-strong` | `#D1D5DB` | Emphasized border |
| `--color-text` | `#111827` | Primary text |
| `--color-text-muted` | `#6B7280` | Secondary text |
| `--color-text-soft` | `#9CA3AF` | Placeholder or helper text |
| `--color-primary` | `#F97316` | Primary brand/action |
| `--color-primary-hover` | `#EA580C` | Hover state |
| `--color-primary-active` | `#C2410C` | Pressed state |
| `--color-primary-soft` | `#FFF1E8` | Primary-tinted background |
| `--color-success` | `#16A34A` | Success messages |
| `--color-warning` | `#D97706` | Warning messages |
| `--color-danger` | `#DC2626` | Error messages |
| `--color-info` | `#2563EB` | Informational status |

### Usage rules

- Use `--color-primary` only for the main CTA, selected state, progress emphasis, and key interactive highlights.
- Keep orange usage sparse enough that one primary action per area is visually obvious.
- Do not use large orange backgrounds for whole pages or major layouts.
- Default containers remain white with gray borders.
- Use tinted surfaces sparingly for notices, selected cards, or progress states.

## 3. Typography

### Font guidance

- Primary UI font: a modern sans-serif with strong Korean and Latin support.
- Default recommendation: `Pretendard`, then `Inter`, then `system-ui`, then `sans-serif`.
- Use one font family for the entire MVP UI.

### Type scale

| Token | Size / Line Height | Usage |
| --- | --- | --- |
| `--text-xs` | `12px / 16px` | Captions, helper text |
| `--text-sm` | `14px / 20px` | Secondary UI text |
| `--text-md` | `16px / 24px` | Default body text |
| `--text-lg` | `18px / 28px` | Section headers |
| `--text-xl` | `24px / 32px` | Page titles |
| `--text-2xl` | `32px / 40px` | Major hero or score display |

### Weight guidance

- `500`: labels, compact headings.
- `600`: section titles, buttons.
- `700`: main page titles and score highlights.

### Typography rules

- Default body text is `16px`.
- Do not use more than three font sizes in a dense component.
- Avoid center-aligned body copy except for empty states or short score summaries.
- Keep line lengths moderate; long explanatory text should sit in narrow containers.

## 4. Spacing Scale

Use a 4px base scale.

| Token | Value |
| --- | --- |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |

### Spacing rules

- Use `16px` as the default gap inside compact components.
- Use `24px` or `32px` between major sections.
- Mobile page padding: `16px`.
- Desktop page padding: `24px` to `32px`.
- Avoid arbitrary spacing values outside this scale unless a layout bug requires it.

## 5. Radius, Border, and Shadow

### Radius scale

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-sm` | `8px` | Inputs, small buttons |
| `--radius-md` | `12px` | Cards, dropdowns |
| `--radius-lg` | `16px` | Large panels, modals |
| `--radius-pill` | `999px` | Pills, badges |

### Border rules

- Default border width: `1px`.
- Default border color: `--color-border`.
- Use `--color-border-strong` for selected but non-primary-emphasis containers.
- Inputs, cards, and secondary buttons should rely on borders more than shadows.

### Shadow rules

- Default card shadow: `0 1px 2px rgba(17, 24, 39, 0.04)`.
- Hover shadow may increase slightly, but keep elevation subtle.
- Do not stack multiple shadows or use colored shadows.

## 6. Component Direction

### Buttons

- Primary button: solid orange fill, white text, medium radius, semibold label.
- Secondary button: white fill, gray border, dark text.
- Ghost button: transparent background, dark text, subtle hover fill.
- Minimum height: `44px`.
- Horizontal padding: `16px` to `20px`.
- Do not use gradients, outlines with heavy glow, or overly rounded capsule buttons as the default.

### Inputs

- White background with visible border.
- Minimum height: `44px`.
- Placeholder uses `--color-text-soft`.
- Focus state must be obvious through border or ring, not through large shadow effects.
- Validation messaging sits directly below the field in small text.

### Cards and panels

- White background, gray border, medium radius.
- Use internal padding of `16px` or `24px` depending on density.
- Cards should group related information, not act as decorative containers.
- Prefer one card level per screen section. Avoid nested card-on-card layouts unless information hierarchy requires it.

### Badges and tags

- Use neutral or softly tinted fills.
- Reserve orange badges for priority or active states only.

### Timers and score displays

- The speaking test flow can use orange for active time/progress emphasis.
- Keep surrounding chrome neutral so the state color carries meaning.

## 7. Interaction States

All interactive components should define the following baseline states.

### Default

- Clean border, clear text contrast, no unnecessary visual noise.

### Hover

- Slight color darkening for primary elements.
- Slight background tint for neutral controls.
- Optional small shadow increase for cards and raised buttons.

### Active / Pressed

- Darken fill or border one step.
- Reduce shadow rather than increasing it.

### Focus

- Always visible keyboard focus.
- Use a `2px` focus ring in a low-saturation orange tint or blue fallback if contrast is insufficient.
- Focus must not rely on hover styling alone.

### Disabled

- Reduce contrast, remove pointer emphasis, keep text readable.
- Disabled primary buttons should not remain vivid orange.

### Error

- Use `--color-danger` on border, helper text, and icon accents.
- Do not turn the whole field background bright red.

## 8. Layout Rules

- Use a simple column layout with strong content grouping.
- Default max content width for dense app screens: `960px` to `1120px`.
- For task-focused flows like recording or review, use tighter widths when it improves concentration.
- Keep one primary action area per screen.
- Important status, timer, and next-step actions should remain above the fold on laptop screens.

## 9. Accessibility and Implementation Rules

- Body text contrast should meet at least WCAG AA expectations.
- Interactive targets should be at least `44px` tall.
- Never communicate status by color alone; pair with icon or text.
- Use semantic HTML before custom interaction wrappers.
- Build tokens first in code and consume them consistently; avoid one-off component colors.

## 10. CSS Token Example

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-surface-muted: #f7f7f8;
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-text-soft: #9ca3af;
  --color-primary: #f97316;
  --color-primary-hover: #ea580c;
  --color-primary-active: #c2410c;
  --color-primary-soft: #fff1e8;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}
```

## 11. What To Avoid

- Full-screen tinted backgrounds as the default UI pattern.
- Decorative gradients, glassmorphism, neon glows, or oversized shadows.
- Too many accent colors competing with orange.
- Ambiguous primary actions.
- Overdesigned card treatments that slow implementation without improving clarity.

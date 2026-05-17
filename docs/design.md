# Frontend Design Baseline

This document defines the implementation-facing design direction for Moldo's MVP frontend. It is based on the provided main page reference: a polished Korean learning dashboard for exam-style English speaking practice.

If implementation details conflict with visual preference, favor consistency, readability, and a calm product experience. The app should feel like a focused study service, not a marketing landing page.

## 1. Design Direction

- Overall tone: bright, calm, trustworthy, and slightly premium.
- Product mood: exam-prep focused, AI-assisted, encouraging without becoming playful.
- Visual language: soft white surfaces, pale sand accents, thin borders, restrained cream-sand gradients for primary actions.
- Primary emphasis: warm sand and gold-brown, used for active navigation, primary CTAs, status pills, progress bars, and selected states.
- Layout character: structured dashboard with a large main work area and a narrower right-side support rail.
- Illustration style: simple line illustration with warm sand accents, low-density dots, and soft abstract highlights.
- Corners: soft and consistent, but not overly rounded.
- Shadows: very subtle, used only to separate floating panels from the light background.
- Motion: functional and brief. Use hover, focus, progress, and loading states; avoid ornamental animation.

## 2. Brand and Visual Identity

### Brand cues

- Brand name: `Moldo`.
- Brand mark: warm sand mascot/cloud shape paired with the wordmark.
- Logo placement: top-left in the global header.
- Brand color impression: warm sand-gold, friendly but clear enough for study and assessment workflows.

### Interface impression

- The first viewport should immediately communicate:
  - This is an English speaking practice service.
  - The user can start a test quickly.
  - Prior attempts and recommendations are available on the right.
- The UI should look usable as a real dashboard, not a static hero page.
- Avoid large decorative sections that delay access to the test list.

## 3. Color System

### Core palette

Use these values as the default tokens.

| Token | Value | Usage |
| --- | --- | --- |
| `--color-bg` | `#FFFDF8` | App background with a very light warm cast |
| `--color-bg-elevated` | `#FFFFFF` | Header, cards, panels, inputs |
| `--color-surface` | `#FFFFFF` | Main panels and repeated cards |
| `--color-surface-soft` | `#FBF5E9` | Soft icon wells, subtle highlighted areas |
| `--color-surface-tint` | `#F4EAD8` | Active nav, badges, selected states |
| `--color-border` | `#EFE2CB` | Default panel and input border |
| `--color-border-strong` | `#EDDDC0` | Emphasized border or active outline |
| `--color-text` | `#3A2B18` | Primary text |
| `--color-text-muted` | `#806B4C` | Secondary text |
| `--color-text-soft` | `#AA9677` | Helper text, placeholder text |
| `--color-primary` | `#EDDDC0` | Primary brand/action surface |
| `--color-primary-hover` | `#DCC39A` | Primary hover |
| `--color-primary-active` | `#CEB184` | Primary pressed |
| `--color-primary-soft` | `#FBF1E1` | Primary-tinted backgrounds |
| `--color-primary-strong` | `#8A6430` | Strong icon and link accents |
| `--color-success` | `#3FBC7A` | Completion or positive status |
| `--color-warning` | `#E69C2E` | Warning or pending attention |
| `--color-danger` | `#E15261` | Error and destructive states |
| `--color-info` | `#4D7FEA` | Informational status |

### Gradient tokens

Gradients are allowed only for important warm brand surfaces, especially the main CTA and compact action buttons.

| Token | Value | Usage |
| --- | --- | --- |
| `--gradient-primary` | `linear-gradient(135deg, #F6EAD4 0%, #EDDDC0 100%)` | Primary CTA and row action buttons |
| `--gradient-primary-hover` | `linear-gradient(135deg, #EDDDC0 0%, #DCC39A 100%)` | Hovered primary CTA |
| `--gradient-soft` | `linear-gradient(180deg, #FFFFFF 0%, #FBF5E9 100%)` | Rare large soft surfaces |

### Usage rules

- Use warm sand and gold-brown as the only dominant accent family.
- Use primary gradients sparingly: one main CTA per screen area, plus compact start buttons in the test list.
- Do not use purple as a primary or progress color.
- Keep large page backgrounds nearly white. Warm sand should be perceptible but quiet.
- Use status colors only when they carry meaning. Most badges should be warm brand or neutral.
- Progress bars should use `--color-primary` or `--gradient-primary` over a pale warm-gray track.

## 4. Typography

### Font guidance

- Primary UI font: a modern sans-serif with strong Korean and Latin support.
- Default recommendation: `Pretendard`, then `Inter`, then `system-ui`, then `sans-serif`.
- Use one font family across the MVP UI.
- Korean interface copy should be concise and direct.

### Type scale

| Token | Size / Line Height | Usage |
| --- | --- | --- |
| `--text-xs` | `12px / 16px` | Captions, metadata, helper text |
| `--text-sm` | `14px / 20px` | Secondary UI text, badges |
| `--text-md` | `16px / 24px` | Default body text |
| `--text-lg` | `18px / 28px` | Section headings and strong labels |
| `--text-xl` | `24px / 32px` | Card or page section titles |
| `--text-2xl` | `32px / 42px` | Main dashboard headline |

### Weight guidance

- `400`: body copy and supporting descriptions.
- `500`: labels, metadata, input text.
- `600`: navigation, buttons, section headers.
- `700`: page headline, key score values, active exam titles.

### Typography rules

- Main dashboard headline should be bold and compact, similar to `시험형 영어 말하기 연습 서비스`.
- Avoid oversized marketing type. This is an app screen, not a landing page.
- Default body copy should be `16px`.
- Use smaller, tighter type in cards and right-side panels.
- Do not center-align dense dashboard copy.
- Keep button text short. Prefer labels such as `시험 시작`, `시작하기`, `상세 보기`.

## 5. Spacing Scale

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

- Global desktop page padding: `32px` to `40px`.
- Header horizontal padding: align to the page content grid.
- Use `24px` between major dashboard sections.
- Use `16px` to `20px` inside compact cards.
- Main content and right rail should have a `32px` gap on desktop.
- Mobile page padding: `16px`.
- Avoid arbitrary spacing values outside this scale unless a layout bug requires it.

## 6. Radius, Border, and Shadow

### Radius scale

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-sm` | `8px` | Inputs, small buttons, badges |
| `--radius-md` | `12px` | Cards, dropdowns, list rows |
| `--radius-lg` | `16px` | Main panels and right-rail panels |
| `--radius-pill` | `999px` | Avatars, small pills, circular icon wells |

### Border rules

- Default border width: `1px`.
- Default border color: `--color-border`.
- Use `--color-border-strong` for active, focused, or emphasized containers.
- Cards, panels, filters, and inputs should rely on thin borders more than shadows.
- Keep borders visible enough on a white background.

### Shadow rules

- Default panel shadow: `0 8px 24px rgba(116, 83, 39, 0.06)`.
- Small floating control shadow: `0 2px 8px rgba(116, 83, 39, 0.08)`.
- Avoid heavy drop shadows, glow effects, and stacked shadows.
- Do not use colored shadows except very subtle warm-tinted elevation.

## 7. Page Layout

### Global header

- Height: approximately `72px` to `80px` on desktop.
- Background: white or very faint translucent white over the light page background.
- Bottom border: `1px solid --color-border`.
- Left: Moldo logo and wordmark.
- Center: primary navigation items:
  - `시험`
  - `학습 리포트`
  - `이용 가이드`
  - `고객센터`
- Active nav item: dark text with a short warm gold underline.
- Right: circular user avatar icon, `내 정보`, and a chevron.

### Main desktop grid

- Use a two-column dashboard grid:
  - Left/main column: hero, search/filter panel, test list.
  - Right rail: recent attempts, recommendation, usage guide.
- Recommended max content width: `1440px` to `1520px`.
- Left column should be visually dominant.
- Right rail width should be around `340px` to `380px`.
- Align the hero top with the right rail top.

### Hero area

- The hero is an app intro band, not a landing page.
- Left side contains headline, short supporting copy, and actions.
- Right side may contain a small speaking/test illustration.
- The hero should remain visually open, without a large card wrapper.
- Primary CTA: `시험 시작`, cream-sand gradient, large enough to anchor the page.
- Secondary CTA: `이용 가이드 보기`, text/link style with a right chevron.

### Search and filter panel

- The search/filter/test list area sits in a bordered white panel.
- Search input spans most of the panel width.
- `필터 초기화` is a secondary bordered button.
- Filters use compact select controls in a row:
  - `난이도`
  - `문항 수`
  - `예상 시간`
  - `유형`
- Use a clean divider between filters and the test list header.

### Test list

- Section title: `응시 가능한 시험`.
- Include helper text beside the title when useful.
- Sorting control sits to the right, such as `최신순`.
- Test rows should be white, bordered, and compact.
- Each row contains:
  - icon well
  - test title
  - small category badge
  - question count
  - estimated time
  - difficulty
  - type
  - gradient `시작하기` button
- Rows should not look like oversized cards; they are dense list items.

### Right rail

- Right rail panels use white surfaces, thin warm sand borders, and `16px` to `20px` padding.
- `최근 응시 기록` is the primary right-rail panel.
- Recent record items include document icon, title, date/time, status badge, score/progress, and a detail link where appropriate.
- `추천 시험` uses a lightbulb icon and one clear outlined CTA.
- `이용 안내` uses compact icon bullets and a text link.

### Footer

- Footer should be compact and low contrast.
- Left: copyright.
- Center: policy links.
- Right: support email.
- The footer must not compete with dashboard content.

## 8. Component Direction

### Buttons

- Primary button: cream-sand gradient, dark warm text, medium radius, semibold label, right chevron when it starts a flow.
- Secondary button: white fill, warm sand border, gold-brown or dark text.
- Ghost/link button: transparent background, gold-brown text, optional icon.
- Minimum height: `40px` for compact controls, `48px` for primary hero actions.
- Horizontal padding: `16px` to `28px` depending on prominence.
- Primary button hover should slightly darken the gradient.

### Inputs and selects

- White background with visible warm-gray border.
- Minimum height: `44px`.
- Placeholder uses `--color-text-soft`.
- Include leading icons where helpful, such as search.
- Focus state: warm gold border plus a subtle `2px` ring.
- Select controls should use a chevron icon and consistent compact sizing.

### Cards and panels

- White background, warm-gray border, `--radius-lg` for panels.
- Use internal padding of `16px`, `20px`, or `24px`.
- Avoid nested decorative card layers. Nested list items are allowed when they represent separate records.
- Keep panel headings compact and clear.

### Icon wells

- Use pale sand circular or rounded-square icon wells.
- Icon stroke should usually be `--color-primary-strong`.
- Keep icon wells consistent in size within a list.

### Badges and tags

- Use soft warm brand fills for the `말하기 모의고사` category.
- Status badges:
  - `진행 중`: gold-brown text on pale sand background.
  - `완료`: gold-brown or success text on soft background.
- Badges should be compact and not visually louder than primary buttons.

### Progress

- Track: pale warm-gray.
- Fill: gold-brown or primary gradient.
- Display percentage text separately when needed.
- Progress bars should be slim and horizontal.

## 9. Interaction States

All interactive components should define the following baseline states.

### Default

- Clean border, clear text contrast, no unnecessary visual noise.

### Hover

- Primary controls darken slightly.
- Secondary controls receive a pale sand fill.
- Test rows may show a slightly stronger border.

### Active / Pressed

- Darken fill or border one step.
- Reduce shadow rather than increasing it.

### Focus

- Always visible keyboard focus.
- Use a `2px` ring in `rgba(138, 100, 48, 0.22)`.
- Focus must not rely on hover styling alone.

### Disabled

- Reduce contrast, remove pointer emphasis, keep text readable.
- Disabled primary buttons should not remain vivid gold-brown.

### Error

- Use `--color-danger` on border, helper text, and icon accents.
- Do not turn the whole field background bright red.

## 10. Responsive Rules

### Desktop

- Preserve the two-column dashboard when viewport width is sufficient.
- Keep the right rail visible above the fold on common laptop screens.
- Avoid text overlap in dense rows by giving metadata columns stable widths.

### Tablet

- Stack hero illustration below or beside the headline depending on available width.
- Right rail may move below the main test list.
- Filter controls can wrap to two rows.

### Mobile

- Use a single-column layout.
- Header nav collapses into a menu or simplified top bar.
- Hero actions stack vertically or become full-width.
- Search input and reset button stack when horizontal space is insufficient.
- Test row metadata can wrap into a two-column summary.
- Right-rail panels appear below the test list in this order:
  - recent attempts
  - recommendation
  - usage guide

## 11. Accessibility and Implementation Rules

- Body text contrast should meet at least WCAG AA expectations.
- Interactive targets should be at least `44px` tall on touch layouts.
- Never communicate status by color alone; pair with icon or text.
- Use semantic HTML before custom interaction wrappers.
- Build tokens first in code and consume them consistently.
- Use real buttons, links, labels, and headings.
- Avoid one-off component colors. If a color appears in more than one place, promote it to a token.
- Korean text must not clip inside buttons, badges, cards, or table-like rows.

## 12. CSS Token Example

```css
:root {
  --color-bg: #fffdf8;
  --color-bg-elevated: #ffffff;
  --color-surface: #ffffff;
  --color-surface-soft: #fbf5e9;
  --color-surface-tint: #f4ead8;
  --color-border: #efe2cb;
  --color-border-strong: #edddc0;
  --color-text: #3a2b18;
  --color-text-muted: #806b4c;
  --color-text-soft: #aa9677;
  --color-primary: #edddc0;
  --color-primary-hover: #dcc39a;
  --color-primary-active: #ceb184;
  --color-primary-soft: #fbf1e1;
  --color-primary-strong: #8a6430;
  --color-success: #3fbc7a;
  --color-warning: #e69c2e;
  --color-danger: #e15261;
  --color-info: #4d7fea;
  --gradient-primary: linear-gradient(135deg, #f6ead4 0%, #edddc0 100%);
  --gradient-primary-hover: linear-gradient(135deg, #edddc0 0%, #dcc39a 100%);
  --gradient-soft: linear-gradient(180deg, #ffffff 0%, #fbf5e9 100%);
  --shadow-panel: 0 8px 24px rgba(116, 83, 39, 0.06);
  --shadow-control: 0 2px 8px rgba(116, 83, 39, 0.08);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 999px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

## 13. What To Avoid

- Orange primary accents from the previous MVP direction.
- Dark, heavy, or corporate dashboard styling.
- Full-screen saturated purple backgrounds.
- Excessive gradients, glow effects, or glassmorphism.
- Oversized marketing hero sections.
- Card-heavy layouts where every section floats independently.
- Nested decorative cards that reduce scanability.
- Ambiguous primary actions.
- Dense text blocks that distract from starting a speaking test.

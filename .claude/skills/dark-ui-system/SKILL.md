---
name: dark-ui-system
description: Build a dark-first colour system — surface elevation ladder, text levels, desaturated accents, borders, image treatment — as CSS custom properties, then verify every text/background pair with the bundled contrast checker. Use when making dark the default theme, when a dark theme looks flat, muddy, harsh or "fake", or when deriving a light theme from a dark one.
---

# Dark UI system

A good dark theme is designed, not inverted. Depth comes from lighter surfaces, colour is quieter than in light mode, and every pair of colours is measured.

## 1. Base and surface ladder

Pick a base that is *not* pure black. Tint it toward the brand's temperature (warm brown-black, plum-black, indigo-black) with very low chroma. Then build an elevation ladder by raising lightness in small, even steps:

| Token | Use | Step (OKLCH L) |
|---|---|---|
| `--bg` | page | base, e.g. 0.15–0.17 |
| `--sunken` | sidebar, wells | base − 0.02 to 0.03 |
| `--surface-1` | cards, rows on hover | base + 0.03 |
| `--surface-2` | popovers, menus, composer | base + 0.06 |
| `--surface-3` | tooltips, active chips | base + 0.09 |

Keep hue and chroma the same across the ladder so it reads as one material. Elevation = lighter, not shadowed; shadows are nearly invisible on dark. Use hairline borders (white at 6–10%) to separate surfaces of equal lightness.

## 2. Text levels

Never pure white on a dark base. Three levels:

- `--ink` primary text: warm/cool off-white, contrast ≥ 12:1 on `--bg`.
- `--ink-2` secondary: ≥ 7:1.
- `--ink-3` tertiary (timestamps, hints): ≥ 4.5:1 on every surface it appears on.

## 3. Accents

- One **primary action** colour. On dark, make it lighter and 20–40% less saturated than its light-mode version so it doesn't vibrate. A luminous accent with dark text on it (e.g. gold with near-black text) often reads more elegant than a mid-tone fill with white text.
- At most one **secondary** accent, for status or highlights. Never use both at full strength side by side.
- Status colours (success, warning, danger) are desaturated too, and always paired with a word or icon.
- Chrome (sidebar, header) stays in the neutral ladder. Colour belongs to actions and content.

## 4. Imagery

- Artwork with bright paper or white backgrounds glows on dark. Show it at contained sizes (covers, thumbnails), or frame it, or lay a 6–12% dark overlay.
- Avoid large bright banners; they dominate a dark page.
- Album/cover art is the best source of colour in a dark music UI. Let it carry the palette.

## 5. Light theme from dark

Derive the light theme from the same roles, not the same values: invert the lightness ladder (bg lightest, surfaces slightly darker), deepen and re-saturate accents, re-check every pair.

## 6. Verify

Run the bundled checker on every pair you use:

```bash
node .claude/skills/dark-ui-system/scripts/contrast.mjs "#f3ede4 on #16131a" "#a89e94 on #1d1a22" "#16131a on #e3b04b"
```

It prints the WCAG ratio and AA/AAA pass for normal and large text. Fix any pair below 4.5:1 for body text or 3:1 for large text and UI controls before shipping.

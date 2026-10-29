# Design: Night mehfil

An evening music gathering lit by diya lamps. Chosen with the `design-direction` skill (scored 24/25 against "Kansa studio" 17 and "Ghat at night" 19). Palette built and contrast-checked with `dark-ui-system`; screens follow `music-app-ux`; reviewed with `visual-qa`.

## Principles

- **The artwork is the colour.** Madhubani paintings (song covers, tool art) carry the palette; the interface stays quiet around them.
- **One gold per view.** Lamplight gold marks the page's primary action only. Everything else is neutral surfaces and ink.
- **Task first.** Home opens with the composer, then the user's own songs. No decorative hero banners.
- **Dark is the default.** Light is derived from the same roles.

## Tokens (`app/globals.css`)

| Role | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#16131a` | `#f7f5f2` | page |
| `--sunken` | `#110e14` | `#efebe6` | sidebar |
| `--surface-1` | `#1e1a22` | `#ffffff` | rows, hover |
| `--surface-2` | `#26212b` | `#ffffff` | composer, popovers, active nav |
| `--surface-3` | `#302a35` | `#e9e4de` | selected chips, avatars |
| `--ink` | `#f2ece3` | `#1c1820` | primary text |
| `--ink-2` | `#bcb2a6` | `#4c4550` | secondary text |
| `--ink-3` | `#9b9186` | `#6e6672` | hints, timestamps (≥ 4.5:1 on every surface) |
| `--gold` / `--on-gold` | `#e3b04b` / `#1b1407` | `#8f5f0f` / `#ffffff` | primary action |
| `--sindoor` | `#e07a62` | `#b3402c` | errors, failed songs |
| `--success` | `#8cc08a` | `#3f7a3e` | success |
| `--hairline` | white 8% | ink 10% | borders |

Check new pairs with `node .claude/skills/dark-ui-system/scripts/contrast.mjs "#fg on #bg"`.

## Festival gradients (user request, 2026-10-29: "beautiful gradients like Suno")

Saffron, sindoor-rose and violet, the colours of Holi and the Madhubani palette. These override the "no gradients" rule in the design-direction skill for this product.

| Utility / token | Value | Use |
|---|---|---|
| `bg-cta` / `--cta` | `#f6b444 → #f2785a → #ee6a8a` | the primary button (`variant="brand"`), play buttons. Text is `--on-cta` `#1b1407` (≥ 6:1 across the gradient) |
| `bg-aurora-glow` | three soft radial lights, faded with a mask | fixed behind the top of Home; stronger in dark (`--aurora-strength`) |
| `gradient-edge` | 1px saffron → rose → violet border | the composer |
| idea cards | deep pairs from `#8c2a55 #a8431a #c2366c #6d3fd9 #3b2a8f #0b6b66` | white text, all ≥ 4.5:1 |
| song covers | blurred copy of the cover behind each tile | glow on hover and while playing |

## Landing page: "Madhubani vinyl"

Chosen with `design-direction` (22/25, over "Sound orb" 19 and "3D dholak" 21). Public pages are **dark only** (`app/(marketing)/layout.tsx` wraps them in `.dark`).

- **Signature:** a three.js vinyl record (`components/landing/vinyl-scene.tsx`) with a Madhubani cover as its label, orbiting saffron/rose/violet lights, sound-wave particles, cursor tilt and scroll turn. Loaded client-only; pauses off screen; still frame under reduced motion; fewer particles on phones, where it sits above the headline.
- **Effects** (`components/landing/motion.tsx`): `Reveal` (scroll-in), `Parallax`, `Typewriter` (genre in the headline), `TypedPrompt`, `CursorGlow` (mouse only), `TiltCard`, `ScrollProgress`. All respect `prefers-reduced-motion`.
- **Sections:** hero with facts, genre marquee, three tools, three steps, stems mixer, "Made for Bhojpuri" chips with a parallax cover wall, pricing (live catalogue), FAQ, gradient call to action, big footer with the giant gradient wordmark.
- Copy states only what the product does — no invented user counts or testimonials.

## Type

- **Rozha One** (display, Devanagari-ready): page titles and section headings, 28px and up only.
- **Hind** (body, Devanagari-ready): everything else; 15–16px body.

## Layout rules

- Shell: 240px sunken sidebar (wordmark, raised Create, nav, credits, account, small print), thin transparent header, persistent bottom player. No coloured chrome, no in-app footer.
- Home: greeting + title + one-line credits, gradient-edged composer, "Start from an idea" gradient cards, then small glowing covers (2/3/4/6 columns), in-progress songs first.
- Covers are square, `rounded-lg`, with the duration badge bottom-right and play on hover. The playing song gets a gold ring.
- Radius: 10px base; composer 16px.

## Don't

- Banners or large images on the dashboard (rejected twice).
- Coloured sidebars, headers or footers; gradients belong to the page atmosphere, the primary action and idea cards only.
- More than one gradient button competing in a view.
- `A · B · C` strings, `→` on links, all-caps eyebrows, single highlighted words in headlines.

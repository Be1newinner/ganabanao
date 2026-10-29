---
name: visual-qa
description: Screenshot-driven design review loop — capture real pages at desktop and mobile in each theme (bundled Playwright script, or Claude in Chrome), critique against a fixed rubric (first impression, hierarchy, colour, typography, composition, density, affordance, accessibility) with severities, fix, and re-shoot until no major issues remain. Use after building or changing any UI, and whenever the user says a screen looks wrong.
---

# Visual QA

Never judge a design from code. Look at it, at real sizes, in every theme, with real data.

## 1. Capture

Use the bundled script (system Chrome via `playwright-core`, no browser download):

```bash
# one-time, in a scratch folder inside the project (e.g. temp/tools)
npm i playwright-core
node .claude/skills/visual-qa/scripts/shots.mjs \
  --base http://localhost:3000 --out temp/shots/<tag> \
  --cookies temp/tools/demo.jar --themes dark,light /dashboard /create
```

It saves desktop (1440) full-page and mobile (390) viewport shots for each theme. Use seeded data that covers every state (empty, in progress, done, failed). For interaction checks (menus, dialogs, hover), use Claude in Chrome on the live page.

## 2. Critique

Score each dimension `pass` / `minor` / `major`, with the evidence you saw:

1. **First impression (2 seconds):** what does the eye land on? Is that the most important thing? What is the emotional read — does it match the brief's three adjectives?
2. **Hierarchy:** one primary action per view; squint test; at least 1.5× size steps between levels.
3. **Colour:** palette limited to tokens; chrome neutral; accent only on actions/status; no vibrating saturated pairs; run `dark-ui-system/scripts/contrast.mjs` on every text pair.
4. **Typography:** two families max, clear scale, line length under ~80 characters, no orphaned display words.
5. **Composition:** alignment to a grid, consistent gutters, no accidental empty regions, nothing stretched to fill.
6. **Density:** related things grouped, nothing crammed, no huge dead areas.
7. **Affordance:** clickable things look clickable; states (hover, focus, disabled, loading) exist.
8. **Accessibility:** visible focus, 44px touch targets on mobile, reduced motion respected, alt text on meaningful images.
9. **Generic tells:** check the `design-direction` default list; any hit is at least `minor`.

## 3. Report and fix

Write the findings as a table: *finding — severity — fix (specific: token, size, element)*. Fix all `major` items, then the `minor` ones that are cheap. Re-shoot and re-score. Stop when there are no `major` items, and show the user the final screenshots.

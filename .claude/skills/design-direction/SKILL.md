---
name: design-direction
description: Turn a product brief into three distinct, subject-rooted visual directions (palette, type, layout, signature element), screen them against generic "AI-generated" defaults, score them, and pick one to build. Use before designing or redesigning any screen, theme or brand look, or when the user says a design looks fake, generic, empty, cheap or "not beautiful".
---

# Design direction

Decide *what the design is* before writing any CSS. A screen fails when nobody chose its point of view: every element gets the same weight, colour is decoration, and the result looks like every other generated page.

## 1. Pin the brief (write it down, 5 lines)

- **Product and job:** what the screen is for, in one sentence. ("Artists start a new Bhojpuri song and get back to songs they made.")
- **Audience:** who, on what device, in what mood. Creative tools are used for long sessions, often at night.
- **Subject vernacular:** the materials, places, objects and rituals of the subject. These are the only source of distinctive choices. List at least six concrete nouns.
- **Hard constraints:** theme default, brand assets, accessibility floor, things the user has already rejected (copy their words exactly).
- **One-line feeling:** three adjectives the user used or would agree with.

If the user rejected earlier work, list *why* in their words and treat each reason as a constraint.

## 2. Generate three directions that genuinely differ

Each direction gets:

| Part | Content |
|---|---|
| Name | Two or three words that evoke the subject, not the style ("Night mehfil", not "Modern dark") |
| Palette | 5–6 named hex values with roles: base, surface, ink, muted, primary action, one secondary |
| Type | One or two families with roles and a reason rooted in the subject |
| Layout | A one-sentence concept and an ASCII wireframe of the key screen |
| Signature | The ONE memorable element. All boldness goes here; everything else is quiet |
| Imagery | What artwork appears, where, and at what size |

Make them differ on at least two of: value (dark/light), temperature, density, where the signature lives, type voice.

## 3. Screen against generic defaults

Reject or revise any direction that relies on these without a subject-specific reason:

1. Cream background with a serif display and terracotta/clay accent.
2. Near-black background with one bright acid or neon accent.
3. Broadsheet hairlines, zero radius, dense newspaper columns.
4. SaaS card kit: identical rounded cards, same shadow, gradient washes or glows as decoration.
5. Template chrome: all-caps tracked eyebrows, `A · B · C` meta strings, `→` appended to links, one highlighted word in a headline, monospace for small labels, `01/02/03` markers on non-sequences.
6. A large hero image or banner whose only job is decoration (it pushes the real task below the fold).
7. Colour used on chrome (sidebar, header) at full saturation so it competes with the content.

Say what you changed and why for each hit.

## 4. Score and choose

Score each direction 1–5 on: **fit to subject**, **fit to the user's stated taste and rejections**, **task focus** (does the first screen help the user act?), **distinctiveness**, **buildability** with the existing stack and assets. Pick the highest total; break ties toward task focus.

Present the winner with its tokens and wireframe. If the user has strong taste and the top two are close, show both briefly and ask; otherwise build the winner and show screenshots.

## 5. Hand-off

Write the chosen direction as a short design note (tokens, type scale, layout rules, signature, do/don't list) so later screens stay consistent. Then use `dark-ui-system` for the palette, `music-app-ux` for screen structure (music products), and `visual-qa` to review what you built.

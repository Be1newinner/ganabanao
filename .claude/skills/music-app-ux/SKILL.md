---
name: music-app-ux
description: Screen structure and UX patterns for music creation and listening apps, especially AI song generators — app shell, dashboard/home composition, create composer, library rows and grids, generation states (queued, position, generating, failed with refund), persistent player, stems, credits, empty states and copy. Use when designing or reviewing any screen of a music, audio or AI-song product.
---

# Music app UX

Music apps are used in long sessions, by ear as much as by eye. The best ones keep three things always within reach: **make**, **listen**, **find**. Everything else is secondary.

## App shell

- **Left sidebar** (desktop, 232–264px), quiet neutral surface, slightly darker than the page. Order: wordmark → primary "Create" action → navigation (Home, Create, Library, then account items) → a small credits meter → account menu. Legal links and the "AI-generated" note can live in small text at the very bottom.
- **No coloured chrome.** The sidebar and header stay neutral; colour belongs to artwork and the primary action.
- **Header** is thin or absent. On desktop it only needs page-level actions; on mobile it carries the menu button, wordmark and credits.
- **Persistent bottom player** across pages: cover, title, play/pause, seek, time, volume, download. It must never cover content (pad the page when it shows).
- **No marketing footer inside the app.**

## Home / dashboard composition

Order by what the user does next, not by what the product wants to show:

1. **Composer first.** A single prominent prompt box ("Describe a song…") with the mode switch (e.g. *Write a song* / *Similar song*), a few suggestion chips, the cost, and one primary button. Pressing it either creates directly or opens the full form prefilled. This replaces a decorative hero.
2. **Recent work as artwork.** A row/grid of the latest songs as square covers with title and status — the most beautiful thing on the page should be the user's own songs. Play on hover/tap.
3. **In progress** songs are visible at the top of recents with live status and queue position.
4. Credits and plan as a compact line or meter, not big stat cards.
5. Optional: inspiration (sample songs, prompt ideas) below the fold.

A first-time user sees the composer, two or three example prompts and one sample song to play — not an empty grid.

## Song anatomy

- **Cover** (square, art fills it), **title** (one line, truncate), **description** in plain words ("Kajri, romantic, female voice"), **duration**, **created time** (tertiary).
- Hover/focus reveals play on the cover; the row/tile itself opens details or plays.
- Actions: one visible (Download) plus an overflow menu (Rename, Stems, Delete). Destructive actions confirm in an in-app dialog.
- Grid for browsing (home, library "covers" view); list for managing (library default on desktop).

## Generation states

| State | Show |
|---|---|
| Queued | "Number 3 in line, about 4 minutes" — position and estimate, never just a spinner |
| Generating | A calm animated indicator on the cover and "Being made now" |
| Done | Play immediately; subtle highlight of the new song |
| Failed | Plain reason + "Your credits have been returned", and a retry path |

Refresh status in the background only while something is running.

## Create form

- Lyrics and style are the core; put them first and largest. Section-tag helpers ([Verse], [Chorus]) as small buttons.
- Style choices as selectable chips, not dropdowns, so options are visible.
- Show the credit cost on the button; disable with a reason when credits are short.
- After submit, stay on the page and show the new song appearing in a side list — let users queue several ideas in a row.

## Copy

Plain, active, sentence case. Name things by what the user does: *Write a song*, *Make a similar song*, *Download*, *Stems*. Errors say what happened and what to do; they don't apologise.

## Mobile

Bottom player above a bottom-safe area; sidebar becomes a sheet; composer stays at the top of Home; covers in a 2-column grid.

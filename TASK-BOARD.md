# Task Board

A lightweight Kanban-style board, version-controlled alongside the code.

This board covers the **website and the online game** (the `gh-pages` line): `index.html`,
`privacy.html`, `terms.html` and `online/`, where `online/index.html` loads the ES modules under
`online/js/` (`app.js`, `rules.js`, `computer.js`, `board.js`, `chip.js`, `lessons.js`, `i18n.js` and
the string tables in `strings/`). Engine and design work lives on `main`'s own `TASK-BOARD.md`, and the
game's design guide is `docs/online/` on `main`. The two boards are independent and are not synced.

## Stages

| Stage | Meaning |
| --- | --- |
| **Wish List** | Ideas worth keeping, not yet committed to |
| **To Do** | Agreed upon, ready to be picked up |
| **In Progress** | Actively being worked on |
| **Won't Do** | Considered and consciously declined |

---

## Wish List

### Installable / offline

- Service worker caching the static asset set (`online/index.html`, `css/tikitala.css`, the modules
  in `js/` and `js/strings/`, `tikitala-dot-com.svg`, `icons/`, `images/`) for offline play. The game
  is already 100% client-side, and the home screen already says playing the computer needs no
  connection, which is only true once the page is loaded
- Custom install prompt (`beforeinstallprompt`) shown after a completed game, not on load

### Online 2-player (sketch, design before building)

- Decide the hosting question first, explicitly: GitHub Pages is static, so there is no server on the current host. Any real-time option means a new dependency and a new deploy target
- Phase 1 (no backend): async "play by link". Encode the game in the URL fragment and each player sends a link back. The game in `online/js/rules.js` is already plain JSON (it is what gets saved to `localStorage`), and `main`'s `docs/hashcodes.md` packs a whole board into one 8-byte int
- Phase 2 (no backend): WebRTC peer-to-peer with a manual offer/answer code exchange, for two people already in contact
- Phase 3 (backend): implement `api-doc/5visible-api.yml`. The spec already defines `GET /games` and `PATCH /games` over a `board-view` that hides what a player shouldn't see, and `main`'s `golang/board.go` is a working engine. Needs a host, matchmaking/lobby and reconnect handling
- Cross-cutting: nickname entry, an invite flow (the end-of-game Share button shares a result and a link to the game, not a game), spectator-proof state (never send buried chips to the client), rematch across devices

### Polish

- Sound effects with a mute toggle (pick, place, win), off by default
- Undo after a chip is placed, for pass & play. Today a chip can be put back only before it is placed, and only when lifting it revealed nothing (`canPutBack` in `rules.js`); the game says "No take-backs" otherwise, so decide whether undo fits that rule first
- Move history / replay
- Dark mode via `prefers-color-scheme`
- Portuguese versions of `privacy.html` and `terms.html`. The game links to the English pages from its home screen, marked `hreflang="en"`

---

## To Do

### Page fundamentals

- Fix heading hierarchy on `index.html`. It uses `<h1>` five times as a style, not as structure

### SEO

- Write real indexable rules text. The rules on `index.html` are image cards, six of them with the placeholder alt text `"initial setup"`, and there is no crawlable prose version of the rules
- Give `online/index.html` real text in its HTML. Every word on screen is filled in by `js/i18n.js` from the string tables, so the served page has empty headings and buttons and only the `<noscript>` note as text. Putting the English home-screen text in the markup as a fallback would let crawlers and link previews that don't run JavaScript read it

### Accessibility

- Check the game end to end with VoiceOver, TalkBack and a keyboard only. The pieces are in place (board spots are buttons with labels, locked and full spots say why, every move is announced in a live region), but they haven't been confirmed together on real assistive tech

### AdSense readiness

All of these gate approval.

- Add an About/contact page or section. AdSense reviews reject thin, contactless sites
- Add a consent solution for EEA/UK traffic (Google's CMP requirement) before any ad code goes live, and describe the ad cookies in `privacy.html` first, as it promises
- Add `/ads.txt` once the publisher ID exists
- Decide and document ad slot placement: banner zones on `index.html`, and on `online/index.html` only where the design guide already allows links out (the home and end-of-game screens). Nothing during a turn, no interstitials over a game in progress, nothing that reflows the board
- Add the AdSense verification snippet and submit the site

---

## In Progress

(empty)

---

## Won't Do

- Adding a build step, bundler or framework to the online game; conflicts with the design guide's "plain HTML, CSS and JavaScript" principle (`docs/online/README.md` on `main`)
- Accounts, logins or player profiles; out of proportion for a free browser game
- Moving website work onto `main`; the README is explicit that website changes branch off `gh-pages`

---

## Usage Notes

- Move items between sections as work progresses. Completed work lives in `git log`, not here.
- Keep **In Progress** short (ideally 1–2 items at a time).
- Add a brief note or issue reference next to items when helpful, e.g. `- Fix tile color bug (#12)`.
- Commit this file with the same PR/commit as the work it describes.

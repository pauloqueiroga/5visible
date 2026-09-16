# Task Board

A lightweight Kanban-style board, version-controlled alongside the code.

This board covers the **website and the online game** (the `gh-pages` line): `index.html`,
`online/index.html` and `online/js/tikitala-stage.js`. Engine and design work lives on `main`'s own
`TASK-BOARD.md`. The two boards are independent and are not synced.

## Stages

| Stage | Meaning |
| --- | --- |
| **Wish List** | Ideas worth keeping, not yet committed to |
| **To Do** | Agreed upon, ready to be picked up |
| **In Progress** | Actively being worked on |
| **Won't Do** | Considered and consciously declined |

---

## Wish List

### Installable / PWA

- `manifest.webmanifest` with name, `display: standalone`, theme/background color, and 192/512 + maskable icons derived from `images/tikitala-logo-001.png`
- Service worker caching the static asset set (`online/index.html`, `js/stage.web.min.js`, `js/tikitala-stage.js`, both sprite sheets) for offline play. The game is already 100% client-side, so offline needs no logic changes
- `apple-touch-icon` and iOS standalone meta tags
- Custom install prompt (`beforeinstallprompt`) shown after a completed game, not on load

### CPU opponent (sketch, design before building)

- Extract the `Game` function out of `js/tikitala-stage.js` into its own file so it can be driven headlessly. It's already renderer-agnostic via the `ui` callbacks, so this is a file split, not a rewrite
- Add `legalMoves()` to enumerate `(from, to)` pairs using the existing `canGive`/`canTake`
- Model hidden information honestly: an engine reading `stack.chips[]` directly sees under the top chip, which a human can't. The CPU needs its own memory of what it has seen, so difficulty becomes *how much it remembers*, not how much it cheats. This is the core design decision
- Three levels: Easy (random legal move), Medium (greedy: maximize own chips showing, respect the blocked stack), Hard (shallow search plus decaying memory of buried chips)
- UI: mode picker on the game page (2-player hotseat / vs CPU), pick your color, CPU move delay and animation so moves are readable
- Reuse the state ideas already documented on `main`: `docs/hashcodes.md` (whole board in one 8-byte int, good for transposition tables) and `docs/mechanics.md`

### Online 2-player (sketch, design before building)

- Decide the hosting question first, explicitly: GitHub Pages is static, so there is no server on the current host. Any real-time option means a new dependency and a new deploy target
- Phase 1 (no backend): async "play by link". Encode board state in the URL fragment using the `docs/hashcodes.md` scheme, each player sends a link back. Works today, costs nothing, and forces the state serialization every later option needs anyway
- Phase 2 (no backend): WebRTC peer-to-peer with a manual offer/answer code exchange, for two people already in contact
- Phase 3 (backend): implement `api-doc/5visible-api.yml`. The spec already defines `GET /games` and `PATCH /games` over a `board-view` that hides what a player shouldn't see, and `main`'s `golang/board.go` is a working engine. Needs a host, matchmaking/lobby and reconnect handling
- Cross-cutting: nickname entry, share/invite flow, spectator-proof state (never send buried chips to the client), rematch

### Polish

- Sound effects with a mute toggle (pick, place, win), off by default
- Undo for hotseat play (single level, before the next pick)
- Keyboard and screen-reader access. The board is canvas-only today, so a parallel DOM representation with ARIA is the only real path
- Save an in-progress game to `localStorage` and offer to resume (the tutorial already uses `localStorage` for `tikitala-tutorial-seen`, so the pattern exists)
- Move history / replay
- Dark mode via `prefers-color-scheme`
- Clean up implicit globals in `js/tikitala-stage.js`: `count0`/`count1` in `checkState()` and the `stackX`/`stackY` arrays all leak onto `window`

---

## To Do

### Page fundamentals

- Add `<!DOCTYPE html>` and `<html lang="en">` to `index.html` and `online/index.html`. Both currently open with a bare `<html>`, which puts browsers in quirks mode
- Add `<meta name="description">`, `<link rel="canonical">` and a favicon set to both pages
- Add `og:title` / `og:description` / `og:url` and `twitter:card` tags. The root page has only `og:image*`, and `online/index.html` has no social tags at all
- Remove `user-scalable=no, maximum-scale=1.0` from `online/index.html`'s viewport. It blocks pinch-zoom and fails WCAG 1.4.4
- Add the existing `gtag` snippet (`G-1MG5GMQFNP`, already in `index.html`) to `online/index.html` so online play is actually measured
- Fix heading hierarchy on `index.html`. It uses `<h1>` five times as a style, not as structure

### SEO

- Add `/robots.txt` and `/sitemap.xml`. Neither exists; the site is `www.tikitala.com` per `CNAME`
- Add `VideoGame` JSON-LD structured data to `index.html`: name, description, `playMode`, `numberOfPlayers`, `gameLocation` pointing at `/online/`
- Write real indexable rules text. The rules on `index.html` are image cards whose alt text is mostly the placeholder `"initial setup"`, and there is no crawlable prose version of the rules
- Give `online/index.html` its own `<h1>` and a short intro paragraph above the canvas. The page currently offers a crawler zero text

### AdSense readiness

All of these gate approval.

- Add `/privacy.html` covering Google Analytics and AdSense cookies, and `/terms.html`
- Add an About/contact page or section. AdSense reviews reject thin, contactless sites
- Add a consent solution for EEA/UK traffic (Google's CMP requirement) before any ad code goes live
- Add `/ads.txt` once the publisher ID exists
- Decide and document ad slot placement: banner zones on `index.html`, and *outside* the canvas on `online/index.html`. No interstitials over an in-progress game, nothing that reflows the board
- Add the AdSense verification snippet and submit the site

### Player experience

- Add a visible **New Game / Restart** button. Today the only way to restart is to click any stack after a win (`game.ready()` returns false once `turn = -1`), which is undiscoverable
- Replace "Player 0" / "Player 1" with human labels and a color legend
- Show a live score ("chips showing: 3 – 2") so players can see progress toward 5 without counting
- Add a proper win screen naming the winner, with a Play Again action, instead of only the tween-based highlight in the `win` UI callback
- Explain *why* a stack is grayed out when tapped (3-chip limit vs. opponent's last move). The rule lives in `canTake`/`canGive` but is invisible to a new player
- Add a link back to `tikitala.com` from the game page, outside the tutorial's last step

---

## In Progress

(empty)

---

## Won't Do

- Adding a build step, bundler or framework to the online game; conflicts with the constraints in `online/CLAUDE.md`
- Accounts, logins or player profiles; out of proportion for a free browser game
- Moving website work onto `main`; the README is explicit that website changes branch off `gh-pages`

---

## Usage Notes

- Move items between sections as work progresses. Completed work lives in `git log`, not here.
- Keep **In Progress** short (ideally 1–2 items at a time).
- Add a brief note or issue reference next to items when helpful, e.g. `- Fix tile color bug (#12)`.
- Commit this file with the same PR/commit as the work it describes.

# Task Board

A lightweight Kanban-style board, version-controlled alongside the code.

## Stages

| Stage | Meaning |
| --- | --- |
| **Wish List** | Ideas worth keeping, not yet committed to |
| **To Do** | Agreed upon, ready to be picked up |
| **In Progress** | Actively being worked on |
| **Won't Do** | Considered and consciously declined |

---

## Wish List

- Online: play a friend online (invite link and game code), see [`docs/online/screens.md`](docs/online/screens.md)
- Online: play someone new (matchmaking)
- Online: offline play as a PWA (local fonts, service worker)
- Online: drag and drop, alongside tap to pick and tap to place

---

## To Do

- Online release 2: play the computer (levels and memory in [`docs/online/interaction.md`](docs/online/interaction.md#the-computer-opponent))
- Online: remove the Stage.js game files from the gh-pages `online` folder (`js/stage.web.min.js`, `js/tikitala-stage.js`, `tikitala-sprites.png`, `tikitala-turn-step-sprites.png`, `board-*.png`)

---

## In Progress

- Online release 1: pass & play, learn by playing, portrait and two-column layouts (gh-pages `online` folder; rules tests in [`tests/online/`](tests/online/rules.test.mjs))

---

## Won't Do

(nothing for now)

---

## Usage Notes

- Move items between sections as work progresses. Completed work lives in `git log`, not here.
- Keep **In Progress** short (ideally 1–2 items at a time).
- Add a brief note or issue reference next to items when helpful, e.g. `- Fix tile color bug (#12)`.
- Commit this file with the same PR/commit as the work it describes.

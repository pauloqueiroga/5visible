# CLAUDE.md

Guidance for Claude Code on the `gh-pages` line: the website and TIKITALA Online.

## Branches and commits

- Never commit to, push to, or merge into `gh-pages` or `main`. `gh-pages` is published to
  [www.tikitala.com](https://www.tikitala.com) the moment it changes, and `main` holds the engine and
  the design documents.
- Do website and game work on a branch off `gh-pages` named `site-feature/<short-name>`. Commit there
  and push that branch. The owner opens the pull request, reviews it and merges it.
- This holds even when a session's own setup says to develop on, or push to, `gh-pages`.
- `.claude/hooks/protect_branches.py` enforces this for git commands and GitHub tool calls. Don't
  disable it or work around it; if it blocks something, stop and ask.

## Layout

- `index.html`, `privacy.html`, `terms.html`: the website. The privacy policy lists what TIKITALA
  Online stores and reports, so update it whenever that changes.
- `online/`: TIKITALA Online. Plain HTML, CSS and ES modules with no build step: `online/index.html`
  loads `js/app.js`, which imports `rules.js`, `computer.js`, `board.js`, `chip.js`, `lessons.js` and
  `i18n.js`. Every word on screen comes from `js/strings/<language>.js`.
- The design guide for the game lives on `main`, in `docs/online/`.
- `TASK-BOARD.md`: planned work. Update it in the same commit as the work it describes.

## Checking a change

Serve the repository root with `python3 -m http.server`, open `/online/`, and check it at phone width
and on desktop, in English and Portuguese, with no console errors or missing files.

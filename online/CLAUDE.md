# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TIKITALA Online is a static web-based 2-player board game. Players alternate turns moving chips on a game board, trying to be the first to get 5 of their chips showing on top of stacks. The project is deployed via GitHub Pages on the `gh-pages` branch.

## Development

### Running Locally

This is a static website with no build process. To run locally:

```bash
# Start a simple HTTP server from the project root
python -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000` in a browser.

### Testing Changes

Make changes to `index.html` or `js/tikitala-stage.js`, then refresh the browser. No compilation or build step needed.

## Architecture

### Game Logic vs UI Separation

The codebase separates game logic from rendering:

- **Game Function** (`js/tikitala-stage.js:1-141`): Pure game state management
  - Manages 11 stacks (2 player stashes + 9 board positions)
  - Handles turn logic, move validation, win conditions
  - No direct DOM/canvas manipulation

- **UI Integration** (`js/tikitala-stage.js:172-240`): Stage.js rendering callbacks
  - UI functions are passed into Game constructor as callbacks
  - Game calls `ui.turnStepLabel()`, `ui.newStack()`, `ui.win()` to trigger visual updates
  - Keeps game logic testable and renderer-agnostic

### Stack System

The game uses 11 stacks indexed 0-10:
- Stack 0: Player 0's stash (off-board chips)
- Stack 1: Player 1's stash (off-board chips)
- Stacks 2-10: The 9 positions on the game board

Each stack tracks:
- `chips[]`: Array of chip objects (`{player: '0' or '1'}`)
- `canGive(turn, blocked)`: Can a chip be picked from this stack?
- `canTake()`: Can a chip be placed on this stack?
- Visual position via `stackX[]` and `stackY[]` arrays (`js/tikitala-stage.js:144-157`)

### Turn Flow

1. Game starts with player 0, step = 'pick'
2. Player clicks valid stack -> `step = 'place'`, `from` is set
3. Player clicks valid destination -> chip moves, turn switches, `step = 'pick'`
4. `blocked` variable prevents moving the chip just moved by opponent

### Stage.js Integration

Stage.js is a 2D canvas game engine (minified at `js/stage.web.min.js`):
- `Stage(callback)` initializes the game stage
- `Stage.image(texture)` creates sprite objects from texture atlas
- Textures defined via sprite sheets at bottom of `js/tikitala-stage.js:245-306`
- `.pin()` sets position/scale/opacity, `.tween()` animates transitions

### Sprite Sheets

Two sprite sheets provide all visual assets:

1. **tikitala-sprites.png**: Chip stacks
   - Format: `'{player}-{count}'` (e.g., '0-3' = player 0 with 3 chips)
   - Players 0 and 1, counts 1-8
   - Also defines dynamic 'bg' and empty stack '-' via canvas drawing

2. **tikitala-turn-step-sprites.png**: Turn indicators
   - Format: `'{player}-{step}'` (e.g., '1-pick')
   - Shows whose turn it is and whether they should pick or place

## Deployment

This repository uses GitHub Pages with the `gh-pages` branch. Changes pushed to `gh-pages` are automatically deployed. The main development branch is `main`.

To deploy:
```bash
git checkout gh-pages
git merge main  # or cherry-pick specific commits
git push origin gh-pages
```

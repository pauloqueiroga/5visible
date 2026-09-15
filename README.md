# 5-Visible (TIKITALA)

**5-Visible** is the working name of [TIKITALA](https://www.tikitala.com), a two-player tabletop game of
strategic thinking and sharp memory. This repository holds the game logic, the design documentation and
the thinking behind the game.

## Links

- [Play online](https://www.tikitala.com/online/)
- [www.tikitala.com](https://www.tikitala.com)

## Rules of the game

- 2 players (`0` and `1`)
- 8 bricks per player
- Board has 9 positions for stacks of bricks to be formed
- Each stack can have up to 3 bricks
- Players cannot peek/see under the topmost brick on each stack
- Initial board setup contains 4 stacks of 1 brick, 2 for each player
- On each round, a player has to make one and only one move:
  - Add one of their own bricks to the board, on any stack
  - Move one brick (their own or opponent's) from one stack to another, except:
    - Players cannot move the brick most recently moved by their opponent
- Wins the player with 5 of their bricks showing on the board

## Branches

| Branch | Contents |
| --- | --- |
| `main` | Game logic, design and thoughts documentation (this branch) |
| `gh-pages` | Permanent branch holding the website and the online playable game, deployed to [www.tikitala.com](https://www.tikitala.com) |

Keeping the two apart means the website can be published without touching the engine, and the engine can
evolve without redeploying the site. Website changes belong in a branch off `gh-pages`, not `main`.

## Task board

Planned and in-flight work lives in [`TASK-BOARD.md`](TASK-BOARD.md), a lightweight Kanban board
version-controlled alongside the code. Items move between **Wish List**, **To Do**, **In Progress** and
**Won't Do**; finished work isn't parked in a "Done" column, it lives in `git log`. The board is meant to
travel with the changes, so update it in the same commit or pull request as the work it describes.

# TIKITALA Online: design guide

This folder is the source of truth for how the online version of TIKITALA looks, reads and behaves.
The design canvas shows the screens; these documents record the decisions behind them, so that the
implementation (and any future version) can follow them without guessing.

The engine documents call the pieces *bricks*. The product, the physical game and this guide call them
*chips*. Both words mean the same thing.

## Design principles

1. Chips look like the physical chips: black rim, white insert, a `0` or a `1`, "tikitala.com" around the edge. Every chip has the same black rim, so the height of a stack is visible but what is buried in it is not. Nobody peeks.

2. Always say what to do next. Every turn state has one instruction in plain words, and the screen only highlights moves that are legal right now.

3. Memory is the hero. The game never shows what is under a stack, except at the two moments the physical game would: when you lift a chip off a stack, and when the game ends and every stack is flipped open.

4. Phone first, any screen. Portrait phone is the reference. Every layout must also work in landscape and on desktop.

5. Plain HTML, CSS and JavaScript, with no frameworks and as few dependencies as possible.

6. Point to the table. Links to the physical game and to Ko-fi appear when the player is at rest (the home screen, the end of a game), never during a turn.

7. First online release is Pass and Play only. Computer, online match and play someone new are released one by one in future releases.

8. "Put it back" returns the player to "Your move" to pick again; dropping a chip back on its own stack (skipping the turn) is not allowed.

## Open decisions

Things the design leaves open, to be settled by the project owner:

- Home screen tagline (currently a placeholder)
- Ko-fi page URL for the win screen
- Names and number of computer levels (screens show "Clever" as an example)
- Labels for pass & play, where neither player is "you"
- Landscape and desktop layouts (not yet drawn)

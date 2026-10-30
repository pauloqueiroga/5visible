# Interaction

[Back to the design guide](README.md)

How each rule of TIKITALA shows up on screen. For which stacks can be dragged from or dropped on in
each state, the reference is [mechanics.md](../mechanics.md); this document covers what the player sees.

## A turn, step by step

1. **Your move: pick up.** Everything you can pick up looks normal (idle). Anything you cannot pick up
   is faded or locked. Your stash tile has a dashed lime border.
2. **Place it.** The chip goes to the **hand tray** in your panel. The stack it came from gets the
   dashed "picked up here" ring. Every legal drop gets a pulsing lime ring. Everything else fades.
3. **Drop.** The chip settles onto the chosen stack and the turn passes.
4. **Their move.** The opponent's chip travels along a trail from where it came from to where it
   landed. The stack it landed on is locked for your next turn.
5. **The score updates** after every drop. When a player reaches 5 on top, the win screen opens.

Input: tap to pick, then tap to place. Dragging a chip from a stack onto a ring does the same thing and
can be added later, but tapping must always work (it is easier on small screens and with assistive
technology).

## What you can pick up

From the current code (`canGive`):

- Any stack on the board that has at least one chip,
- or your own stash, if it has chips left,
- **except** the stack your opponent dropped onto last turn. It shows a lock badge.

You can never pick up from your opponent's stash.

## Where you can drop

From the current code (`canTake`), plus one design rule:

- A board stack with fewer than 3 chips. Full stacks fade and get a small "FULL" tag.
- An empty spot, **unless** the chip in your hand was the only chip in its stack. Moving a lone chip to
  an empty spot would only shuffle the table, so empty spots fade instead of getting a ring.
- Never a stash.
- Never the stack the chip came from. Returning it there is "putting it back" (below), not a move.

The locked stack can still be dropped onto; it only cannot be picked up from.

**Defect in the current code:** `canTake` lets a chip be dropped back onto its own stack, which
passes the turn without changing anything. Skipping a turn this way must not be possible in the next
version: the stack a chip came from is never a legal drop.

## Putting a chip back

You can change your mind only if picking the chip up revealed nothing. Putting a chip back is not a
move: the chip returns to where it was, nothing is locked, and the player is back at **Your move: pick
up** to choose again. The turn does not pass.

Tapping the "Put it back" button, the stack the chip came from or (for a stash chip) the hand tray all
put the chip back.

| Picked up from | Can put back? | What the panel shows |
| --- | --- | --- |
| Your stash | Yes | "Put it back" button, with "Nothing was revealed" |
| A stack of 1 on the board | Yes | "Put it back" button, with "Nothing was under it" |
| A stack of 2 or 3 | **No** | A dashed "No take-backs" box with a lock icon |

When a chip is lifted off a stack of 2 or 3, the chip underneath is now on top and visible, exactly as
on a real table. The stack keeps the "picked up here" ring and gets an "UNCOVERED" tag. The player has
seen what was under it, so the move must go ahead.

## Locked chips

- The stack the opponent last dropped onto shows a lock badge on its top chip.
- The lock lasts for one turn and then moves to wherever the opponent drops next.
- Its screen-reader label starts with "Locked: their last move".

## The opponent's move

- A dashed lime line with an ink outline runs from where the chip came from to where it landed, with an
  arrowhead. The dashes flow in the direction of the move.
- If the move uncovered a chip, that stack gets an "UNCOVERED" tag.
- The stack it landed on becomes locked.
- There are no text explanations or strategy hints during a game. The player follows the trail and
  remembers.

## Score

- Each panel shows five pips and "n / 5 ON TOP", counting the top chips on the board for that player.
  Stash chips never count.
- The count is checked only at the end of each move, after the drop. A chip uncovered halfway through
  a move never ends the game, and the pips do not change while a chip is in your hand.

## End of the game

- The win screen flips every stack open. Each stack's chips are shown as a staircase: the top chip at
  the top left and in front, each chip below it stepped right by 55% and down by 30% of the chip size,
  so the bottom chip ends at the bottom right and the numerals of buried chips stay visible.
- That reveal is the memory payoff, the moment players find out what they forgot. It needs no
  words: there is no summary of who buried what.

## The computer opponent

The computer plays fair: it sees only what a player at the table would see. It sees every top chip,
and it remembers buried chips the way a person does, imperfectly.

- **Memory.** Every chip it has seen is remembered. After every move, each buried chip it remembers
  has a chance of slipping its mind (the forget rate). Once a buried chip comes back to the top, it is
  seen and remembered again.
- **Guessing.** When it plans, it fills in the chips it has forgotten with guesses that fit what it can
  count: how many chips of each player are on the table. It tries several guesses and picks the move
  that does best on average, so forgotten chips lead to honest mistakes.
- **Levels.**

| Level | Forget rate per move | How it plays |
| --- | --- | --- |
| Friendly | 30% | 40% of its moves are random; otherwise it takes the best immediate result |
| Clever | 12% | Takes the best immediate result and avoids moves that hand you the win |
| Ruthless | 3% | Looks one move ahead and assumes you will reply with your best move |

The rates are starting points to tune by playing. In the prototype they are adjustable, and an option
marks, on the win screen, every buried chip the computer had forgotten.

## Game modes

| Mode | Notes |
| --- | --- |
| Against the computer | Works offline. Opponent named "Computer", with a level name under the title |
| Online, with a friend | The inviter is player 0 and moves first. The friend joins from the link, or types the code on the "Play a friend" screen. No account |
| Pass & play | Two players on one device. Nothing is hidden from either player, so no hand-over screen is needed. Panel labels are still to be designed |

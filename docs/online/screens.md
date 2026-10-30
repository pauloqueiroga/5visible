# Screens

[Back to the design guide](README.md)

The phone flow, in the order a new player meets it. Sizes are for the 390×844 reference.

## 1. Home

**Purpose:** say what TIKITALA is in one look, then get the player into a game.

- Lime ground. The TIKI TALA logo, centered, 216px wide.
- Tagline "Five on top wins" in Bebas Neue 42px, then the line "A 2-player game of strategy and
  sharp memory."
- Three decorative chips, as if dropped on the table.
- Release 2 has two choices, 64px tall:
  - **Play the computer** (primary, ink with lime text): "Offline. No connection needed." With a game
    in progress: "Continue your Clever game · 3–2", and a "New game against the computer" link under it.
  - **Pass & play** (secondary, pale lime with an ink border): "Two players on this device". With a
    game in progress: "Continue: Player 1's move · 3–2", and a "New pass & play game" link under it.
  - Later: **Play a friend online** (secondary): "Send a link. No sign-up."
- Text link: "New here? Learn in four moves", which opens the lessons.
- Footer: "Better on a real table." and a link to the chips at tikitala.com.

## 1b. Play the computer: choose a level

- Lime ground. Back button and "Play the computer".
- "You play 0 and go first. The computer sees what you see, and remembers buried chips the way people
  do: some better than others."
- Three level buttons, each with its name in Bebas Neue 30px and one line about it (see
  [interaction.md](interaction.md#the-computer-opponent)). Tapping one starts the game. The level played
  last is drawn in ink with a "LAST PLAYED" tag.
- On wide screens the three levels sit side by side.

## 2. Learn by playing

**Purpose:** teach the rules through four guided moves on a real board, not a slideshow.

- Ink header with "LESSON n OF 4", four progress bars and a "Skip" link.
- A chalk lesson card: title (Bebas Neue 36px) and one or two sentences.
- The board, with everything except the lesson's chips faded. An arrow shows the move; a chalk bubble
  ("Drop it here") points at the target.
- Footer: both players' score pips (a pip that is about to be lost is dashed), the chip in your hand
  on a small table tile, and one instruction.
- Lessons: (1) five on top wins, (2) bury their chip, (3) stacks hold three and you can't peek,
  (4) you can't touch their last move. The last lesson ends with **Play the computer**.

## 3. Your move: pick up

- **Header (ink):** menu, the TIKITALA wordmark with "vs Computer · level", help.
- **Opponent panel:** their mini stash on a table tile, "Computer · 1", "n chips left in stash", pips
  and "n / 5 ON TOP".
- **Table:** the board, every pickable stack idle, the opponent's last drop locked.
- **Your panel:** "Your move" (lime, Bebas Neue 42px); "Pick up a chip: any top chip on the table, or
  a new one from your stash."; your stash tile with a dashed lime border, "Stash", "n left · tap for a
  new chip"; "You · 0" with your pips.

## 4. Place it

Three variants, one for each place a chip can come from. In all of them, the panel's stash tile is
replaced by the **hand tray**: a table tile holding the chip in your hand, with "In your hand" and
where it came from. The tray has a neutral border, never lime. "Put it back" returns to screen 3 with nothing changed.

| Variant | Board | Copy | Right of the tray |
| --- | --- | --- | --- |
| **4a. From your stash** | Every stack with room gets a ring, including empty spots. Full stacks fade with "FULL" | "Tap a ringed spot. A stack holds 3 chips at most." | "Put it back" with "Nothing was revealed" |
| **4b. A lone chip from the table** | Its spot shows the dashed "picked up here" outline with an up arrow. Empty spots fade | "Tap a ringed spot. A lone chip can't move to an empty spot: that would only shuffle the table." | "Put it back" with "Nothing was under it" |
| **4c. Off a stack** | The stack shows its new top chip, a dashed ring and an "UNCOVERED" tag. Empty spots get rings | "You lifted it off a stack and saw what was under it, so it can't go back. Tap a ringed spot." | "No take-backs" box with a lock |

## 5. Their move, replayed

- The board just after the opponent's drop: the trail from origin to destination, an "UNCOVERED" tag
  where they revealed a chip, and the destination locked.
- Your panel returns to "Your move", with the score line ("Tied 4–4. Whoever reaches five first
  wins.") and your stash.

## 6. Win, and the big reveal

- Lime ground. "GAME OVER · n MOVES" at the top, a close button back to home.
- "You win" (Bebas Neue 84px), "5 on top. The computer had 3.", a decorative stack.
- **The big reveal:** a table-colored card, ink outline, "Top chip in front". A 3×3 grid of every
  stack opened as a staircase (see [interaction.md](interaction.md#end-of-the-game)), then the
  burying summary and "Did you remember them all?"
- **Rematch** (primary) and **Share** (secondary).
- An ink card with a photo of the real chips: "Play it on a real table" and "Get TIKITALA →".
- A Ko-fi link on a chalk button: "Buy me a coffee".

A losing screen follows the same layout, with "They win" and the same reveal.

## 7. Invite a friend

- Chalk ground. Back button and "Play a friend".
- Two seat cards: "You · 0 / You go first" with your chip, and "Friend · 1 / Waiting" with an empty
  spot and animated dots.
- The game code on a lime block (Roboto Mono 50px), with "Your friend taps the link, or types this code
  at tikitala.com/online."
- **Send invite link** (primary, opens the phone's share sheet), **Copy link**, **Show QR**.
- "OR", then **Join with a code**: "Got a code from a friend?", a 4-character code field (uppercase,
  monospaced) and a **Join** button. This is where the friend lands when they open tikitala.com/online
  without the link.
- **Play someone new**: "Get matched with another player".
- Footer: "No accounts, no downloads. The link opens the game in any browser."

## Pieces & states

The reference sheet for every chip state is on the design canvas; the written spec is in
[chip.md](chip.md#states).

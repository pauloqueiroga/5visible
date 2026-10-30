# Copy

[Back to the design guide](README.md)

## Voice

- **Short and direct.** Tell the player what to do: "Place it", "Tap a ringed spot."
- **Friendly, never cute.** The game is the fun part; the words stay out of its way.
- **Talk like players at a table.** "Bury", "uncover", "on top", "your move".
- **No strategy hints during a game.** Players work it out and remember for themselves.
- **Shouts in Bebas Neue, sentences in Barlow.** Headlines and button labels are set in Bebas Neue
  (which has capitals only); body text is in sentence case.
- **Digits, not words**, for chip counts and scores: "3 left", "4 / 5 ON TOP".

## Terminology

| Use | Meaning | Avoid |
| --- | --- | --- |
| chip | One playing piece | brick (fine in engine code), piece, token, coin |
| `0` and `1` | The two players, and their chips | player 1 and player 2, red and blue |
| stack | One or more chips on a spot | pile (except for the stash) |
| spot | One of the 9 places on the table | cell, slot, square |
| stash | A player's chips that are not on the table yet | hand, reserve |
| on top | A chip that counts: the top chip of a stack | visible, showing |
| pick up | Take a chip to move it | grab, select |
| place, drop | Put the chip down | move to, play |
| in your hand | The chip you have picked up | selected, active |
| put it back | Cancel a pick-up that revealed nothing | undo |
| bury | Cover a chip with another | hide, block |
| uncover | Reveal a chip by moving the one above it | expose |
| locked | The stack the opponent just dropped onto | blocked, frozen |
| full | A stack of 3 | maxed |

## Approved strings

| Where | Text |
| --- | --- |
| Pick-up headline | Your move |
| Pick-up instruction | Pick up a chip: any top chip on the table or a new one from your stash. |
| Stash label | Stash · n left · tap for a new chip |
| Place headline | Place it |
| Place instruction (from stash) | Tap a ringed spot. A stack holds 3 chips at most. |
| Place instruction (lone chip) | Tap a ringed spot. A stack holds 3 chips at most. |
| Place instruction (off a stack) | You lifted it off a stack and saw what was under it, so it can't go back. Tap a ringed spot. |
| Hand tray | In your hand · A new 0 from your stash / Your 0 from the table / Your 0 from a stack |
| Put back | Put it back |
| No put back | No take-backs |
| Tags on the board | FULL · UNCOVERED |
| Score | n / 5 ON TOP |
| After their move | Your move · Whoever reaches five first wins. |
| Win | You win · 5 on top. The computer had 3. |
| Reveal | The big reveal |
| Shop card | Play it on a real table · Get TIKITALA → |
| Ko-fi | Buy me a coffee |
| Home choices | Play the computer · Offline. No connection needed. / Play a friend online · Send a link. No sign-up. / Pass & play · Two players on this device |
| Home footer | Better on a real table. · Get the game at tikitala.com · (globe) English |
| Invite | Play a friend · You go first · Waiting · Send invite link · Copy link · Show QR · Got a code from a friend? · Join · Play someone new · No accounts, no downloads. The link opens the game in any browser. |

## Playing the computer

| Where | Text |
| --- | --- |
| Header | vs Computer · Clever |
| Panels | Computer · 1 · You · 0 |
| The computer's turn | Computer's move · Thinking… |
| Level picker | Play the computer · You play 0 and go first. The computer sees what you see, and remembers buried chips the way people do: some better than others. |
| Levels | Friendly · Forgets buried chips often and plays casually. Good for a first game. / Clever · Plays well, but loses track of buried chips now and then, like most people. / Ruthless · Remembers almost every chip and thinks a move ahead. |
| Game over | You win · 5 on top. The computer had 3. / Computer wins · The computer got 5 on top. You had 3. |
| Share | I beat the Clever computer at TIKITALA, 5 to 3. Five on top wins. |

## Pass & play strings

| Where | Text |
| --- | --- |
| Panels | Player 0 · Player 1 |
| Pick-up headline | Player 0's move |
| Game over | Player 0 wins · 5 on top. Player 1 had 3. |
| Home, game in progress | Continue your game · Player 1's move · 3–2 · Start a new game |

## Lessons

The lesson copy lives in the string tables (`js/strings/en.js` in the online folder, under
`lesson.<id>.*`); each lesson's table setup stays in `js/lessons.js`:

1. **Five on top wins.** Add a chip from your stash to make five on top.
2. **Bury their chip.** Drop your 0 on their 1.
3. **Three high, no peeking.** Lift their 1 off your buried 0; a lifted chip can't go back.
4. **Hands off their last move.** Their last move is locked; make any other move.

## Other languages

Every string above is in the English string table, `js/strings/en.js`, with the other languages beside
it. How to translate, the Portuguese glossary and the strings adapted rather than translated (the
lesson titles and share text) are in [translation.md](translation.md).

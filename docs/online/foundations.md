# Foundations

[Back to the design guide](README.md)

## Brand

- **Logo.** The stacked "TIKI TALA" outline wordmark with the vertical ".com"
  (`tikitala-dot-com.svg`, already in the online game folder). It is black outlines with see-through
  letter centers, so it only works on lime or light grounds. Never place it on ink. Minimum width on a
  phone: 160px. Keep at least 16px clear around it.
- **In-game wordmark.** Inside the game, the header uses the word TIKITALA set in Bebas Neue, lime on
  ink, 22px, letter spacing 0.08em.
- **Brand lime.** The yellow-green of the rules card. It is the color of the home and win screens, of
  the "your move" headline and of every legal drop.
- **The chips are the brand too.** Black rim, cream insert, `0` and `1`. See [chip.md](chip.md).

## Color tokens

| Token | Hex | Used for |
| --- | --- | --- |
| `ink` | `#161513` | App chrome, primary text on light grounds, primary buttons |
| `ink-raised` | `#2A2825` | Cards and banners on ink |
| `ink-control` | `#3A3834` | Small buttons on ink |
| `line-on-ink` | `#75716A` | Outlines, empty score pips and neutral borders on ink (see note below) |
| `chalk` | `#F3EEE2` | Chip inserts, text on ink, light screens (invite) |
| `chalk-dim` | `#E6E1D5` | Body text on ink |
| `muted-on-ink` | `#CFC9BB` | Secondary labels on ink |
| `muted-on-chalk` | `#4A4741` | Secondary text on chalk and white |
| `muted-on-lime` | `#3B3A2C` | Secondary text on lime |
| `lime` | `#E1E94B` | Brand ground, "your move" headline, legal-drop rings |
| `lime-pale` | `#F4F6C9` | Secondary buttons on lime |
| `lime-hover` | `#F0F59A` | Link hover on ink |
| `table-stone` | `#D9D5CB` | Default play surface |
| `table-oak` | `#C59B6B` + grain | Alternative play surface |
| `table-lime` | `#E1E94B` | Alternative play surface |
| `player-0` | `#E2622C` | Player 0's ring on chips, score pips |
| `player-1` | `#2F6FDB` | Player 1's ring on chips |
| `player-1-on-ink` | `#5B8FF0` | Player 1's score pips on ink (the lighter blue keeps contrast) |
| `chip-body` | `#1C1B19` | Chip rim |
| `chip-edge` | `#8E897F` | Outline around every chip, which makes stack height readable |
| `chip-groove` | `#55514A` | The single groove ring on a chip face |

Note: the mockups still use `#5A5650` for outlines on ink. That is only 2.5:1 against ink, below the
3:1 that meaningful outlines need, so the implementation uses `#75716A` (3.8:1).

### Contrast

| Pair | Ratio |
| --- | --- |
| lime on ink | 13.9:1 |
| chalk on ink | 15.8:1 |
| muted-on-ink on ink | 11.1:1 |
| ink on table-stone | 12.5:1 |
| ink on table-oak | 7.2:1 |
| muted-on-lime on lime | 8.7:1 |
| player-0 on ink | 5.2:1 |
| player-1-on-ink on ink | 5.8:1 |
| chip-edge on chip-body | 5.0:1 |

## Surfaces

The screen is built from a few surfaces, and each has one job:

- **Ink** is the app around the game: the header, the opponent's panel and your panel.
- **The table** is where chips live. Stone is the default; oak and lime are alternatives (a setting,
  or a theme to pick later). The table has a 28px corner radius and sits 8px inside the screen edge.
- **Chips only ever sit on a table color.** Black chips vanish on ink, so the stash, the opponent's
  mini stash and the hand tray are small "tiles" of table color.
- **Lime** is for the moments outside a turn: the home screen and the win screen.
- **Chalk** is for content screens that are not the game, like the invite screen, and for lesson cards.

## Typography

Three families, all from Google Fonts. For offline play as a PWA, serve them as local `woff2` files.

| Family | Role | Sizes |
| --- | --- | --- |
| **Bebas Neue** (fallback Impact) | Display: screen titles, turn headlines, names, button labels | 84px win headline; 38 to 42px turn headline and home tagline; 30 to 36px titles; 24 to 28px buttons and names; 22px in-game wordmark |
| **Barlow** 400/500/600/700 (fallback system-ui) | Body and UI text | 13 to 18px, line height 1.35 to 1.4 |
| **Roboto Mono** 500/700 (fallback ui-monospace) | Labels, counters, tags, codes | 11 to 12px uppercase with 0.06 to 0.08em letter spacing; 50px for game codes |

The numerals on chips are drawn shapes, not type (see [chip.md](chip.md#numerals)).

## Spacing and shape

- Base unit 4px. Panel padding 14 to 18px; home screen side padding 24px.
- Corner radii: 28px table; 22 to 24px cards; 18px large buttons; 13 to 14px tiles and small buttons;
  12px cells; 8 to 9px tags.
- Touch targets are at least 44×44px. Primary buttons are 60 to 64px tall.

## Icons

- Drawn inline as SVG on a 24px grid: 2 to 2.4px stroke, round caps and joins, no fill.
- The set: menu, help, back, close, chevron, play, computer, friends, phone, share, copy, QR code,
  globe, replay, lock, hand, plus, up arrow and coffee cup.
- No emoji anywhere in the interface.

## Imagery

Only real photos of the physical game. Crop square, with a 13 to 14px radius.

## Motion

| Name | What it does | Used for |
| --- | --- | --- |
| Pulse | Scale 1 to 1.05 and opacity 1 to 0.7, 1.4s ease-in-out, repeating | Legal drops only |
| Trail | Dashes flowing along a line, 0.9s linear, repeating | The opponent's last move |
| Settle | 180ms ease on position, shadow and opacity | Every state change of a chip |
| Waiting dots | Three dots fading in turn, 1.2s, 0.2s apart | Waiting for an online friend |

With `prefers-reduced-motion`, the pulse becomes a still ring and the trail becomes a still dashed line.

## Layout and responsiveness

- **Reference:** portrait phone, 390×844. Three bands from top to bottom: header and opponent, the
  table, your panel.
- **The board** keeps its shape at every size: 9 spots in a staggered 3-column layout, measured in chip
  sizes. The table area takes the height the panels leave, and the chip size is worked out to fit it,
  between 46px and 126px (see [chip.md](chip.md#board-geometry)).
- **The game column** is at most 560px wide and centered. On wider screens the ink background extends
  to the edges.
- **Compact panels.** When the screen is shorter than 760px, the panels shrink so the board keeps
  enough room: headline 42px to 32px, instruction 15px to 14px, stash tile and hand tray 72×100px to
  60×80px (chip 56px to 44px), opponent tile 56×60px to 48×52px, and tighter padding. Regular panels
  take about 375px of height; compact ones about 310px.
- **Scrolling.** The home, setup, win and invite screens scroll vertically whenever their content is
  taller than the screen, so nothing is ever cut off. The game screen is designed not to scroll, but
  as a safeguard it scrolls rather than clipping when the screen is too short for even the smallest
  board (for example the lessons on a 320×568 phone).
- **Long words.** Headlines that can get long (such as "Computer wins") use a smaller size so they
  stay on one line; body text always wraps.
- **Safe areas:** pad the header and the bottom panel with `env(safe-area-inset-*)`. Never draw a fake
  status bar.
- **Two columns on wide screens.** When the screen is at least 560px wide and wider than 5:4, the game
  uses two columns: the header, the other player's panel (or the lesson card) and your panel stacked
  on the left (300 to 420px wide), and the table filling the right. The home screen puts the logo
  on the left and the buttons on the right; the game-over screen puts the reveal on the right.

## Accessibility

- Color is never the only signal. Chips always show `0` or `1`; legal drops have a ring; locked chips
  have a lock icon; the chip in your hand has a hand icon.
- Every spot is a real `<button>` with a label such as "Stack of 2, your 0 on top" or "Locked: their
  last move".
- The opponent's move is announced in a polite live region ("Computer moved a chip").
- Text meets 4.5:1 contrast (3:1 from 24px); outlines and icons meet 3:1.

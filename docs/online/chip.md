# The chip

[Back to the design guide](README.md)

One component draws every chip and stack in the game: on the board, in the stash, in your hand, on the home screen and in the end-of-game reveal.

## Anatomy

From the outside in:

### Rim

A black disc (`chip-body`) with a thin light outline (`chip-edge`). The outline is what makes stacks countable, because every chip in a pile shows its own edge line.

### Groove

One fine ring (`chip-groove`) just inside the rim, like the real chips. There is no bevel, gloss or inner shadow.

### "tikitala.com" 

Set in Roboto Mono along the lower part of the rim, light on black. Drawn only when the chip is at least 60px wide.

### Player ring

A thin ring around the insert: orange for `0`, blue for `1`. It can be turned off for a "classic" all black-and-white look; the numeral alone still tells players apart.

### Insert

A white (`chalk`) disc, 58% of the chip's diameter, centered.

### Numeral

`0` or `1`, drawn in ink.

The numerals are drawn as SVG paths, not typed, so they look the same everywhere and match the physical chips. Both sit in a 40x50 box, with a 5.4 stroke, square ends and sharp corners:

- `0`: an ellipse (center 20,25; radii 11 and 16.5) crossed by a slash from 12.5,37.5 to 27.5,12.5.

- `1`: a flag from 10.5,15.5 to 22,7.5, a stem down to 22,42.5 and a foot from 10 to 33 at 42.5.

The numeral box is 28% of the chip's diameter wide and 35% tall.

### Rotation

Each chip gets a random rotation between -30° and +30° when it enters the game, and keeps it for the whole game, wherever it moves. Rotation is never larger than 30° either way, so a numeral is never upside down.

## Geometry

For a chip of diameter `S`:

| Measure | Value |
| --- | --- |
| Edge step (how much of each lower chip shows) | `e = round(0.13 × S)` |
| Height of a stack of `n` chips | `S + max(2, n - 1) × e` (stacks of 1 to 3 all reserve room for 3) |
| Rim outline width | `max(1.5px, 0.02 × S)` |
| Groove ring | from `5/88 × S` to `6.2/88 × S` in from the edge |
| Player ring width | `2.8/88 × S` |
| Lock and hand badges | `max(18px, 0.3 × S)` |
| Ring around a stack (can go here, picked up here) | A circle of diameter `S + (n - 1) × e + 2 × gap`, centered on the stack, with `gap = max(4px, 7/88 × S)`. It encloses every chip's edge, so a ring never hides how many chips are in the stack |

Stacks are drawn from the bottom up: each chip sits `e` higher than the one below it, and only the top
chip shows its face. The chips below show their black rim and edge outline only.

### Sizes in use

All sizes are CSS pixels (density independent). The board chip size is not fixed: it is worked out
from the screen (see [Board geometry](#board-geometry)). The other sizes are fixed.

| Size | Where |
| --- | --- |
| 46 to 126px, 84px on the reference phone | Board |
| 56px (44px in compact panels) | Your stash tile and the hand tray |
| 40px | Opponent's mini stash, the end-of-game reveal, the lesson hand tray |
| 64 to 104px | Decorative chips on the home and win screens |

### Board geometry

Every board measurement is a multiple of the board chip size `S`, so the board keeps its shape at any
size. The mockups use `S = 84px`; the pixel values in brackets are for that size only.

| Measure | In chip sizes | At S = 84 |
| --- | --- | --- |
| Board width | `3.929 S` | 330px |
| Board height | `4.952 S` | 416px |
| Column centers | `0.655 S`, `1.964 S`, `3.274 S` | 55, 165, 275px |
| Half-row step | `0.738 S` | 62px |
| Space reserved per spot | `1 S` wide, `1.262 S` tall | 84×106px |

The outer columns hold rows 0, 2 and 4; the middle column holds rows 1, 3 and 5. Row `r` starts at
`y = 0.738 S × r`.

**Choosing S.** The table area takes whatever height the panels leave. Then:

```
S = clamp(46px, min((tableWidth - 16px) / 3.929, (tableHeight - 16px) / 4.952), 126px)
```

- The minimum, 46px, keeps every spot a comfortable touch target (at least 44px).
- The maximum, 126px, stops chips from looking oversized on tablets and desktops.
- Two ways to build it: set a `--s` custom property from a `ResizeObserver` on the table and write all
  chip geometry as `calc(var(--s) * …)`; or draw the board once at 84px and scale it as a whole with
  `transform: scale(S / 84)`. The prototype does the second.

What that gives on common screens, in portrait (panels per [foundations.md](foundations.md#layout-and-responsiveness)):

| Screen | Panels | Board chip size |
| --- | --- | --- |
| 320×568 (small, older phones) | compact | 49px |
| 375×667 | compact | 69px |
| 390×844 (reference) | regular | 91px |
| 430×932 | regular | 101px |
| 768×1024 tablet | regular, 560px column | 126px (the maximum) |
| 1440×900 desktop window | regular, 560px column | 103px |
| Phone in landscape | none fits yet | The screen scrolls until the landscape layout exists |

The order matches the stack indices in the current code (`tikitala-stage.js`):

| Code index | Column, row | Position |
| --- | --- | --- |
| 2 | left, 0 | top left |
| 3 | right, 0 | top right |
| 4 | middle, 1 | upper middle (starts with a `0`) |
| 5 | left, 2 | middle left (starts with a `0`) |
| 6 | right, 2 | middle right (starts with a `1`) |
| 7 | middle, 3 | lower middle (starts with a `1`) |
| 8 | left, 4 | bottom left |
| 9 | right, 4 | bottom right |
| 10 | middle, 5 | bottom |

## States

| State | Looks like | When |
| --- | --- | --- |
| **Idle** | The stack as it is | Default |
| **Not now** | The whole stack at 36% opacity | Not a legal pick or drop right now (a full stack while placing, or an empty spot when you hold a lone chip) |
| **Can go here** | Solid lime ring with ink outlines inside and out, pulsing, circling the whole stack | A legal drop for the chip in your hand |
| **Picked up here** | Dashed ink ring circling the whole stack, still | The stack your chip came from. It shows the new top chip, which may be one you just uncovered |
| **In your hand** | One chip floating above its own blurred shadow, 6% larger, with a hand badge at the upper left. No ring | The chip you are holding, shown in the hand tray |
| **Locked** | A lock badge at the upper right | The stack your opponent just dropped onto. Its top chip cannot be picked up this turn |

An empty spot has its own looks:

| Empty spot | Looks like |
| --- | --- |
| Idle | A faint dashed circle |
| Can go here | A dashed ink circle filled with lime, with a plus sign, pulsing |
| Picked up here | A dashed ink circle over translucent chalk, with an up arrow (a lone chip was lifted from here) |

"In your hand" and "can go here" must never look alike. The chip in your hand leaves the board (it
floats in the hand tray, with no ring), and drops are flat chips with a lime ring.

## The stash

- A player's stash is a pile of their own chips, drawn with the same edge step as a stack. After setup
  it holds at most **6** chips (8 minus the 2 placed at the start), so the pile can be taller than 3.
- The stash sits on a table-colored tile in the player's panel, with "Stash" and "6 left" beside it.
- On your turn, while picking, the stash tile has a dashed lime border, meaning "you can take a new
  chip from here".
- When the stash is empty, the tile shows an empty idle spot and the label "None left".

## Do and don't

- Do keep every rim identical. A player must never be able to tell what is under a stack from how it
  looks.
- Do keep a chip's rotation for the whole game.
- Don't add gloss, bevels or inner shadows to the rim.
- Don't place chips straight on ink.
- Don't use lime for anything on the board except legal drops.

## Implementation notes

- Pure CSS and SVG: each chip is an absolutely positioned disc (`border-radius: 50%`) with `border` for
  the outline and an inset `box-shadow` for the groove.
- Define the two numerals once as SVG `<symbol>`s and reference them with `<use>`.
- The rim text uses an SVG `<textPath>` on a circle of radius 38.5 in a 100×100 view box.
- One function, given a stack, its state and a size, should produce the whole stack. That keeps
  board, stash, tray and reveal consistent.

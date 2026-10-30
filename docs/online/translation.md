# Translation

[Back to the design guide](README.md)

Every word the online game shows comes from a string table, one per language. English is the source:
it decides which strings exist, and any string missing from another language shows in English.

## How it works

In the online folder (`gh-pages`):

| File | What it holds |
| --- | --- |
| `js/strings/en.js` | The English table, with notes for translators. Every key the game uses is here |
| `js/strings/pt-BR.js` | Brazilian Portuguese |
| `js/i18n.js` | The list of languages, choosing one, and `t()`, which looks up a string and fills it in |
| `index.html` | No words of its own: `data-i18n="key"` sets an element's text, `data-i18n-label` its `aria-label`, `data-i18n-alt` its `alt` |

- **Keys** are grouped by screen: `home.sub`, `turn.place`, `lesson.bury.title`, `over.youWin`.
- **Placeholders** in braces are filled in by the game: `{p}` is a player (0 or 1), `{n}`, `{a}` and `{b}`
  are counts, `{level}` is a level's name. A translation can move them, but must keep all of them.
- **Plurals.** A string that depends on a number can be `{ zero, one, other }` (or any of the forms
  `Intl.PluralRules` knows) and is chosen by `{n}`. `zero` is optional and wins when `{n}` is 0. A
  language only needs plural forms where its grammar does: English writes `'{n} left'` once, Portuguese
  needs `{ one: 'Resta {n}', other: 'Restam {n}' }`.
- **Whole sentences only.** Strings are never glued together from fragments, because word order and
  agreement change between languages ("You moved" and "The computer moved" take different verb forms in
  Spanish and French). Where a sentence varies, each variant is its own key.
- **The lessons and the computer levels** keep only their setup in `lessons.js` and `computer.js`; their
  words are under `lesson.<id>.*` and `level.<id>.*`.

## Choosing the language

- The game follows the browser: the first of `navigator.languages` it has a table for. It matches the
  exact language first (`pt-BR`), then the same language from any region, so `pt-PT` and plain `pt`
  get Brazilian Portuguese until there is a European Portuguese table. Anything else gets English.
- The **language picker** in the home screen footer (globe icon) overrides it. The pick is saved in
  `localStorage` (`tikitala.online.lang.v1`). Picking the browser's own language again clears the
  override, so the game goes back to following the browser.
- Each language is listed by its own name: English, Português (Brasil).
- Only the chosen table is downloaded; English is always loaded, as the fallback.

## Fitting longer words

Portuguese, Spanish and French run 15 to 30% longer than English. Body text wraps. Display text set in
Bebas Neue (headlines, button labels, names) is meant to stay on one line, so it is marked `data-fit`
in `index.html`: if it does not fit its box, the game shrinks it until it does, down to the size given
(for example `data-fit="28"` on the game-over title). Only if even that is too wide does it wrap. The
check runs after every render, on resize and once the web fonts have loaded.

This is a safety net, not a licence: a headline that shrinks a lot looks different from its neighbors,
so translations should still aim to be short. In `en.js`:

- `[display]` marks Bebas Neue strings. Aim for no more than about 20% longer than the English.
- `[label]` marks Roboto Mono tags and counters (`FULL`, `LESSON 1 OF 4`). They never wrap, and tags
  on the table are clipped at its edge, so keep them as short as the English.
- Instructions under the turn headline should stay within two lines on a 390px phone, about 100
  characters. A third line pushes the table smaller.
- A no-break space (` `) keeps a pair like "Jogador 1" from breaking across lines.

## Fonts and accents

All three fonts come from Google Fonts, whose `latin` subset (loaded already, no change needed) covers
every letter Portuguese, Spanish and French need. Checked against the font files themselves:

| Font | À Á Â Ã Ç É Ê Í Ó Ô Õ Ú Ü Ñ È Ë Î Ï Œ Ù Û Ÿ, lower case too, ¿ ¡ « » – — ’ “ ” … · |
| --- | --- |
| Bebas Neue | All present. Bebas Neue has capitals only; its lower-case letters, accented ones included, are drawn exactly like the capitals, so sentence-case strings come out right |
| Barlow 400 to 700 | All present |
| Roboto Mono 500 and 700 | All present |

Two things to know:

- `→` (in "Get TIKITALA →") is in none of the three fonts, so it is drawn from a system font, in every
  language, English included.
- Accented capitals in Bebas Neue rise to 0.87em above the baseline, against 0.70em for plain capitals.
  The display styles use tight line heights (0.9 to 1), so accents reach a few pixels above their line.
  Nothing on the page clips them, and on two-line headlines they clear the line above, but keep
  `overflow` visible on display text and do not tighten those line heights further.

## Checking a translation

From the 5visible folder, with the gh-pages checkout beside it (or `TIKITALA_ONLINE` pointing to its
online folder):

```bash
node --test tests/online/*.test.mjs
```

`tests/online/i18n.test.mjs` fails if a table is missing a key or has one English does not, if a
placeholder is lost or misspelled, if a plural is malformed, if the page or the code uses a key that
does not exist or a string goes unused, or if words creep back into `index.html`, `lessons.js` or
`computer.js`.

```bash
node tests/online/layout.check.mjs --lang pt-BR --shots shots
```

`tests/online/layout.check.mjs` needs Playwright and the network (for the fonts). It opens 22 states
(home, levels, every lesson, a game in every turn state, game over) at 7 screen sizes from 320×568 to
1440×900, reports anything that does not fit, and with `--shots` saves screenshots to review by eye.

## Adding a language

1. Copy `js/strings/en.js` to `js/strings/<code>.js`, using a language tag: `es`, `fr`, `pt-PT`. Use a
   plain language (`es`) for one version everywhere, or a region (`es-ES`, `es-419`) when regions differ.
2. Translate the values. Keep the keys, the placeholders, and the `[display]` and `[label]` budgets.
   Adapt rather than translate the lesson titles and the share text (see below).
3. Add `{ code, name }` to `LANGUAGES` in `js/i18n.js`, with the name in the language itself.
4. Run both checks above, fix what they report, and read every screenshot.
5. Add a glossary and the adapted strings to this page.

For **European Portuguese**: add `pt-PT.js` and `{ code: 'pt-PT', name: 'Português (Portugal)' }`.
Browsers set to `pt-PT` then get it automatically. Portuguese from Angola, Mozambique and the other
African countries follows the European norm but would still match `pt-BR` first by language; if that
matters, give `browserLanguage()` a small map from those regions to `pt-PT`.

When offline play arrives (the service worker on the wish list), it must cache `js/strings/*.js` too,
since only the chosen language is downloaded.

## Not translated

- **The `<noscript>` message** in `index.html`: it only shows without JavaScript, which is what does the
  translating.
- **Social previews and the installed app's name**: the `og:` and `twitter:` tags and
  `manifest.webmanifest` are read by crawlers and phones without running the page. The `<title>` and
  `meta description` do follow the language once the page runs. Translated previews would need a URL
  per language.
- **Names**: TIKITALA, tikitala.com, Ko-fi. The physical game's site, tikitala.com, is in English only.

## Português (Brasil)

### Voice

- *Você*, usually left implicit by the verb.
- Instructions in the imperative: *Toque*, *Pegue*, *Solte*. Buttons and menu items in the infinitive,
  as Brazilian apps do: *Continuar*, *Devolver*, *Compartilhar*, *Pular*.
- Headlines drop the article where a newspaper would: *Computador venceu*, *Jogador 1 venceu*.
- Digits for counts, as in English.

### Glossary

Follows the terminology in [copy.md](copy.md#terminology).

| English | Português | Notes |
| --- | --- | --- |
| chip | peça | Chosen in review over *ficha* |
| stack | pilha | |
| spot | casa | As on a board game: *casa vazia* |
| stash | reserva | |
| on top | por cima | *Ficar por cima* also means to come out on top. The game-over line says *no topo* |
| top chip | peça de cima | |
| ON TOP (the score) | PONTOS | `4 / 5 PONTOS`, and the lessons' score line |
| pick up | pegar | |
| place, drop | colocar, soltar | The turn headline is *Reposicione* |
| in your hand | na sua mão | |
| put it back | devolver | |
| no take-backs | não tem volta | |
| bury, buried | enterrar, enterrada | |
| uncover, uncovered | descobrir, descoberta | Feminine: it is the *peça* |
| locked | travada | |
| full | cheia | |
| your move | sua vez | A *jogada* is one move |
| game (one match) | partida | |
| Player 0 | Jogador 0 | |
| they, their | eles, deles | The other side, as in the English |
| lesson | lição | |
| rematch | revanche | |
| share | compartilhar | |
| Friendly, Clever, Ruthless | Amigável, Esperto, Implacável | They follow *o computador*, so masculine |

### Adapted, not translated

| Where | English | Português | Why |
| --- | --- | --- | --- |
| Lesson 1 | Five on top wins | Cinco por cima ganha | *Por cima* is how players say a chip is on top, and *ficar por cima* is to come out on top, so it keeps a double sense. *Ganha* rather than *vence*: table talk |
| Home | Play the computer | Contra o computador | The usual Brazilian name for the mode. *Jogar contra o computador* only fit at a smaller size than the button below it. The last lesson's button keeps the verb, since it has the full width and invites the player in |
| Home | Continue your Clever game · 3–2 | Continuar contra o Esperto · 3–2 | The level becomes the opponent's name |
| Home | New pass & play game | Nova partida neste aparelho | *Passe e jogue* does not take a noun well; "a new game on this device" says the same |
| Home | New here? Learn in four moves | Primeira vez? Aprenda em 4 jogadas | Shortened to one line |
| Lesson 3 | Three high, no peeking | Até três, sem espiar | "Three high" has no short Portuguese equivalent; *até três* is "up to three" |
| Lesson 4 | Hands off their last move | Não mexa na última jogada | The idiom *tira a mão* sounds like a telling-off |
| Lesson 4 | That is the game | O jogo é isso | |
| Levels | LAST PLAYED | DA ÚLTIMA VEZ | "From last time" |
| Turn | Place it | Reposicione | Chosen in review |
| Score | 4 / 5 ON TOP | 4 / 5 PONTOS | Chosen in review |
| Game over | The computer got 5 on top. You had 2. | 5 no topo. Você tinha 2. | Chosen in review; the other two game-over lines follow the same pattern (*5 no topo. O computador tinha 1.*) |
| Share | I beat the Clever computer at TIKITALA, 5 to 3. Five on top wins. | Ganhei de 5 a 3 do computador Esperto no TIKITALA. Cinco por cima ganha! | *Ganhar de 5 a 3* is how Brazilians report a score; the exclamation turns the catchphrase into the boast |
| Share | The Clever computer beat me at TIKITALA, 5 to 3. | Perdi de 5 a 3 para o computador Esperto no TIKITALA. | Said from the player's side, winner's score first, as in *perdemos de 3 a 1* |
| Ko-fi | Buy me a coffee | Me pague um café | The common Brazilian phrase |

### Open choices for review

Each was a judgement call with a reasonable alternative:

- *Por cima* still says "on top" in the lessons, the end-of-game headline (*Cinco por cima!*), the
  share text and what screen readers hear, while the game-over line now says *no topo* and the score
  *PONTOS*. Alternative: *no topo* everywhere.
- *Amigável* for Friendly. Alternative: *Tranquilo*, more Brazilian and closer to "plays casually".
- *Passe e jogue* for Pass & play. Alternative: *Jogar a dois*, very natural, but could suggest playing
  online.
- *Casa* for a spot on the table. Alternative: *lugar*.
- *Eles* in the lessons' score line (`PONTOS · Você · Eles`), mirroring "Them".

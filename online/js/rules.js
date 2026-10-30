// TIKITALA rules. Pure functions and plain data: no DOM, no randomness except where passed in.
//
// A game has 11 stacks: 0 and 1 are the players' stashes, 2 to 10 are the nine spots on the table.
// A chip is { id, p, r }: a unique id, its player ('0' or '1') and its rotation in degrees.
// Players are numbers (0 and 1) in `turn`, and strings ('0' and '1') on chips.

export const CHIPS_PER_PLAYER = 8;
export const TO_WIN = 5;
export const MAX_STACK = 3;
export const SPOTS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function newGame(random = Math.random) {
  let id = 0;
  const chip = (p) => ({ id: id++, p, r: Math.round(random() * 60 - 30) });
  const stacks = Array.from({ length: 11 }, () => []);
  for (let i = 0; i < CHIPS_PER_PLAYER; i++) {
    stacks[0].push(chip('0'));
    stacks[1].push(chip('1'));
  }
  // the opening setup: two chips from each player on the table
  stacks[4].push(stacks[0].pop());
  stacks[5].push(stacks[0].pop());
  stacks[6].push(stacks[1].pop());
  stacks[7].push(stacks[1].pop());
  return { v: 1, stacks, turn: 0, blocked: -1, last: null, moves: 0, winner: null, passed: false };
}

export function clone(game) {
  return { ...game, stacks: game.stacks.map((s) => s.slice()), last: game.last ? { ...game.last } : null };
}

export function top(stack) {
  return stack.length ? stack[stack.length - 1] : null;
}

// how many of player p's chips are on top of a stack on the table (stashes never count)
export function onTop(game, p) {
  const key = String(p);
  let n = 0;
  for (const i of SPOTS) {
    const t = top(game.stacks[i]);
    if (t && t.p === key) n++;
  }
  return n;
}

// can the player whose turn it is pick up the top chip of stack `from`?
export function canPick(game, from) {
  if (game.winner !== null) return false;
  const s = game.stacks[from];
  if (!s || s.length === 0) return false;
  if (from === game.blocked) return false;               // their last move is locked
  return from === game.turn || from >= 2;                // your own stash, or any spot on the table
}

// can the chip picked up from `from` be dropped on `to`?
export function canDrop(game, from, to) {
  if (to < 2 || to > 10) return false;                   // never on a stash
  if (to === from) return false;                         // never back on its own stack: that would skip a turn
  if (game.stacks[to].length >= MAX_STACK) return false; // full
  // a lone chip moved to an empty spot would only shuffle the table
  if (from >= 2 && game.stacks[from].length === 1 && game.stacks[to].length === 0) return false;
  return true;
}

// a pick-up can be undone only when it revealed nothing: from a stash, or a lone chip from the table
export function canPutBack(game, from) {
  return from < 2 || game.stacks[from].length === 1;
}

export function legalMoves(game) {
  const out = [];
  for (let f = 0; f < 11; f++) {
    if (!canPick(game, f)) continue;
    for (const t of SPOTS) if (canDrop(game, f, t)) out.push([f, t]);
  }
  return out;
}

// Plays one move and returns the new game. The score is checked only here, after the drop.
// If the next player has no legal move, their turn passes (and `passed` is set).
export function play(game, from, to) {
  if (!canPick(game, from) || !canDrop(game, from, to)) throw new Error('Illegal move ' + from + ' to ' + to);
  const g = clone(game);
  const chip = { ...g.stacks[from].pop(), b: game.turn };   // b: the player who moved it last
  g.stacks[to].push(chip);
  g.last = { from, to, by: game.turn, chip: chip.id, uncovered: from >= 2 && g.stacks[from].length > 0 };
  g.blocked = to;
  g.moves = game.moves + 1;
  g.passed = false;
  const t0 = onTop(g, 0);
  const t1 = onTop(g, 1);
  if (t0 >= TO_WIN || t1 >= TO_WIN) {
    g.winner = t0 >= TO_WIN ? 0 : 1;
    return g;
  }
  g.turn = 1 - game.turn;
  if (legalMoves(g).length === 0) {
    g.passed = true;
    g.blocked = -1;
    g.turn = game.turn;
  }
  return g;
}

// chips of each player that are not on top of a stack at the end of the game
export function buried(game) {
  const out = { 0: 0, 1: 0 };
  for (const i of SPOTS) game.stacks[i].slice(0, -1).forEach((c) => { out[c.p]++; });
  return out;
}

// who buried whom: for every buried chip, the player who last moved the chip right on top of it
// buriedBy(game)[0] counts player 1's chips covered by player 0, and the other way round
export function buriedBy(game) {
  const out = { 0: 0, 1: 0 };
  for (const i of SPOTS) {
    const s = game.stacks[i];
    for (let j = 0; j < s.length - 1; j++) {
      const cover = s[j + 1];
      if (cover.b === 0 || cover.b === 1) {
        if (String(cover.b) !== s[j].p) out[cover.b]++;
      }
    }
  }
  return out;
}

// light validation for a saved game read back from storage
export function isGame(x) {
  if (!x || x.v !== 1 || !Array.isArray(x.stacks) || x.stacks.length !== 11) return false;
  let n0 = 0, n1 = 0;
  for (const s of x.stacks) {
    if (!Array.isArray(s)) return false;
    for (const c of s) {
      if (!c || (c.p !== '0' && c.p !== '1')) return false;
      if (c.p === '0') n0++; else n1++;
    }
  }
  if (n0 !== CHIPS_PER_PLAYER || n1 !== CHIPS_PER_PLAYER) return false;
  for (const i of SPOTS) if (x.stacks[i].length > MAX_STACK) return false;
  return (x.turn === 0 || x.turn === 1);
}

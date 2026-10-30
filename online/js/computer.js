// The computer opponent (see docs/online/interaction.md#the-computer-opponent in 5visible).
//
// It plays fair: it sees only what a player at the table sees. Every top chip is seen; every chip it has
// seen is remembered, but after each move each buried chip it remembers may slip its mind (the forget
// rate). When it plans, it fills in forgotten chips with guesses that fit the chip counts it can see,
// tries several guesses and picks the move that does best on average.
//
// Memory is plain data, { [chipId]: true }, so it can be saved with the game.

import { SPOTS, legalMoves, top, onTop, TO_WIN } from './rules.js';

// how each level plays; their names and descriptions are under level.<id>.* in the string tables (js/strings)
export const LEVELS = {
  friendly: { forget: 0.30, random: 0.40, lookahead: 'none', worlds: 6 },
  clever: { forget: 0.12, random: 0, lookahead: 'safety', worlds: 6 },
  ruthless: { forget: 0.03, random: 0, lookahead: 'full', worlds: 8 }
};

export const LEVEL_IDS = ['friendly', 'clever', 'ruthless'];

// everything is visible at the start of a game
export function freshMemory(game) {
  const mem = {};
  game.stacks.forEach((s) => s.forEach((c) => { mem[c.id] = true; }));
  return mem;
}

// after every move: see the top chips, then each remembered buried chip may be forgotten
export function afterMove(game, mem, level, random = Math.random) {
  const rate = (LEVELS[level] || LEVELS.clever).forget;
  const out = { ...mem };
  for (const i of SPOTS) {
    const s = game.stacks[i];
    if (s.length) out[s[s.length - 1].id] = true;
    for (let j = 0; j < s.length - 1; j++) {
      if (out[s[j].id] && random() < rate) out[s[j].id] = false;
    }
  }
  return out;
}

// how many buried chips the computer has lost track of
export function forgottenCount(game, mem) {
  let n = 0;
  for (const i of SPOTS) game.stacks[i].slice(0, -1).forEach((c) => { if (!mem[c.id]) n++; });
  return n;
}

// a version of the table where every forgotten chip is replaced by a guess that fits what can be counted
export function guessWorld(game, mem, random = Math.random) {
  const stacks = game.stacks.map((s) => s.slice());
  const known = { 0: 0, 1: 0 };
  const slots = [];
  for (const i of SPOTS) {
    const s = game.stacks[i];
    for (let j = 0; j < s.length; j++) {
      if (j === s.length - 1 || mem[s[j].id]) known[s[j].p]++;
      else slots.push([i, j]);
    }
  }
  const pool = [];
  for (const p of [0, 1]) {
    const onTable = 8 - game.stacks[p].length;          // stashes are in plain sight
    for (let k = 0; k < onTable - known[p]; k++) pool.push(String(p));
  }
  for (let k = pool.length - 1; k > 0; k--) {
    const r = Math.floor(random() * (k + 1));
    [pool[k], pool[r]] = [pool[r], pool[k]];
  }
  slots.forEach(([i, j], k) => { stacks[i][j] = { ...stacks[i][j], p: pool[k] || stacks[i][j].p }; });
  return { ...game, stacks };
}

function apply(game, from, to) {
  const stacks = game.stacks.map((s) => s.slice());
  stacks[to].push(stacks[from].pop());
  return { ...game, stacks, blocked: to, turn: 1 - game.turn };
}

function value(game, me) {
  const a = onTop(game, me);
  const b = onTop(game, 1 - me);
  if (a >= TO_WIN) return 1000;
  if (b >= TO_WIN) return -1000;
  return a - b + 0.04 * game.stacks[me].length;      // a chip kept in the stash is worth a little
}

// picks the computer's move: [from, to]
export function chooseMove(game, mem, level, random = Math.random) {
  const L = LEVELS[level] || LEVELS.clever;
  const me = game.turn;
  const moves = legalMoves(game);
  if (!moves.length) return null;
  if (L.random && random() < L.random) return moves[Math.floor(random() * moves.length)];

  const worlds = [];
  for (let k = 0; k < L.worlds; k++) worlds.push(guessWorld(game, mem, random));

  let best = null;
  for (const [f, t] of moves) {
    let total = 0;
    for (const w of worlds) {
      const after = apply(w, f, t);
      let v = value(after, me);
      if (v < 1000 && L.lookahead !== 'none') {
        const replies = legalMoves(after);
        let worst = Infinity;
        for (const [f2, t2] of replies) {
          const v2 = value(apply(after, f2, t2), me);
          if (v2 < worst) worst = v2;
        }
        if (replies.length) {
          if (L.lookahead === 'full') v = worst;          // assume the best reply
          else if (worst <= -1000) v -= 500;              // only avoid handing over the win
        }
      }
      total += v;
    }
    const score = total / worlds.length + random() * 0.3;   // a little variety between equal moves
    if (!best || score > best.score) best = { move: [f, t], score };
  }
  return best.move;
}

// for tests and tuning: true if the top chips of a world match the real game (guesses never change them)
export function sameTops(a, b) {
  return SPOTS.every((i) => (top(a.stacks[i]) || {}).p === (top(b.stacks[i]) || {}).p);
}

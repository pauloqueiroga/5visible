// Tests for the online game's rules module (js/rules.js in the gh-pages "online" folder).
//
// Run with Node 18 or later:
//   node --test tests/online/rules.test.mjs
// The rules module lives in the other checkout. By default this looks for it next to this repository
// (../tikitala.com/online/js/rules.js); set TIKITALA_ONLINE to the online folder to point elsewhere.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const candidates = [
  process.env.TIKITALA_ONLINE && join(process.env.TIKITALA_ONLINE, 'js', 'rules.js'),
  resolve(here, '../../../tikitala.com/online/js/rules.js'),
  resolve(here, '../../../online/js/rules.js'),
].filter(Boolean);
const found = candidates.find((p) => existsSync(p));
if (!found) throw new Error('Cannot find rules.js. Set TIKITALA_ONLINE to the online folder. Tried:\n' + candidates.join('\n'));
const R = await import(pathToFileURL(found).href);

// a game with chosen stacks: lists of player strings, bottom chip first
function gameWith(spots, { turn = 0, blocked = -1 } = {}) {
  let id = 0;
  const stacks = Array.from({ length: 11 }, () => []);
  const used = { 0: 0, 1: 0 };
  for (const [i, chips] of Object.entries(spots)) {
    for (const p of chips) { stacks[i].push({ id: id++, p, r: 0 }); used[p]++; }
  }
  for (const p of ['0', '1']) for (let k = used[p]; k < 8; k++) stacks[Number(p)].push({ id: id++, p, r: 0 });
  return { v: 1, stacks, turn, blocked, last: null, moves: 0, winner: null, passed: false };
}

test('a new game starts with two chips from each player on the table', () => {
  const g = R.newGame();
  assert.equal(g.stacks[0].length, 6);
  assert.equal(g.stacks[1].length, 6);
  assert.deepEqual([4, 5, 6, 7].map((i) => g.stacks[i][0].p), ['0', '0', '1', '1']);
  assert.equal(R.onTop(g, 0), 2);
  assert.equal(R.onTop(g, 1), 2);
  assert.equal(g.turn, 0);
  assert.ok(R.isGame(g));
  for (const s of g.stacks) for (const c of s) assert.ok(c.r >= -30 && c.r <= 30, 'rotation within 30 degrees');
});

test('what can be picked up', () => {
  const g = gameWith({ 4: ['0'], 5: ['1', '0'], 6: ['1'] }, { turn: 0, blocked: 6 });
  assert.ok(R.canPick(g, 0), 'own stash');
  assert.ok(!R.canPick(g, 1), 'never the other stash');
  assert.ok(R.canPick(g, 4), 'own chip on the table');
  assert.ok(R.canPick(g, 5), 'any top chip');
  assert.ok(!R.canPick(g, 6), 'their last move is locked');
  assert.ok(!R.canPick(g, 2), 'empty spot');
});

test('where a chip can be dropped', () => {
  const g = gameWith({ 4: ['0'], 5: ['1', '0'], 6: ['1', '0', '1'] });
  assert.ok(!R.canDrop(g, 0, 1), 'never on a stash');
  assert.ok(!R.canDrop(g, 5, 5), 'never back on its own stack (no skipped turns)');
  assert.ok(!R.canDrop(g, 0, 6), 'never on a full stack');
  assert.ok(!R.canDrop(g, 4, 2), 'a lone chip cannot move to an empty spot');
  assert.ok(R.canDrop(g, 4, 5), 'a lone chip can go on a stack');
  assert.ok(R.canDrop(g, 5, 2), 'a chip off a stack can go to an empty spot');
  assert.ok(R.canDrop(g, 0, 2), 'a stash chip can go to an empty spot');
});

test('put it back only when nothing was revealed', () => {
  const g = gameWith({ 4: ['0'], 5: ['1', '0'] });
  assert.ok(R.canPutBack(g, 0), 'from the stash');
  assert.ok(R.canPutBack(g, 4), 'a lone chip');
  assert.ok(!R.canPutBack(g, 5), 'off a stack: the chip under it was seen');
});

test('playing a move', () => {
  const g = gameWith({ 4: ['0'], 5: ['1', '0'], 6: ['1'] });
  const n = R.play(g, 5, 6);
  assert.notEqual(n, g, 'returns a new game');
  assert.equal(g.stacks[5].length, 2, 'the old game is untouched');
  assert.equal(n.stacks[5].length, 1);
  assert.equal(R.top(n.stacks[6]).p, '0');
  assert.equal(n.blocked, 6, 'the destination is locked for the next player');
  assert.equal(n.turn, 1);
  assert.deepEqual([n.last.from, n.last.to, n.last.by, n.last.uncovered], [5, 6, 0, true]);
  assert.equal(n.moves, 1);
  assert.throws(() => R.play(n, 6, 4), /Illegal/, 'the locked stack cannot be picked');
});

test('the score is checked after the drop, and the player who reaches five wins', () => {
  const g = gameWith({ 2: ['0'], 3: ['0'], 4: ['0'], 5: ['0'], 6: ['1'], 7: ['1'] });
  const n = R.play(g, 0, 8);
  assert.equal(n.winner, 0);
  assert.equal(n.turn, 0, 'the turn does not pass after a win');
  assert.ok(!R.canPick(n, 2), 'nothing can be picked once the game is over');
});

test('uncovering the opponent\'s fifth chip makes them win', () => {
  const g = gameWith({ 2: ['1'], 3: ['1'], 4: ['1'], 5: ['1'], 6: ['1', '0'], 7: ['0'] });
  const n = R.play(g, 6, 7);
  assert.equal(n.winner, 1);
});

test('random games keep every chip and every rule', () => {
  let seed = 12345;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  let finished = 0;
  for (let game = 0; game < 500; game++) {
    let g = R.newGame(rand);
    for (let m = 0; m < 400 && g.winner === null; m++) {
      const moves = R.legalMoves(g);
      assert.ok(moves.length > 0, 'a player always has a move');
      const [f, t] = moves[Math.floor(rand() * moves.length)];
      assert.notEqual(f, t);
      assert.notEqual(f, g.blocked);
      g = R.play(g, f, t);
      assert.ok(R.isGame(g), 'chip counts and stack heights stay valid');
    }
    if (g.winner !== null) {
      finished++;
      assert.ok(R.onTop(g, g.winner) >= 5);
      assert.ok(R.onTop(g, 1 - g.winner) < 5);
    }
  }
  assert.ok(finished > 400, 'most random games end with a winner (' + finished + ' of 500)');
});

test('who buried whom', () => {
  let g = gameWith({ 4: ['0'], 5: ['1'], 6: ['1'] });
  g = R.play(g, 5, 4);           // player 0 moves the 1 from spot 5 onto their own 0
  assert.deepEqual(R.buriedBy(g), { 0: 0, 1: 0 }, 'covering your own chip does not count');
  g = R.play(g, 1, 6);           // player 1 drops a stash 1 on their own 1
  assert.deepEqual(R.buriedBy(g), { 0: 0, 1: 0 });
  g = R.play(g, 0, 6);           // player 0 buries player 1's chip
  assert.deepEqual(R.buriedBy(g), { 0: 1, 1: 0 });
});

test('isGame rejects broken saves', () => {
  assert.ok(!R.isGame(null));
  assert.ok(!R.isGame({ v: 1, stacks: [], turn: 0 }));
  const g = R.newGame();
  g.stacks[0].pop();
  assert.ok(!R.isGame(g), 'a missing chip');
});

// Tests for the computer opponent (js/computer.js in the gh-pages "online" folder).
//
// Run with Node 18 or later, from the 5visible folder:
//   node --test tests/online/computer.test.mjs
// Set TIKITALA_ONLINE to the online folder if the two checkouts are not side by side.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const folder = [
  process.env.TIKITALA_ONLINE,
  resolve(here, '../../../tikitala.com/online'),
  resolve(here, '../../../online'),
].filter(Boolean).find((p) => existsSync(join(p, 'js', 'computer.js')));
if (!folder) throw new Error('Cannot find the online folder. Set TIKITALA_ONLINE.');
const R = await import(pathToFileURL(join(folder, 'js', 'rules.js')).href);
const C = await import(pathToFileURL(join(folder, 'js', 'computer.js')).href);

function seeded(seed) {
  return () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
}

function gameWith(spots, { turn = 1, blocked = -1 } = {}) {
  let id = 0;
  const stacks = Array.from({ length: 11 }, () => []);
  const used = { 0: 0, 1: 0 };
  for (const [i, chips] of Object.entries(spots)) for (const p of chips) { stacks[i].push({ id: id++, p, r: 0 }); used[p]++; }
  for (const p of ['0', '1']) for (let k = used[p]; k < 8; k++) stacks[Number(p)].push({ id: id++, p, r: 0 });
  return { v: 1, stacks, turn, blocked, last: null, moves: 0, winner: null, passed: false };
}

test('the three levels', () => {
  assert.deepEqual(C.LEVEL_IDS, ['friendly', 'clever', 'ruthless']);
  assert.equal(C.LEVELS.friendly.forget, 0.30);
  assert.equal(C.LEVELS.clever.forget, 0.12);
  assert.equal(C.LEVELS.ruthless.forget, 0.03);
  assert.equal(C.LEVELS.friendly.random, 0.40);
});

test('memory: top chips are always seen, buried chips can be forgotten', () => {
  const g = gameWith({ 4: ['0', '1'], 5: ['1', '0', '1'] });
  const mem = C.freshMemory(g);
  const always = () => 0;              // random() below every rate: forget everything buried
  const after = C.afterMove(g, mem, 'clever', always);
  assert.equal(after[g.stacks[4][1].id], true, 'top chip stays known');
  assert.equal(after[g.stacks[4][0].id], false, 'buried chip forgotten');
  assert.equal(C.forgottenCount(g, after), 3);
  const never = () => 0.99;
  assert.equal(C.forgottenCount(g, C.afterMove(g, mem, 'friendly', never)), 0);
  // a forgotten chip that comes back to the top is remembered again
  const lifted = R.play({ ...g, turn: 0 }, 4, 6);
  const again = C.afterMove(lifted, after, 'clever', never);
  assert.equal(again[g.stacks[4][0].id], true);
});

test('guesses keep the counts and never change what is known', () => {
  const g = gameWith({ 2: ['0', '1', '0'], 3: ['1', '1'], 4: ['0', '0', '1'], 6: ['1'] });
  const mem = C.freshMemory(g);
  mem[g.stacks[2][0].id] = false;
  mem[g.stacks[4][1].id] = false;
  const rand = seeded(7);
  for (let k = 0; k < 50; k++) {
    const w = C.guessWorld(g, mem, rand);
    assert.ok(C.sameTops(w, g));
    assert.equal(R.onTop(w, 0) + R.onTop(w, 1), R.onTop(g, 0) + R.onTop(g, 1));
    const count = (x, p) => x.stacks.slice(2).flat().filter((c) => c.p === p).length;
    assert.equal(count(w, '0'), count(g, '0'));
    assert.equal(count(w, '1'), count(g, '1'));
    assert.equal(w.stacks[3][0].p, '1', 'remembered chips are left alone');
  }
});

test('every level only ever plays legal moves', () => {
  const rand = seeded(42);
  for (const level of C.LEVEL_IDS) {
    let g = R.newGame(rand);
    let mem = C.freshMemory(g);
    for (let m = 0; m < 120 && g.winner === null; m++) {
      const move = g.turn === 1 ? C.chooseMove(g, mem, level, rand) : R.legalMoves(g)[0];
      assert.ok(R.canPick(g, move[0]) && R.canDrop(g, move[0], move[1]), level + ' plays a legal move');
      g = R.play(g, move[0], move[1]);
      mem = C.afterMove(g, mem, level, rand);
    }
  }
});

test('clever and ruthless take a win when they see one', () => {
  const g = gameWith({ 2: ['1'], 3: ['1'], 4: ['1'], 5: ['1'], 6: ['0'], 7: ['0'] });
  for (const level of ['clever', 'ruthless']) {
    const [f, t] = C.chooseMove(g, C.freshMemory(g), level, seeded(3));
    assert.equal(R.play(g, f, t).winner, 1, level);
  }
});

test('clever does not hand over the win when it can avoid it', () => {
  // player 0 has 4 on top; if the computer leaves an empty spot open and its stash chip elsewhere,
  // player 0 can win by dropping a stash chip on an empty spot... unless the computer covers one of the 0s
  const g = gameWith({ 2: ['0'], 3: ['0'], 4: ['0'], 5: ['0'], 6: ['1'], 7: ['1'] });
  const rand = seeded(11);
  for (let k = 0; k < 10; k++) {
    const [f, t] = C.chooseMove(g, C.freshMemory(g), 'clever', rand);
    const after = R.play(g, f, t);
    const canWin = R.legalMoves(after).some(([a, b]) => R.play(after, a, b).winner === 0);
    assert.ok(!canWin || R.onTop(after, 0) < 4, 'no winning reply left open when there was a choice');
  }
});

test('stronger levels win more often against a casual player', () => {
  // the computer (player 1) against Friendly playing as player 0
  const rand = seeded(2026);
  const play = (level, games) => {
    let wins = 0;
    for (let n = 0; n < games; n++) {
      let g = R.newGame(rand);
      let mem0 = C.freshMemory(g), mem1 = C.freshMemory(g);
      for (let m = 0; m < 200 && g.winner === null; m++) {
        const move = g.turn === 1 ? C.chooseMove(g, mem1, level, rand) : C.chooseMove(g, mem0, 'friendly', rand);
        g = R.play(g, move[0], move[1]);
        mem0 = C.afterMove(g, mem0, 'friendly', rand);
        mem1 = C.afterMove(g, mem1, level, rand);
      }
      if (g.winner === 1) wins++;
    }
    return wins;
  };
  const friendly = play('friendly', 30);
  const ruthless = play('ruthless', 30);
  assert.ok(ruthless > friendly, 'ruthless ' + ruthless + '/30 beats friendly ' + friendly + '/30');
});

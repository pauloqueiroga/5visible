// TIKITALA Online: screens, pass & play, the lessons and the end-of-game reveal.
// Rules live in rules.js, chips in chip.js and the table in board.js.

import * as R from './rules.js';
import { chipStack } from './chip.js';
import { Board, boardScale } from './board.js';
import { LESSONS, lessonGame } from './lessons.js';

const SAVE_KEY = 'tikitala.online.passplay.v1';
const LEARNED_KEY = 'tikitala.online.learned.v1';
const COLORS = true;            // the orange and blue player rings
const END_PAUSE = 1300;         // how long the winning table shows before the reveal

const $ = (id) => document.getElementById(id);

// ---------- storage (every call can fail in private windows) ----------

const store = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* not saved */ } },
  remove(key) { try { localStorage.removeItem(key); } catch (e) { /* nothing to do */ } }
};

function track(name, params) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
}

// ---------- state ----------

const ui = {
  screen: null,      // 'home' | 'game' | 'over'
  mode: 'play',      // 'play' | 'lesson'
  game: null,        // the pass & play game
  hand: -1,          // the stack the chip in your hand came from, or -1
  ending: false,     // the winning table is showing, the reveal is about to open
  landed: -1,        // the spot a chip just dropped on (for the settle animation)
  lessonIndex: 0,
  lesson: null,      // { game, done }
  timer: 0
};

function loadGame() {
  const saved = store.get(SAVE_KEY);
  return R.isGame(saved) ? saved : null;
}

function saveGame() {
  if (ui.game && ui.game.winner === null) store.set(SAVE_KEY, ui.game);
  else store.remove(SAVE_KEY);
}

function current() {
  return ui.mode === 'lesson' ? ui.lesson.game : ui.game;
}

function compact() {
  return window.matchMedia('(max-height: 759px)').matches;
}

function announce(text) {
  const live = $('live');
  live.textContent = '';
  window.setTimeout(() => { live.textContent = text; }, 30);
}

let toastTimer = 0;
function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { t.hidden = true; }, 2400);
}

// ---------- routing: #play, #learn, #learn/2, or home ----------

function route() {
  window.clearTimeout(ui.timer);
  ui.hand = -1;
  ui.ending = false;
  ui.landed = -1;
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('learn')) {
    const n = Number(hash.split('/')[1] || 1);
    startLesson(Math.max(1, Math.min(LESSONS.length, n || 1)) - 1);
  } else if (hash === 'play') {
    ui.mode = 'play';
    if (!ui.game) ui.game = loadGame();
    if (!ui.game) { ui.game = R.newGame(); track('game_start', { mode: 'pass_and_play' }); saveGame(); }
    show(ui.game.winner !== null ? 'over' : 'game');
  } else {
    show('home');
  }
}

function show(screen) {
  const changed = ui.screen !== screen;
  ui.screen = screen;
  for (const id of ['home', 'game', 'over']) $('screen-' + id).hidden = id !== screen;
  if (screen === 'home') renderHome();
  if (screen === 'game') renderGame();
  if (screen === 'over') renderOver();
  if (changed) {
    const focus = screen === 'home' ? $('home-title') : screen === 'over' ? $('over-title') : (ui.mode === 'lesson' ? $('lesson-title') : null);
    if (focus) focus.focus({ preventScroll: true });
    $('screen-' + screen).scrollTop = 0;
  }
}

// ---------- home ----------

function renderHome() {
  const saved = ui.game && ui.game.winner === null ? ui.game : loadGame();
  if (saved) {
    $('play-label').textContent = 'Continue your game';
    $('play-sub').textContent = 'Player ' + saved.turn + '’s move · ' + R.onTop(saved, 0) + '–' + R.onTop(saved, 1);
    $('btn-new').hidden = false;
  } else {
    $('play-label').textContent = 'Pass & play';
    $('play-sub').textContent = 'Two players on this device';
    $('btn-new').hidden = true;
  }
  const chips = document.querySelector('.home-chips');
  if (!chips.childElementCount) {
    const deco = [
      { player: '1', count: 2, size: 92, rot: 22, left: 14, top: 8 },
      { player: '0', count: 3, size: 84, rot: -16, left: 112, top: 0 },
      { player: '1', count: 1, size: 78, rot: 26, left: 214, top: 22 }
    ];
    for (const d of deco) {
      const el = chipStack({ ...d, colors: COLORS });
      el.style.left = d.left + 'px';
      el.style.top = d.top + 'px';
      chips.appendChild(el);
    }
  }
}

// ---------- the table, for both the game and the lessons ----------

let board = null;

function lessonAllows(list, i) {
  return ui.mode !== 'lesson' || !list || list.includes(i);
}

function interactive() {
  if (ui.ending) return false;
  if (ui.mode === 'lesson') return !ui.lesson.done;
  return ui.game.winner === null;
}

function tap(i) {
  if (!interactive()) return;
  const g = current();
  const L = ui.mode === 'lesson' ? LESSONS[ui.lessonIndex] : null;
  if (ui.hand < 0) {
    if (R.canPick(g, i) && lessonAllows(L && L.allowFrom, i)) {
      ui.hand = i;
      ui.landed = -1;
      renderGame();
    }
    return;
  }
  if (i === ui.hand) {
    if (R.canPutBack(g, i)) putBack();
    return;
  }
  if (R.canDrop(g, ui.hand, i) && lessonAllows(L && L.allowTo, i)) drop(ui.hand, i);
}

function putBack() {
  if (ui.hand < 0 || !R.canPutBack(current(), ui.hand)) return;
  ui.hand = -1;
  renderGame();
  announce('Chip put back. ' + $('headline').textContent + '.');
}

function drop(from, to) {
  const before = current();
  const after = R.play(before, from, to);
  ui.hand = -1;
  ui.landed = to;
  if (ui.mode === 'lesson') {
    ui.lesson.game = after;
    ui.lesson.done = true;
    track('lesson_complete', { lesson: ui.lessonIndex + 1 });
    if (ui.lessonIndex === LESSONS.length - 1) { store.set(LEARNED_KEY, true); track('tutorial_complete'); }
    renderGame();
    announce(LESSONS[ui.lessonIndex].doneTitle + '. ' + LESSONS[ui.lessonIndex].doneText);
    return;
  }
  ui.game = after;
  saveGame();
  const mover = 'Player ' + before.turn;
  if (after.winner !== null) {
    ui.ending = true;
    renderGame();
    announce(mover + ' moved a chip. Player ' + after.winner + ' has five on top and wins.');
    track('game_end', { moves: after.moves, winner: after.winner });
    ui.timer = window.setTimeout(() => { ui.ending = false; show('over'); }, END_PAUSE);
    return;
  }
  renderGame();
  announce(mover + ' moved a chip' + (after.last.uncovered ? ' and uncovered one' : '') + '. ' +
    (after.passed ? 'Player ' + (1 - after.turn) + ' has no legal move, so ' : '') + 'Player ' + after.turn + '’s move.');
}

function pips(el, n, p) {
  el.replaceChildren();
  for (let k = 0; k < 5; k++) {
    const s = document.createElement('span');
    s.className = 'pip' + (k < n ? ' is-' + p : '');
    el.appendChild(s);
  }
}

function renderGame() {
  const lesson = ui.mode === 'lesson';
  const L = lesson ? LESSONS[ui.lessonIndex] : null;
  const done = lesson && ui.lesson.done;
  const g = current();
  const me = lesson ? 0 : g.turn;                // the panel at the bottom is the player whose turn it is
  const other = 1 - me;
  const nameOf = (p) => lesson ? (p === 0 ? 'You · 0' : 'Them · 1') : 'Player ' + p;
  const owner = (p) => (String(p) === String(me) ? 'your ' : 'their ') + p;
  const holding = ui.hand >= 0;
  const live = interactive();
  const tileChip = compact() ? 44 : 56;

  $('screen-game').classList.toggle('is-lesson', lesson);

  // header and the panel above the table
  if (lesson) {
    $('lesson-count').textContent = 'LESSON ' + (ui.lessonIndex + 1) + ' OF ' + LESSONS.length;
    [...$('lesson-bars').children].forEach((b, k) => b.classList.toggle('is-done', k <= ui.lessonIndex));
    $('lesson-title').textContent = L.title;
    $('lesson-body').textContent = L.body;
    pips($('lesson-pips-0'), R.onTop(g, 0), 0);
    pips($('lesson-pips-1'), R.onTop(g, 1), 1);
  } else {
    const n = g.stacks[other].length;
    $('other-tile').replaceChildren(chipStack({ player: String(other), count: Math.min(n, 3), size: 40, rot: 8, colors: COLORS }));
    $('other-name').textContent = nameOf(other);
    $('other-stash').textContent = n ? n + (n === 1 ? ' chip' : ' chips') + ' left in stash' : 'No chips left in stash';
    pips($('other-pips'), R.onTop(g, other), other);
    $('other-score').textContent = R.onTop(g, other) + ' / 5 ON TOP';
  }

  // the nine spots
  const showLast = !holding && !ui.ending && !done && g.last && g.last.by !== me;
  const spots = {};
  for (let i = 2; i <= 10; i++) {
    const stack = g.stacks[i];
    let count = stack.length;
    let topChip = R.top(stack);
    let state = 'idle';
    let tag = '', tagKind = '';
    let enabled = false;
    if (holding && live) {
      if (i === ui.hand) {
        count = stack.length - 1;
        topChip = count ? stack[count - 1] : null;
        state = 'origin';
        if (count) tag = 'UNCOVERED';
        enabled = R.canPutBack(g, i);
      } else if (R.canDrop(g, ui.hand, i) && lessonAllows(L && L.allowTo, i)) {
        state = 'target';
        enabled = true;
      } else {
        state = 'dim';
        if (stack.length >= R.MAX_STACK) { tag = 'FULL'; tagKind = 'full'; }
      }
    } else {
      if (i === g.blocked && count) state = 'locked';
      if (live && lesson && L.allowFrom && !L.allowFrom.includes(i)) state = state === 'locked' ? 'locked' : 'dim';
      enabled = live && R.canPick(g, i) && lessonAllows(L && L.allowFrom, i);
      if (showLast && g.last.uncovered && g.last.from === i) tag = 'UNCOVERED';
      if (lesson && !done && L.tags && L.tags[i]) tag = L.tags[i];
      if (ui.ending && topChip && Number(topChip.p) === g.winner) state = 'target';
    }
    const label = state === 'origin'
      ? 'Where the chip in your hand came from' + (count ? ', ' + owner(topChip.p) + ' now on top' : '') + (enabled ? '. Tap to put it back' : '')
      : count === 0
        ? (state === 'target' ? 'Empty spot. Place your chip here' : 'Empty spot')
        : (state === 'locked' ? 'Locked: their last move. ' : '') + 'Stack of ' + count + ', ' + owner(topChip.p) + ' on top' + (state === 'target' ? '. Place your chip here' : '');
    spots[i] = { player: topChip ? topChip.p : '0', count, state, rot: topChip ? topChip.r : 0, landed: i === ui.landed, label, tag, tagKind, enabled };
  }
  let bubble = null;
  if (lesson && !done) bubble = holding ? (L.placeBubble || null) : (L.pickBubble || null);
  board.update({ spots, trail: showLast ? { from: g.last.from, to: g.last.to } : null, bubble, colors: COLORS });

  // the words in your panel
  const headline = $('headline');
  const instruction = $('instruction');
  headline.classList.remove('is-waiting');
  const myStash = g.stacks[me].length;
  if (done) {
    headline.textContent = L.doneTitle;
    instruction.textContent = L.doneText;
  } else if (ui.ending) {
    headline.textContent = 'Five on top!';
    instruction.textContent = 'Player ' + g.winner + ' wins. Every stack is about to flip open.';
  } else if (holding) {
    headline.textContent = 'Place it';
    instruction.textContent = (L && L.placeText) || (ui.hand >= 2 && !R.canPutBack(g, ui.hand)
      ? 'You lifted it off a stack and saw what was under it, so it can’t go back. Tap a ringed spot.'
      : 'Tap a ringed spot. A stack holds 3 chips at most.');
  } else {
    headline.textContent = lesson ? 'Your move' : 'Player ' + me + '’s move';
    const passed = !lesson && g.passed ? 'Player ' + other + ' had no legal move. ' : '';
    instruction.textContent = (L && L.pickText) || (passed + (myStash
      ? 'Pick up a chip: any top chip on the table or a new one from your stash.'
      : 'Pick up any top chip on the table. Your stash is empty.'));
  }

  // the stash, or the chip in your hand, or the lesson's next button
  $('row-next').hidden = !done;
  $('row-pick').hidden = done || holding;
  $('row-place').hidden = done || !holding;
  if (done) {
    const last = ui.lessonIndex === LESSONS.length - 1;
    $('next-label').textContent = last ? 'Play a game' : 'Next lesson';
  } else if (holding) {
    const chip = R.top(g.stacks[ui.hand]);
    $('hand-tile').replaceChildren(chipStack({ player: chip.p, count: 1, size: tileChip, state: 'lifted', rot: chip.r, colors: COLORS }));
    const whose = String(chip.p) === String(me) ? 'Your ' : 'Their ';
    $('hand-sub').textContent = ui.hand < 2 ? 'A new ' + chip.p + ' from your stash'
      : whose + chip.p + (g.stacks[ui.hand].length === 1 ? ' from the table' : ' from a stack');
    const back = R.canPutBack(g, ui.hand);
    $('btn-tray').setAttribute('aria-label', 'In your hand: ' + $('hand-sub').textContent + (back ? '. Tap to put it back' : ''));
    $('btn-putback').hidden = !back;
    $('no-takebacks').hidden = back;
  } else {
    const canStash = live && R.canPick(g, me) && lessonAllows(L && L.allowFrom, me);
    $('stash-tile').replaceChildren(chipStack({ player: String(me), count: myStash, size: tileChip, rot: -8, colors: COLORS }));
    $('stash-sub').textContent = myStash ? myStash + ' left' + (canStash ? ' · tap for a new chip' : '') : 'None left';
    const stashBtn = $('btn-stash');
    stashBtn.classList.toggle('is-active', canStash);
    stashBtn.setAttribute('aria-disabled', canStash ? 'false' : 'true');
    stashBtn.setAttribute('aria-label', myStash ? 'Stash, ' + myStash + ' left' + (canStash ? '. Tap to pick up a new chip' : '') : 'Stash, none left');
    $('me-name').textContent = nameOf(me);
    pips($('me-pips'), R.onTop(g, me), me);
    $('me-score').textContent = R.onTop(g, me) + ' / 5 ON TOP';
  }
}

// ---------- lessons ----------

function startLesson(index) {
  ui.mode = 'lesson';
  ui.lessonIndex = index;
  ui.lesson = { game: lessonGame(LESSONS[index]), done: false };
  ui.hand = -1;
  ui.landed = -1;
  const wasGame = ui.screen === 'game';
  show('game');
  if (wasGame) $('lesson-title').focus({ preventScroll: true });
  if (index === 0) track('tutorial_begin');
}

function nextLesson() {
  if (ui.lessonIndex < LESSONS.length - 1) location.hash = '#learn/' + (ui.lessonIndex + 2);
  else location.hash = '#play';
}

// ---------- game over ----------

function renderOver() {
  const g = ui.game;
  const w = g.winner;
  const l = 1 - w;
  const title = $('over-title');
  title.textContent = 'Player ' + w + ' wins';
  title.classList.toggle('is-long', title.textContent.length > 8);
  $('over-sub').textContent = R.onTop(g, w) + ' on top. Player ' + l + ' had ' + R.onTop(g, l) + '.';
  $('over-tag').textContent = 'GAME OVER · ' + g.moves + ' MOVES';
  $('over-chip').replaceChildren(chipStack({ player: String(w), count: 3, size: 64, rot: -14, colors: COLORS }));

  // every stack, flipped open: the top chip at the top left and in front, the rest stepping down to the right
  const grid = $('reveal-grid');
  grid.replaceChildren();
  const order = [2, 4, 3, 5, 7, 6, 8, 10, 9];     // left, middle, right columns, row by row
  for (const i of order) {
    const cell = document.createElement('div');
    cell.className = 'reveal-cell';
    const stair = document.createElement('div');
    stair.className = 'reveal-stair';
    const chips = g.stacks[i].slice().reverse();
    if (!chips.length) {
      const e = chipStack({ count: 0, size: 40 });
      e.style.left = '22px';
      e.style.top = '12px';
      stair.appendChild(e);
      cell.setAttribute('aria-label', 'Empty spot');
    } else {
      chips.forEach((c, d) => {
        const e = chipStack({ player: c.p, count: 1, size: 40, rot: c.r, colors: COLORS });
        e.style.left = (d * 22) + 'px';
        e.style.top = (d * 12) + 'px';
        e.style.zIndex = String(10 - d);
        stair.appendChild(e);
      });
      cell.setAttribute('aria-label', 'Stack, top to bottom: ' + chips.map((c) => c.p).join(', '));
    }
    cell.setAttribute('role', 'img');
    cell.appendChild(stair);
    grid.appendChild(cell);
  }
  const b = R.buried(g);
  $('reveal-text').textContent = b[0] + ' of Player 0’s chips and ' + b[1] + ' of Player 1’s ended up buried. Did you remember them all?';
}

async function share() {
  const g = ui.game;
  const w = g.winner;
  const text = 'Player ' + w + ' won TIKITALA ' + R.onTop(g, w) + ' to ' + R.onTop(g, 1 - w) + ' in ' + g.moves + ' moves. Five on top wins.';
  const url = 'https://www.tikitala.com/online/';
  try {
    if (navigator.share) { await navigator.share({ title: 'TIKITALA', text, url }); return; }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(text + ' ' + url);
    toast('Copied. Paste it anywhere.');
  } catch (e) {
    toast('Share this link: ' + url);
  }
}

// ---------- fitting the board to the screen ----------

function fitBoard() {
  const table = $('table');
  const w = table.clientWidth;
  const h = table.clientHeight;
  if (!w || !h) return;
  const k = boardScale(w, h);
  const outer = $('board-outer');
  outer.style.width = (330 * k).toFixed(1) + 'px';
  outer.style.height = (416 * k).toFixed(1) + 'px';
  const b = $('board');
  b.style.transform = 'scale(' + k.toFixed(4) + ')';
  const inv = Math.max(1, 1 / k).toFixed(3);
  if (b.style.getPropertyValue('--inv') !== inv) {
    b.style.setProperty('--inv', inv);
    if (ui.screen === 'game' && ui.mode === 'lesson') renderGame();   // lesson bubbles are sized from it
  }
}

// ---------- start ----------

function init() {
  board = new Board($('board'), tap);

  $('btn-play').addEventListener('click', () => {
    if (ui.game && ui.game.winner !== null) ui.game = null;   // a finished game: start a new one
    if (location.hash === '#play') route(); else location.hash = '#play';
  });
  $('btn-new').addEventListener('click', () => {
    ui.game = R.newGame();
    saveGame();
    track('game_start', { mode: 'pass_and_play' });
    if (location.hash === '#play') route(); else location.hash = '#play';
  });
  $('btn-stash').addEventListener('click', () => {
    const g = current();
    tap(ui.mode === 'lesson' ? 0 : g.turn);
  });
  $('btn-tray').addEventListener('click', putBack);
  $('btn-putback').addEventListener('click', putBack);
  $('btn-next').addEventListener('click', nextLesson);
  $('lesson-skip').addEventListener('click', () => store.set(LEARNED_KEY, true));
  $('btn-rematch').addEventListener('click', () => {
    ui.game = R.newGame();
    saveGame();
    track('game_start', { mode: 'pass_and_play', rematch: true });
    ui.hand = -1;
    show('game');
  });
  $('btn-share').addEventListener('click', share);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ui.screen === 'game') putBack(); });

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitBoard).observe($('table'));
  else window.addEventListener('resize', fitBoard);
  window.matchMedia('(max-height: 759px)').addEventListener('change', () => { if (ui.screen === 'game') renderGame(); });
  window.addEventListener('hashchange', route);

  ui.game = loadGame();
  route();
  fitBoard();
}

init();

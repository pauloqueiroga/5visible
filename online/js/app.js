// TIKITALA Online: screens, playing the computer, pass & play, the lessons and the end-of-game reveal.
// Rules live in rules.js, the computer in computer.js, chips in chip.js and the table in board.js.
// Every word comes from the string tables through i18n.js.

import * as R from './rules.js';
import * as AI from './computer.js';
import { chipStack } from './chip.js';
import { Board, boardScale } from './board.js';
import { LESSONS, lessonGame } from './lessons.js';
import { t, has, LANGUAGES, language, chosenLanguage, chooseLanguage, setLanguage, translatePage } from './i18n.js';

const PASS_KEY = 'tikitala.online.passplay.v1';
const CPU_KEY = 'tikitala.online.computer.v1';
const LEVEL_KEY = 'tikitala.online.level.v1';
const LEARNED_KEY = 'tikitala.online.learned.v1';
const COLORS = true;            // the orange and blue player rings
const END_PAUSE = 1300;         // how long the winning table shows before the reveal
const THINK = 800;              // how long the computer "thinks" before its move

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
  screen: null,      // 'home' | 'levels' | 'game' | 'over'
  mode: 'pass',      // 'pass' | 'cpu' | 'lesson'
  pass: null,        // the pass & play game
  cpu: null,         // { game, level, mem }: the game against the computer and what it remembers
  hand: -1,          // the stack the chip in your hand came from, or -1
  ending: false,     // the winning table is showing, the reveal is about to open
  thinking: false,   // the computer is about to move
  landed: -1,        // the spot a chip just dropped on (for the settle animation)
  lessonIndex: 0,
  lesson: null,      // { game, done }
  timer: 0
};

function loadPass() {
  const saved = store.get(PASS_KEY);
  return R.isGame(saved) ? saved : null;
}

function loadCpu() {
  const saved = store.get(CPU_KEY);
  if (!saved || !R.isGame(saved.game) || !AI.LEVELS[saved.level] || typeof saved.mem !== 'object' || !saved.mem) return null;
  return saved;
}

function save() {
  if (ui.pass && ui.pass.winner === null) store.set(PASS_KEY, ui.pass); else store.remove(PASS_KEY);
  if (ui.cpu && ui.cpu.game.winner === null) store.set(CPU_KEY, ui.cpu); else store.remove(CPU_KEY);
}

function newCpuGame(level) {
  const game = R.newGame();
  store.set(LEVEL_KEY, level);
  track('game_start', { mode: 'computer', level });
  return { game, level, mem: AI.freshMemory(game) };
}

function newPassGame() {
  track('game_start', { mode: 'pass_and_play' });
  return R.newGame();
}

function current() {
  if (ui.mode === 'lesson') return ui.lesson.game;
  if (ui.mode === 'cpu') return ui.cpu.game;
  return ui.pass;
}

function setCurrent(game) {
  if (ui.mode === 'lesson') ui.lesson.game = game;
  else if (ui.mode === 'cpu') ui.cpu.game = game;
  else ui.pass = game;
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
  const el = $('toast');
  el.textContent = text;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { el.hidden = true; }, 2400);
}

// ---------- words ----------

function levelName(level) {
  return t('level.' + level + '.name');
}

// who a sentence is about: 'you' or 'computer' against the computer, 'player' in pass & play
function who(p) {
  if (ui.mode === 'cpu') return p === 0 ? 'you' : 'computer';
  return 'player';
}

// a lesson's own words for one moment, or '' if that lesson has none
function lessonText(L, part) {
  const key = 'lesson.' + L.id + '.' + part;
  return has(key) ? t(key) : '';
}

// one-line display text (data-fit) shrinks until it fits its box, but not below data-fit px;
// if even that is too wide, it wraps
function fitText() {
  document.querySelectorAll('[data-fit]').forEach((el) => {
    el.style.fontSize = '';
    el.style.whiteSpace = '';
    if (!el.clientWidth || el.scrollWidth <= el.clientWidth) return;
    const min = Number(el.dataset.fit);
    let size = Math.floor(parseFloat(getComputedStyle(el).fontSize) * el.clientWidth / el.scrollWidth);
    el.style.fontSize = Math.max(min, size) + 'px';
    while (el.scrollWidth > el.clientWidth && size > min) el.style.fontSize = --size + 'px';
    if (el.scrollWidth > el.clientWidth) el.style.whiteSpace = 'normal';
  });
}

// ---------- routing: #computer, #computer/play, #play, #learn, #learn/2, or home ----------

function route() {
  window.clearTimeout(ui.timer);
  ui.hand = -1;
  ui.ending = false;
  ui.thinking = false;
  ui.landed = -1;
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('learn')) {
    const n = Number(hash.split('/')[1] || 1);
    startLesson(Math.max(1, Math.min(LESSONS.length, n || 1)) - 1);
  } else if (hash === 'play') {
    ui.mode = 'pass';
    if (!ui.pass) ui.pass = loadPass();
    if (!ui.pass) { ui.pass = newPassGame(); save(); }
    show(ui.pass.winner !== null ? 'over' : 'game');
  } else if (hash === 'computer/play') {
    ui.mode = 'cpu';
    if (!ui.cpu) ui.cpu = loadCpu();
    if (!ui.cpu) { location.replace('#computer'); return; }
    show(ui.cpu.game.winner !== null ? 'over' : 'game');
    if (ui.cpu.game.winner === null && ui.cpu.game.turn === 1) computerTurn();
  } else if (hash === 'computer') {
    show('levels');
  } else {
    show('home');
  }
}

function show(screen) {
  const changed = ui.screen !== screen;
  ui.screen = screen;
  for (const id of ['home', 'levels', 'game', 'over']) $('screen-' + id).hidden = id !== screen;
  if (screen === 'home') renderHome();
  if (screen === 'levels') renderLevels();
  if (screen === 'game') renderGame();
  if (screen === 'over') renderOver();
  fitText();
  if (changed) {
    const focus = { home: 'home-title', levels: 'levels-title', over: 'over-title' }[screen] || (ui.mode === 'lesson' ? 'lesson-title' : null);
    if (focus) $(focus).focus({ preventScroll: true });
    $('screen-' + screen).scrollTop = 0;
  }
}

// ---------- home and the computer levels ----------

function renderHome() {
  const cpu = ui.cpu && ui.cpu.game.winner === null ? ui.cpu : loadCpu();
  if (cpu) {
    $('computer-sub').textContent = t('home.computer.continue', { level: levelName(cpu.level), a: R.onTop(cpu.game, 0), b: R.onTop(cpu.game, 1) });
    $('btn-computer-new').hidden = false;
  } else {
    $('computer-sub').textContent = t('home.computer.sub');
    $('btn-computer-new').hidden = true;
  }
  const pass = ui.pass && ui.pass.winner === null ? ui.pass : loadPass();
  if (pass) {
    $('play-sub').textContent = t('home.pass.continue', { p: pass.turn, a: R.onTop(pass, 0), b: R.onTop(pass, 1) });
    $('btn-new').hidden = false;
  } else {
    $('play-sub').textContent = t('home.pass.sub');
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

function renderLevels() {
  const last = store.get(LEVEL_KEY);
  document.querySelectorAll('.level').forEach((b) => {
    const isLast = b.dataset.level === last;
    b.classList.toggle('is-last', isLast);
    b.querySelector('.level-last').hidden = !isLast;
  });
}

function startCpu(level) {
  window.clearTimeout(ui.timer);
  ui.cpu = newCpuGame(level);
  save();
  if (location.hash === '#computer/play') route(); else location.hash = '#computer/play';
}

// ---------- the table, for every mode ----------

let board = null;

function lessonAllows(list, i) {
  return ui.mode !== 'lesson' || !list || list.includes(i);
}

function interactive() {
  if (ui.ending || ui.thinking) return false;
  if (ui.mode === 'lesson') return !ui.lesson.done;
  const g = current();
  if (g.winner !== null) return false;
  return ui.mode !== 'cpu' || g.turn === 0;
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
  if (R.canDrop(g, ui.hand, i) && lessonAllows(L && L.allowTo, i)) commit(ui.hand, i);
}

function putBack() {
  if (ui.hand < 0 || !R.canPutBack(current(), ui.hand)) return;
  ui.hand = -1;
  renderGame();
  announce(t('live.putBack', { turn: $('headline').textContent }));
}

// plays a move for whoever's turn it is, then hands over to the next player
function commit(from, to) {
  const before = current();
  const after = R.play(before, from, to);
  ui.hand = -1;
  ui.landed = to;
  setCurrent(after);

  if (ui.mode === 'lesson') {
    const L = LESSONS[ui.lessonIndex];
    ui.lesson.done = true;
    track('lesson_complete', { lesson: ui.lessonIndex + 1 });
    if (ui.lessonIndex === LESSONS.length - 1) { store.set(LEARNED_KEY, true); track('tutorial_complete'); }
    renderGame();
    announce(lessonText(L, 'doneTitle') + '. ' + lessonText(L, 'doneText'));
    return;
  }

  if (ui.mode === 'cpu') ui.cpu.mem = AI.afterMove(after, ui.cpu.mem, ui.cpu.level);
  save();

  const what = t((after.last.uncovered ? 'live.uncovered.' : 'live.moved.') + who(before.turn), { p: before.turn });
  if (after.winner !== null) {
    ui.ending = true;
    renderGame();
    announce(what + ' ' + t('live.win.' + who(after.winner), { p: after.winner }));
    track('game_end', { mode: ui.mode === 'cpu' ? 'computer' : 'pass_and_play', level: ui.mode === 'cpu' ? ui.cpu.level : undefined, moves: after.moves, winner: after.winner });
    ui.timer = window.setTimeout(() => { ui.ending = false; show('over'); }, END_PAUSE);
    return;
  }
  renderGame();
  const passed = after.passed ? t('passed.' + who(1 - after.turn), { p: 1 - after.turn }) + ' ' : '';
  announce(what + ' ' + passed + t('live.next.' + who(after.turn), { p: after.turn }));
  if (ui.mode === 'cpu' && after.turn === 1) computerTurn();
}

function computerTurn() {
  ui.thinking = true;
  renderGame();
  window.clearTimeout(ui.timer);
  ui.timer = window.setTimeout(() => {
    if (ui.mode !== 'cpu' || ui.screen !== 'game') return;
    const g = ui.cpu.game;
    const move = AI.chooseMove(g, ui.cpu.mem, ui.cpu.level);
    ui.thinking = false;
    if (move) commit(move[0], move[1]);
    else renderGame();
  }, THINK);
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
  const cpu = ui.mode === 'cpu';
  const L = lesson ? LESSONS[ui.lessonIndex] : null;
  const done = lesson && ui.lesson.done;
  const g = current();
  const me = lesson || cpu ? 0 : g.turn;          // in pass & play, the bottom panel is whoever's turn it is
  const other = 1 - me;
  const nameOf = (p) => t(lesson ? (p === 0 ? 'name.you' : 'name.them') : cpu ? (p === 0 ? 'name.you' : 'name.computer') : 'name.player', { p });
  const owner = (p) => t(String(p) === String(me) ? 'spot.yours' : 'spot.theirs', { p });
  const holding = ui.hand >= 0;
  const live = interactive();
  const tileChip = compact() ? 44 : 56;

  $('screen-game').classList.toggle('is-lesson', lesson);
  $('mode-label').textContent = cpu ? t('head.computer', { level: levelName(ui.cpu.level) }) : t('head.pass');

  // header and the panel above the table
  if (lesson) {
    $('lesson-count').textContent = t('lesson.count', { n: ui.lessonIndex + 1, total: LESSONS.length });
    [...$('lesson-bars').children].forEach((b, k) => b.classList.toggle('is-done', k <= ui.lessonIndex));
    $('lesson-title').textContent = lessonText(L, 'title');
    $('lesson-body').textContent = lessonText(L, 'body');
    pips($('lesson-pips-0'), R.onTop(g, 0), 0);
    pips($('lesson-pips-1'), R.onTop(g, 1), 1);
  } else {
    const n = g.stacks[other].length;
    $('other-tile').replaceChildren(chipStack({ player: String(other), count: Math.min(n, 3), size: 40, rot: 8, colors: COLORS }));
    $('other-name').textContent = nameOf(other);
    $('other-stash').textContent = t('panel.otherStash', { n });
    pips($('other-pips'), R.onTop(g, other), other);
    $('other-score').textContent = t('score', { n: R.onTop(g, other) });
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
        if (count) tag = t('tag.uncovered');
        enabled = R.canPutBack(g, i);
      } else if (R.canDrop(g, ui.hand, i) && lessonAllows(L && L.allowTo, i)) {
        state = 'target';
        enabled = true;
      } else {
        state = 'dim';
        if (stack.length >= R.MAX_STACK) { tag = t('tag.full'); tagKind = 'full'; }
      }
    } else {
      if (i === g.blocked && count) state = 'locked';
      if (live && lesson && L.allowFrom && !L.allowFrom.includes(i)) state = state === 'locked' ? 'locked' : 'dim';
      enabled = live && R.canPick(g, i) && lessonAllows(L && L.allowFrom, i);
      if (showLast && g.last.uncovered && g.last.from === i) tag = t('tag.uncovered');
      if (lesson && !done && L.tag && L.tag.spot === i) tag = lessonText(L, 'tag');
      if (ui.ending && topChip && Number(topChip.p) === g.winner) state = 'target';
    }
    let label;
    if (state === 'origin') {
      label = count ? t('spot.originTop', { owner: owner(topChip.p) }) : t('spot.origin');
      if (enabled) label = t('spot.tapPutBack', { spot: label });
    } else if (count === 0) {
      label = t(state === 'target' ? 'spot.emptyTarget' : 'spot.empty');
    } else {
      label = t('spot.stack', { n: count, owner: owner(topChip.p) });
      if (state === 'locked') label = t('spot.locked', { spot: label });
      if (state === 'target') label = t('spot.target', { spot: label });
    }
    spots[i] = { player: topChip ? topChip.p : '0', count, state, rot: topChip ? topChip.r : 0, landed: i === ui.landed, label, tag, tagKind, enabled };
  }
  let bubble = null;
  if (lesson && !done) {
    const b = holding ? 'placeBubble' : 'pickBubble';
    if (L[b]) bubble = { spot: L[b].spot, text: lessonText(L, b) };
  }
  board.update({ spots, trail: showLast ? { from: g.last.from, to: g.last.to } : null, bubble, colors: COLORS });

  // the words in your panel
  const headline = $('headline');
  const instruction = $('instruction');
  headline.classList.remove('is-waiting');
  const myStash = g.stacks[me].length;
  if (done) {
    headline.textContent = lessonText(L, 'doneTitle');
    instruction.textContent = lessonText(L, 'doneText');
  } else if (ui.ending) {
    if (cpu && g.winner === 1) {
      headline.textContent = t('end.computerFive');
      instruction.textContent = t('end.flip');
    } else {
      headline.textContent = t('end.five');
      instruction.textContent = cpu ? t('end.youWin') : t('end.playerWins', { p: g.winner });
    }
  } else if (cpu && g.turn === 1) {
    headline.textContent = t('turn.computer');
    headline.classList.add('is-waiting');
    instruction.textContent = t('turn.thinking');
  } else if (holding) {
    headline.textContent = t('turn.place');
    instruction.textContent = (L && lessonText(L, 'place')) || t(ui.hand >= 2 && !R.canPutBack(g, ui.hand) ? 'turn.placeLifted' : 'turn.placeAny');
  } else {
    headline.textContent = lesson || cpu ? t('turn.you') : t('turn.player', { p: me });
    const passed = !lesson && g.passed ? t('passed.' + who(other), { p: other }) + ' ' : '';
    instruction.textContent = (L && lessonText(L, 'pick')) || (passed + t(myStash ? 'turn.pick' : 'turn.pickNoStash'));
  }

  // the stash, or the chip in your hand, or the lesson's next button
  $('row-next').hidden = !done;
  $('row-pick').hidden = done || holding;
  $('row-place').hidden = done || !holding;
  if (done) {
    const last = ui.lessonIndex === LESSONS.length - 1;
    $('next-label').textContent = t(last ? 'lesson.toComputer' : 'lesson.next');
  } else if (holding) {
    const chip = R.top(g.stacks[ui.hand]);
    $('hand-tile').replaceChildren(chipStack({ player: chip.p, count: 1, size: tileChip, state: 'lifted', rot: chip.r, colors: COLORS }));
    const whose = String(chip.p) === String(me) ? 'yours' : 'theirs';
    const from = g.stacks[ui.hand].length === 1 ? 'FromTable' : 'FromStack';
    const what = t(ui.hand < 2 ? 'hand.fromStash' : 'hand.' + whose + from, { p: chip.p });
    $('hand-sub').textContent = what;
    const back = R.canPutBack(g, ui.hand);
    const trayLabel = t('hand.label', { chip: what });
    $('btn-tray').setAttribute('aria-label', back ? t('spot.tapPutBack', { spot: trayLabel }) : trayLabel);
    $('btn-putback').hidden = !back;
    $('no-takebacks').hidden = back;
  } else {
    const canStash = live && R.canPick(g, me) && lessonAllows(L && L.allowFrom, me);
    $('stash-tile').replaceChildren(chipStack({ player: String(me), count: myStash, size: tileChip, rot: -8, colors: COLORS }));
    $('stash-sub').textContent = myStash ? t(canStash ? 'stash.leftTap' : 'stash.left', { n: myStash }) : t('stash.none');
    const stashBtn = $('btn-stash');
    stashBtn.classList.toggle('is-active', canStash);
    stashBtn.setAttribute('aria-disabled', canStash ? 'false' : 'true');
    stashBtn.setAttribute('aria-label', myStash ? t(canStash ? 'stash.labelTap' : 'stash.label', { n: myStash }) : t('stash.labelNone'));
    $('me-name').textContent = nameOf(me);
    pips($('me-pips'), R.onTop(g, me), me);
    $('me-score').textContent = t('score', { n: R.onTop(g, me) });
  }
  fitText();
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
  else location.hash = ui.cpu || loadCpu() ? '#computer/play' : '#computer';
}

// ---------- game over ----------

function renderOver() {
  const cpu = ui.mode === 'cpu';
  const g = current();
  const w = g.winner;
  const l = 1 - w;
  const score = { a: R.onTop(g, w), b: R.onTop(g, l) };
  if (cpu) {
    $('over-title').textContent = t(w === 0 ? 'over.youWin' : 'over.computerWins');
    $('over-sub').textContent = t(w === 0 ? 'over.youWinSub' : 'over.computerWinsSub', score);
  } else {
    $('over-title').textContent = t('over.playerWins', { p: w });
    $('over-sub').textContent = t('over.playerWinsSub', { ...score, p: l });
  }
  $('over-tag').textContent = t('over.tag', { n: g.moves });
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
      cell.setAttribute('aria-label', t('spot.empty'));
    } else {
      chips.forEach((c, d) => {
        const e = chipStack({ player: c.p, count: 1, size: 40, rot: c.r, colors: COLORS });
        e.style.left = (d * 22) + 'px';
        e.style.top = (d * 12) + 'px';
        e.style.zIndex = String(10 - d);
        stair.appendChild(e);
      });
      cell.setAttribute('aria-label', t('reveal.stack', { chips: chips.map((c) => c.p).join(', ') }));
    }
    cell.setAttribute('role', 'img');
    cell.appendChild(stair);
    grid.appendChild(cell);
  }
}

async function share() {
  const cpu = ui.mode === 'cpu';
  const g = current();
  const w = g.winner;
  const score = { a: R.onTop(g, w), b: R.onTop(g, 1 - w) };
  const text = cpu
    ? t(w === 0 ? 'share.youWon' : 'share.computerWon', { ...score, level: levelName(ui.cpu.level) })
    : t('share.playerWon', { ...score, p: w, n: g.moves });
  const url = 'https://www.tikitala.com/online/';
  try {
    if (navigator.share) { await navigator.share({ title: 'TIKITALA', text, url }); return; }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(text + ' ' + url);
    toast(t('share.copied'));
  } catch (e) {
    toast(t('share.link', { url }));
  }
}

function rematch() {
  window.clearTimeout(ui.timer);
  ui.hand = -1;
  ui.ending = false;
  ui.thinking = false;
  ui.landed = -1;
  if (ui.mode === 'cpu') ui.cpu = newCpuGame(ui.cpu.level);
  else ui.pass = newPassGame();
  save();
  show('game');
}

// ---------- language ----------

function renderLanguages() {
  const select = $('lang');
  select.replaceChildren(...LANGUAGES.map((l) => new Option(l.name, l.code, false, l.code === language())));
  $('lang-name').textContent = LANGUAGES.find((l) => l.code === language()).name;
}

async function changeLanguage(code) {
  await chooseLanguage(code);
  translatePage();
  renderLanguages();
  show(ui.screen);
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

async function init() {
  await setLanguage(chosenLanguage());
  translatePage();
  renderLanguages();
  board = new Board($('board'), tap);

  $('btn-computer').addEventListener('click', () => {
    if (ui.cpu && ui.cpu.game.winner !== null) ui.cpu = null;   // a finished game: choose a level again
    location.hash = (ui.cpu || loadCpu()) ? '#computer/play' : '#computer';
  });
  $('btn-computer-new').addEventListener('click', () => { location.hash = '#computer'; });
  document.querySelectorAll('.level').forEach((b) => b.addEventListener('click', () => startCpu(b.dataset.level)));
  $('btn-play').addEventListener('click', () => {
    if (ui.pass && ui.pass.winner !== null) ui.pass = null;     // a finished game: start a new one
    if (location.hash === '#play') route(); else location.hash = '#play';
  });
  $('btn-new').addEventListener('click', () => {
    ui.pass = newPassGame();
    save();
    if (location.hash === '#play') route(); else location.hash = '#play';
  });
  $('btn-stash').addEventListener('click', () => {
    const g = current();
    tap(ui.mode === 'pass' ? g.turn : 0);
  });
  $('btn-tray').addEventListener('click', putBack);
  $('btn-putback').addEventListener('click', putBack);
  $('btn-next').addEventListener('click', nextLesson);
  $('lesson-skip').addEventListener('click', () => store.set(LEARNED_KEY, true));
  $('btn-rematch').addEventListener('click', rematch);
  $('btn-share').addEventListener('click', share);
  $('lang').addEventListener('change', (e) => changeLanguage(e.target.value));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ui.screen === 'game') putBack(); });

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitBoard).observe($('table'));
  else window.addEventListener('resize', fitBoard);
  window.addEventListener('resize', fitText);
  if (document.fonts) document.fonts.addEventListener('loadingdone', fitText);   // the display font changes every width
  window.matchMedia('(max-height: 759px)').addEventListener('change', () => { if (ui.screen === 'game') renderGame(); });
  window.addEventListener('hashchange', route);

  ui.pass = loadPass();
  ui.cpu = loadCpu();
  route();
  fitBoard();
}

init();

// Layout check for the online game in every language: opens every screen and state at several screen
// sizes and reports words that do not fit (text wider than its box, anything sticking out of its parent,
// a one-line headline that had to wrap, tags clipped by the table). Use it whenever strings change,
// above all for a new language: Portuguese, Spanish and French run 15 to 30% longer than English.
//
// Needs Node 18 or later, Playwright (npm install playwright, then npx playwright install chromium)
// and a network connection for the Google fonts, since widths are only right in the real fonts.
// From the 5visible folder:
//   node tests/online/layout.check.mjs                     every language, every size
//   node tests/online/layout.check.mjs --lang pt-BR        one language
//   node tests/online/layout.check.mjs --shots shots       also save a screenshot of every state
// Set TIKITALA_ONLINE to the online folder if the two checkouts are not side by side.
// It is not a node --test file on purpose: it needs a browser and the network.

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join, extname, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const folder = [
  process.env.TIKITALA_ONLINE,
  resolve(here, '../../../tikitala.com/online'),
  resolve(here, '../../../online'),
].filter(Boolean).find((p) => existsSync(join(p, 'js', 'i18n.js')));
if (!folder) throw new Error('Cannot find the online folder. Set TIKITALA_ONLINE.');
const R = await import(pathToFileURL(join(folder, 'js', 'rules.js')).href);
const I = await import(pathToFileURL(join(folder, 'js', 'i18n.js')).href);

const arg = (name) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : null; };
const langs = arg('lang') ? arg('lang').split(',') : I.LANGUAGES.map((l) => l.code);
const sizes = (arg('sizes') || '390x844,320x568,375x667,430x932,844x390,768x1024,1440x900').split(',').map((s) => s.split('x').map(Number));
const shots = arg('shots');
if (shots) mkdirSync(shots, { recursive: true });

// ---------- games to show: played with the real rules ----------

function seeded(seed) { return () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648); }

function finished(winner, seed) {
  const rnd = seeded(seed);
  for (;;) {
    let g = R.newGame(rnd);
    while (g.winner === null && g.moves < 200) {
      const moves = R.legalMoves(g);
      if (!moves.length) break;
      const [f, t] = moves[Math.floor(rnd() * moves.length)];
      g = R.play(g, f, t);
    }
    if (g.winner === winner) return g;
  }
}

// player 0 to move; spot 4 holds their 0 under a 1, spot 2 is a lone chip, stashes are part used
function midGame() {
  let g = R.newGame(seeded(7));
  for (const [f, t] of [[0, 2], [1, 4], [0, 3], [1, 8]]) g = R.play(g, f, t);
  return g;
}

// the same, two moves on: spot 4 is a full stack of three
function fullGame() {
  let g = midGame();
  for (const [f, t] of [[0, 4], [1, 9]]) g = R.play(g, f, t);
  return g;
}

const memory = (g) => { const m = {}; g.stacks.forEach((s) => s.forEach((c) => { m[c.id] = true; })); return m; };
const vsComputer = (g, level = 'clever') => ({ game: g, level, mem: memory(g) });
const CPU = 'tikitala.online.computer.v1';
const PASS = 'tikitala.online.passplay.v1';
const spot = (i) => `#board .tk-spot >> nth=${i - 2}`;

const STATES = {
  'home': {},
  'home-continue': { store: { [CPU]: vsComputer(midGame()), [PASS]: midGame() } },
  'levels': { hash: '#computer', store: { 'tikitala.online.level.v1': 'ruthless' } },
  'lesson1': { hash: '#learn/1' },
  'lesson1-hold': { hash: '#learn/1', act: (p) => p.click('#btn-stash') },
  'lesson1-done': { hash: '#learn/1', act: async (p) => { await p.click('#btn-stash'); await p.click(spot(9)); } },
  'lesson2': { hash: '#learn/2' },
  'lesson2-hold': { hash: '#learn/2', act: (p) => p.click(spot(5)) },
  'lesson2-done': { hash: '#learn/2', act: async (p) => { await p.click(spot(5)); await p.click(spot(6)); } },
  'lesson3': { hash: '#learn/3' },
  'lesson3-done': { hash: '#learn/3', act: async (p) => { await p.click(spot(5)); await p.click(spot(9)); } },
  'lesson4': { hash: '#learn/4' },
  'lesson4-done': { hash: '#learn/4', act: async (p) => { await p.click('#btn-stash'); await p.click(spot(9)); } },
  'computer': { hash: '#computer/play', store: { [CPU]: vsComputer(midGame(), 'ruthless') } },
  'computer-stash': { hash: '#computer/play', store: { [CPU]: vsComputer(midGame()) }, act: (p) => p.click('#btn-stash') },
  'computer-lifted': { hash: '#computer/play', store: { [CPU]: vsComputer(midGame()) }, act: (p) => p.click(spot(4)) },
  'computer-lone': { hash: '#computer/play', store: { [CPU]: vsComputer(midGame()) }, act: (p) => p.click(spot(2)) },
  'computer-full': { hash: '#computer/play', store: { [CPU]: vsComputer(fullGame()) }, act: (p) => p.click('#btn-stash') },
  'pass': { hash: '#play', store: { [PASS]: { ...midGame(), turn: 1 } } },
  'over-win': { hash: '#computer/play', store: { [CPU]: vsComputer(finished(0, 3), 'ruthless') } },
  'over-lose': { hash: '#computer/play', store: { [CPU]: vsComputer(finished(1, 5), 'ruthless') } },
  'over-pass': { hash: '#play', store: { [PASS]: finished(1, 11) } }
};

// ---------- what counts as not fitting (runs in the page) ----------

function problems() {
  const out = [];
  const screen = [...document.querySelectorAll('.screen')].find((s) => !s.hidden);
  if (!screen) return ['no screen is showing'];
  const name = (el) => (el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase());
  const words = (el) => '"' + el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) + '"';
  if (screen.scrollWidth > screen.clientWidth + 1) out.push('the screen scrolls sideways');
  for (const el of screen.querySelectorAll('*')) {
    if (!el.offsetParent || el.closest('svg')) continue;
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (ownText && el.clientWidth && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow === 'visible') {
      out.push(`${name(el)} is wider than its box: ${words(el)}`);
    }
    if (el.dataset.fit !== undefined && el.style.whiteSpace === 'normal') out.push(`${name(el)} wraps even at ${el.dataset.fit}px: ${words(el)}`);
    if (el.closest('.board, .tk-stack, .home-chips, .reveal-stair, .tile')) continue;
    const pos = getComputedStyle(el).position;
    if (pos === 'absolute' || pos === 'fixed') continue;
    const r = el.getBoundingClientRect();
    const pr = el.parentElement.getBoundingClientRect();
    if (r.width && (r.right > pr.right + 1 || r.left < pr.left - 1)) out.push(`${name(el)} sticks out of its parent: ${words(el)}`);
  }
  const table = document.getElementById('table');
  if (table && table.offsetParent) {
    const tr = table.getBoundingClientRect();
    for (const tag of document.querySelectorAll('.tk-tag, .tk-bubble:not([hidden])')) {
      const r = tag.getBoundingClientRect();
      if (r.left < tr.left - 1 || r.right > tr.right + 1 || r.top < tr.top - 1) out.push(`a tag or bubble is cut off by the table: ${words(tag)}`);
    }
  }
  return out;
}

// ---------- a small static server for the gh-pages checkout ----------

const root = dirname(folder);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json' };
const server = createServer((req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  let file = join(root, path);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const site = `http://127.0.0.1:${server.address().port}/online/`;

// ---------- run ----------

const { chromium } = createRequire(import.meta.url)('playwright');
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined;
const browser = await chromium.launch({ proxy });
let count = 0;
for (const lang of langs) {
  for (const [w, h] of sizes) {
    const phone = Math.min(w, h) < 600;       // phones have overlay scrollbars, which take no width
    for (const [state, s] of Object.entries(STATES)) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: lang, isMobile: phone, hasTouch: phone });
      await ctx.route(/googletagmanager|google-analytics/, (r) => r.abort());      // never send test games to analytics
      await ctx.addInitScript((st) => {
        if (sessionStorage.getItem('seeded')) return;
        for (const [k, v] of Object.entries(st)) localStorage.setItem(k, JSON.stringify(v));
        sessionStorage.setItem('seeded', '1');
      }, s.store || {});
      const page = await ctx.newPage();
      const found = [];
      page.on('pageerror', (e) => found.push('JavaScript error: ' + e.message));
      await page.goto(site + (s.hash || ''));
      await page.waitForSelector('.screen:not([hidden])');
      await page.evaluate(() => new Promise((ok) => requestAnimationFrame(ok)).then(() => document.fonts.ready));   // fonts load once text shows
      const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
      if (!fonts.some((f) => /Bebas/.test(f))) throw new Error('The Google fonts did not load, and widths are meaningless without them. Check the network.');
      if (s.act) await s.act(page);
      if (state.startsWith('over')) await page.waitForSelector('#screen-over:not([hidden])');
      await page.waitForTimeout(250);
      found.push(...(await page.evaluate(problems)));
      for (const f of found) console.log(`${lang} ${w}x${h} ${state}: ${f}`);
      count += found.length;
      if (shots) await page.screenshot({ path: join(shots, `${lang}-${w}x${h}-${state}.png`) });
      await ctx.close();
    }
  }
}
await browser.close();
server.close();
console.log(count ? `${count} problem(s)` : `Everything fits: ${langs.join(', ')} at ${sizes.length} sizes, ${Object.keys(STATES).length} states each.`);
process.exit(count ? 1 : 0);

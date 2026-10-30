// Draws the TIKITALA Online app icons: a 0 chip, as specified in docs/online/chip.md, and writes them
// into the online folder of the gh-pages checkout (online/icons).
//
//   favicon.svg, favicon-32.png   the browser tab: no background, simplified for 16 to 32px
//   icon-192.png, icon-512.png    installed app icons ("any"): no background
//   maskable-192.png, -512.png    Android adaptive icons: on lime, the chip inside the 80% safe zone
//   apple-touch-icon.png          iPhone and iPad home screens (180px): on lime, since iOS fills
//                                 see-through icons with black
//
// Run with Node 18 or later and Playwright (which renders the PNGs with Chromium), from the 5visible folder:
//   node tools/online/make-icons.mjs
// Set TIKITALA_ONLINE to the online folder if the two checkouts are not side by side.

import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const folder = [
  process.env.TIKITALA_ONLINE,
  resolve(here, '../../../tikitala.com/online'),
  resolve(here, '../../../online'),
].filter(Boolean).find((p) => existsSync(join(p, 'index.html')));
if (!folder) throw new Error('Cannot find the online folder. Set TIKITALA_ONLINE.');
const out = join(folder, 'icons');
mkdirSync(out, { recursive: true });

// colors from docs/online/foundations.md
const LIME = '#E1E94B';
const BODY = '#1C1B19';
const EDGE = '#8E897F';
const GROOVE = '#55514A';
const CHALK = '#F3EEE2';
const INK = '#161513';
const PLAYER_0 = '#E2622C';
const RIM_TEXT = '#D9D3C5';
const ROTATION = -14;   // degrees, like the chip on the game-over screen; it also centers the rim text at the bottom

// the 0 numeral, from the tk-n0 symbol in index.html (a 40×50 box)
const NUMERAL = `<g fill="none" stroke="${INK}" stroke-width="5.4"><ellipse cx="20" cy="25" rx="11" ry="16.5"/><path d="M12.5 37.5 L27.5 12.5"/></g>`;

// One chip as SVG, in a 100×100 box, px wide. px sets the rim outline (at least 1.5px). The rim text is
// only drawn where the icon is shown large (chip.md: chips under 60px have none), so it is asked for.
function chip(px, { text = false, groove = true } = {}) {
  const u = 100 / 88;                                  // chip.md measures in 88ths of the chip
  const bw = Math.max(1.5 / px * 100, 2);              // rim outline: max(1.5px, 0.02 × S)
  const inner = 100 - 2 * bw;                          // the face inside the outline
  const k = inner / 100;
  const c = 50;
  const insertR = 29 * k;                              // 58% of the face
  const ring = 2.8 * u;
  const f = (v) => +v.toFixed(3);
  const parts = [
    `<circle cx="${c}" cy="${c}" r="50" fill="${EDGE}"/>`,
    `<circle cx="${c}" cy="${c}" r="${f(50 - bw)}" fill="${BODY}"/>`
  ];
  if (groove) parts.push(`<circle cx="${c}" cy="${c}" r="${f(50 - bw - 5.6 * u)}" fill="none" stroke="${GROOVE}" stroke-width="${f(1.2 * u)}"/>`);
  const spin = [];
  if (text) {
    // the rim text, as chip.js draws it: a circle of radius 38.5 in the face's own 100×100 box
    spin.push(`<g transform="translate(${f(bw)} ${f(bw)}) scale(${f(k)})"><path id="rim" d="M 11.5 50 a 38.5 38.5 0 1 0 77 0 a 38.5 38.5 0 1 0 -77 0" fill="none"/>` +
      `<text font-family="Roboto Mono" font-weight="500" font-size="7" letter-spacing="0.7" fill="${RIM_TEXT}"><textPath href="#rim" startOffset="9%">tikitala.com</textPath></text></g>`);
  }
  spin.push(`<circle cx="${c}" cy="${c}" r="${f(insertR + ring / 2)}" fill="${CHALK}" stroke="${PLAYER_0}" stroke-width="${f(ring)}"/>`);
  spin.push(`<circle cx="${c}" cy="${c}" r="${f(insertR)}" fill="${CHALK}"/>`);
  spin.push(`<svg x="36" y="32.5" width="28" height="35" viewBox="0 0 40 50">${NUMERAL}</svg>`);
  parts.push(`<g transform="rotate(${ROTATION} ${c} ${c})">${spin.join('')}</g>`);
  return parts.join('');
}

// An icon: the chip at `scale` of the canvas, on lime or on nothing, with the stack shadow from chip.js on lime
function icon(size, { lime = false, scale = 0.94, ...opts } = {}) {
  const d = 100 * scale;
  const o = (100 - d) / 2;
  const shadow = lime
    ? `<defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${+(3 / 88 * d).toFixed(2)}" stdDeviation="${+(3 / 88 * d).toFixed(2)}" flood-color="#000" flood-opacity="0.3"/></filter></defs>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">` + shadow +
    (lime ? `<rect width="100" height="100" fill="${LIME}"/>` : '') +
    `<g transform="translate(${+o.toFixed(3)} ${+o.toFixed(3)}) scale(${scale})"${lime ? ' filter="url(#shadow)"' : ''}>${chip(size * scale, opts)}</g></svg>`;
}

// the browser tab: drawn for 32px, no groove and no text, which would only blur at that size
const favicon = icon(32, { scale: 1, groove: false, text: false });
writeFileSync(join(out, 'favicon.svg'), favicon.replace(' width="32" height="32"', '') + '\n');

const PNGS = [
  ['favicon-32.png', 32, { scale: 1, groove: false, text: false }],
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, { text: true }],
  // maskable: the safe zone is a circle 80% of the icon wide; the chip and its shadow stay inside it
  ['maskable-192.png', 192, { lime: true, scale: 0.74 }],
  ['maskable-512.png', 512, { lime: true, scale: 0.74, text: true }],
  ['apple-touch-icon.png', 180, { lime: true, scale: 0.78 }]
];

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {});
const page = await browser.newPage();
for (const [name, size, opts] of PNGS) {
  const svg = icon(size, opts);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent('<!doctype html><link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500&display=block" rel="stylesheet">' +
    '<style>html,body{margin:0;background:transparent}svg{display:block}</style>' + svg);
  await page.evaluate(() => document.fonts.load('500 7px "Roboto Mono"', 'tikitala.com').then(() => document.fonts.ready));
  if (svg.includes('Roboto Mono') && !(await page.evaluate(() => document.fonts.check('500 7px "Roboto Mono"', 'tikitala.com')))) {
    throw new Error('Roboto Mono did not load, so the rim text would be in the wrong font. Check the network.');
  }
  await page.screenshot({ path: join(out, name), omitBackground: !opts.lime, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote', join(out, name));
}
await browser.close();
console.log('wrote', join(out, 'favicon.svg'));

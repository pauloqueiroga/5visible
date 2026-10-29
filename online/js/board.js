// The table: nine spots in a staggered three-column layout, the trail of the last move, tags and
// lesson bubbles. Everything is laid out in board units (chip size 84) and the whole board is scaled
// to fit the screen (see docs/online/chip.md#board-geometry in 5visible).

import { chipStack } from './chip.js';

export const BOARD_W = 330;
export const BOARD_H = 416;
export const CHIP = 84;
const STEP = 11;      // round(0.13 × 84): how much of each lower chip shows
const SPOT_H = 106;   // 84 + 2 × 11: every spot reserves room for a stack of three
const COLS = [55, 165, 275];
// column and half-row of spots 2 to 10, in the order of the stack indices in rules.js
const POS = [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2], [1, 3], [0, 4], [2, 4], [1, 5]];

export const MIN_CHIP = 46;
export const MAX_CHIP = 126;

export function boardScale(width, height) {
  const k = Math.min((width - 16) / BOARD_W, (height - 16) / BOARD_H);
  return Math.max(MIN_CHIP / CHIP, Math.min(MAX_CHIP / CHIP, k));
}

function box(i) {
  const [c, r] = POS[i - 2];
  return { left: COLS[c] - CHIP / 2, top: r * 62, cx: COLS[c] };
}

function center(i, count) {
  const b = box(i);
  return { x: b.cx, y: b.top + SPOT_H - Math.max(0, count - 1) * STEP - CHIP / 2 };
}

const NS = 'http://www.w3.org/2000/svg';

export class Board {
  constructor(el, onTap) {
    this.el = el;
    this.spots = {};
    for (let i = 2; i <= 10; i++) {
      const b = box(i);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tk-spot';
      btn.style.left = b.left + 'px';
      btn.style.top = b.top + 'px';
      btn.addEventListener('click', () => onTap(i));
      el.appendChild(btn);
      this.spots[i] = btn;
    }
    this.trail = document.createElementNS(NS, 'svg');
    this.trail.setAttribute('class', 'tk-trail');
    this.trail.setAttribute('viewBox', '0 0 ' + BOARD_W + ' ' + BOARD_H);
    this.trail.setAttribute('aria-hidden', 'true');
    this.trail.innerHTML = '<path class="tk-trail-under"></path><path class="tk-trail-line"></path><path class="tk-trail-head"></path>';
    el.appendChild(this.trail);
    this.bubble = document.createElement('div');
    this.bubble.className = 'tk-bubble';
    this.bubble.hidden = true;
    el.appendChild(this.bubble);
  }

  // view.spots[i] = { player, count, state, rot, landed, label, tag, tagKind, enabled }
  // view.trail = { from, to } or null; view.bubble = { spot, text } or null
  update(view) {
    for (let i = 2; i <= 10; i++) {
      const s = view.spots[i];
      const btn = this.spots[i];
      btn.replaceChildren(chipStack({ player: s.player, count: s.count, size: CHIP, state: s.state, rot: s.rot, colors: view.colors, landed: s.landed }));
      if (s.tag) {
        const t = document.createElement('span');
        t.className = 'tk-tag' + (s.tagKind ? ' is-' + s.tagKind : '');
        t.textContent = s.tag;
        btn.appendChild(t);
      }
      btn.setAttribute('aria-label', s.label);
      btn.setAttribute('aria-disabled', s.enabled ? 'false' : 'true');
      btn.classList.toggle('is-enabled', !!s.enabled);
    }
    this.drawTrail(view.trail, view.spots);
    this.drawBubble(view.bubble, view.spots);
  }

  drawTrail(trail, spots) {
    if (!trail) { this.trail.style.display = 'none'; return; }
    const e = center(trail.to, spots[trail.to].count);
    const s0 = trail.from >= 2 ? center(trail.from, spots[trail.from].count) : { x: e.x, y: -34 };
    let dx = e.x - s0.x, dy = e.y - s0.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const st = trail.from >= 2 ? { x: s0.x + dx * 30, y: s0.y + dy * 30 } : s0;
    const tip = { x: e.x - dx * 40, y: e.y - dy * 40 };
    const b = { x: tip.x - dx * 16, y: tip.y - dy * 16 };
    const f = (v) => v.toFixed(1);
    const line = 'M' + f(st.x) + ' ' + f(st.y) + ' L' + f(b.x) + ' ' + f(b.y);
    const head = 'M' + f(tip.x) + ' ' + f(tip.y) + ' L' + f(b.x - dy * 9) + ' ' + f(b.y + dx * 9) + ' L' + f(b.x + dy * 9) + ' ' + f(b.y - dx * 9) + ' Z';
    const [under, l, h] = this.trail.children;
    under.setAttribute('d', line);
    l.setAttribute('d', line);
    h.setAttribute('d', head);
    this.trail.style.display = '';
  }

  drawBubble(bubble, spots) {
    if (!bubble) { this.bubble.hidden = true; return; }
    const b = box(bubble.spot);
    const count = spots[bubble.spot].count;
    const faceTop = b.top + SPOT_H - Math.max(0, count - 1) * STEP - CHIP;
    this.bubble.textContent = bubble.text;
    this.bubble.hidden = false;
    const below = faceTop < 70;
    this.bubble.classList.toggle('is-below', below);
    const inv = Number(getComputedStyle(this.el).getPropertyValue('--inv')) || 1;
    const w = Math.min(BOARD_W, 132 * inv);
    const left = Math.max(0, Math.min(BOARD_W - w, b.cx - w / 2));
    this.bubble.style.left = left + 'px';
    this.bubble.style.width = w + 'px';
    this.bubble.style.setProperty('--tip', (b.cx - left) + 'px');
    if (below) { this.bubble.style.top = (b.top + SPOT_H + 14) + 'px'; this.bubble.style.bottom = ''; }
    else { this.bubble.style.top = ''; this.bubble.style.bottom = (BOARD_H - faceTop + 14) + 'px'; }
  }
}

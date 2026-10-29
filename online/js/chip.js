// Draws chips and stacks: on the board, in the stash, in the hand tray and in the end-of-game reveal.
// One function makes every stack, so they always look the same (see docs/online/chip.md in 5visible).

const INK = '#161513';
const BODY = '#1C1B19';
const EDGE = '#8E897F';
const GROOVE = '#55514A';
const CHALK = '#F3EEE2';
const LIME = '#E1E94B';
const PLAYER_RING = { 0: '#E2622C', 1: '#2F6FDB' };

let uid = 0;

function face(pl, bottom, S, rot, colors, extraStyle, shadow) {
  const u = S / 88;
  const p = (v) => (v * u).toFixed(1) + 'px';
  const bw = Math.max(1.5, S * 0.02).toFixed(1) + 'px';
  const arcId = 'tk-arc-' + (uid++);
  const numW = (S * 0.28).toFixed(1);
  const numH = (S * 0.35).toFixed(1);
  const ring = colors ? ';box-shadow:0 0 0 ' + p(2.8) + ' ' + PLAYER_RING[pl] : '';
  const arc = S >= 60
    ? '<svg class="tk-arc" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="' + arcId + '" d="M 11.5 50 a 38.5 38.5 0 1 0 77 0 a 38.5 38.5 0 1 0 -77 0"></path></defs>' +
      '<text><textPath href="#' + arcId + '" startOffset="9%">tikitala.com</textPath></text></svg>'
    : '';
  return '<div class="tk-face" style="bottom:' + bottom + 'px;width:' + S + 'px;height:' + S + 'px;border-width:' + bw +
    ';box-shadow:inset 0 0 0 ' + p(5) + ' ' + BODY + ',inset 0 0 0 ' + p(6.2) + ' ' + GROOVE + (shadow ? ',' + shadow : '') + (extraStyle || '') + '">' +
    '<div class="tk-spin" style="transform:rotate(' + rot + 'deg)">' + arc +
    '<div class="tk-insert" style="' + ring.slice(1) + '">' +
    '<svg viewBox="0 0 40 50" aria-hidden="true" style="width:' + numW + 'px;height:' + numH + 'px"><use href="#tk-n' + pl + '"></use></svg>' +
    '</div></div></div>';
}

function rim(bottom, S, shadow) {
  const bw = Math.max(1.5, S * 0.02).toFixed(1) + 'px';
  return '<div class="tk-rim" style="bottom:' + bottom + 'px;width:' + S + 'px;height:' + S + 'px;border-width:' + bw + ';box-shadow:' + shadow + '"></div>';
}

// state: idle | dim | target | origin | lifted | locked
// count: chips in the stack (0 for an empty spot); for "lifted" only one chip is drawn
// landed: the top chip has just been dropped here (plays the settle animation)
export function chipStack({ player = '0', count = 1, size = 84, state = 'idle', rot = 0, colors = true, landed = false } = {}) {
  const S = size;
  const lifted = state === 'lifted';
  const n = lifted ? 1 : Math.max(0, Math.min(8, count | 0));
  const r = Math.max(-30, Math.min(30, Number(rot) || 0));
  const e = Math.round(S * 0.13);
  const H = S + Math.max(2, n - 1) * e;
  const u = S / 88;
  const p = (v) => (v * u).toFixed(1) + 'px';
  const pl = player === '1' || player === 1 ? '1' : '0';

  const root = document.createElement('div');
  root.className = 'tk-stack' + (state === 'dim' ? ' is-dim' : '');
  root.style.width = S + 'px';
  root.style.height = H + 'px';

  let html = '';
  let faceBottom = 0;

  if (n === 0) {
    const cls = state === 'target' ? 'tk-empty is-target tk-pulse' : state === 'origin' ? 'tk-empty is-origin' : 'tk-empty';
    const icon = state === 'target' ? 'tk-i-plus' : state === 'origin' ? 'tk-i-up' : '';
    html += '<div class="' + cls + '" style="width:' + S + 'px;height:' + S + 'px;border-width:' + p(state === 'idle' || state === 'dim' ? 2 : 2.6) + '">' +
      (icon ? '<svg class="tk-icon" viewBox="0 0 24 24" aria-hidden="true" style="width:' + Math.round(S * 0.32) + 'px;height:' + Math.round(S * 0.32) + 'px"><use href="#' + icon + '"></use></svg>' : '') +
      '</div>';
  } else if (lifted) {
    // the chip in your hand: one chip, floating above its own shadow
    html += '<div class="tk-shadow" style="left:' + Math.round(S * 0.12) + 'px;width:' + Math.round(S * 0.76) + 'px;height:' + Math.round(S * 0.76) + 'px;filter:blur(' + p(5) + ')"></div>';
    faceBottom = 2 * e + Math.round(S * 0.1);
    html += face(pl, faceBottom, S, r, colors, ';transform:scale(1.06)', '0 ' + p(14) + ' ' + p(18) + ' rgba(0,0,0,0.26)');
  } else {
    const base = '0 ' + p(3) + ' ' + p(6) + ' rgba(0,0,0,0.30)';
    for (let k = 0; k < n; k++) {
      const sh = k === 0 ? base : '0 1px 0 rgba(0,0,0,0.5)';
      if (k < n - 1) html += rim(k * e, S, sh);
      else html += face(pl, k * e, S, r, colors, landed ? ';animation:tk-land 220ms ease-out' : '', sh);
    }
    faceBottom = (n - 1) * e;
  }

  // the ring circles the whole stack, so it never hides how many chips are in it
  if (n > 0 && (state === 'target' || state === 'origin')) {
    const gap = Math.max(4, Math.round(7 * u));
    const D = S + (n - 1) * e + 2 * gap;
    const cls = state === 'target' ? 'tk-ring is-target tk-pulse' : 'tk-ring is-origin';
    const bw = state === 'target' ? p(3.5) : p(2.5);
    const inner = state === 'target' ? ';box-shadow:0 0 0 ' + p(2) + ' ' + INK + ',inset 0 0 0 ' + p(2) + ' ' + INK : '';
    html += '<div class="' + cls + '" style="left:' + Math.round((S - D) / 2) + 'px;bottom:-' + gap + 'px;width:' + D + 'px;height:' + D + 'px;border-width:' + bw + inner + '"></div>';
  }

  // badges
  const L = Math.max(18, Math.round(S * 0.3));
  const badge = (side, icon) => '<div class="tk-badge" style="' + side + ';width:' + L + 'px;height:' + L + 'px"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:' + Math.round(L * 0.56) + 'px;height:' + Math.round(L * 0.56) + 'px"><use href="#' + icon + '"></use></svg></div>';
  if (n > 0 && state === 'locked') html += badge('right:-' + Math.round(L * 0.15) + 'px;bottom:' + Math.round(faceBottom + S - L * 0.85) + 'px', 'tk-i-lock');
  if (lifted) html += badge('left:-' + Math.round(L * 0.25) + 'px;bottom:' + Math.round(faceBottom + S - L * 0.7) + 'px', 'tk-i-hand');

  root.innerHTML = html;
  return root;
}

export const COLORS = { INK, BODY, EDGE, GROOVE, CHALK, LIME };

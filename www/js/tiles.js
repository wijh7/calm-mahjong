// Tile faces drawn as vectors (no runtime font => no "[][][]" boxes in any language, and the whole tile set costs ~20 KB).
// Shapes are redundant with colour (dots=circles, bamboo=stalks, characters=ink glyph+red 萬) so colour-blind players are fine.
import { GLYPHS } from './glyphs.js';

const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
const NUM = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
const glyphCache = {};
function glyph(c, ch, cx, cy, size, color, maxW) {
  const g = GLYPHS[ch]; if (!g) return;
  const p = glyphCache[ch] || (glyphCache[ch] = new Path2D(g.d));
  const s = Math.min(size / g.h, (maxW || size) / g.w);
  c.save(); c.translate(cx - g.w * s / 2, cy - g.h * s / 2); c.scale(s, s); c.fillStyle = color; c.fill(p); c.restore();
}
// dot/bamboo grids: arrays of [col,row] in a cols x rows lattice
const GRID = {
  1: { c: 1, r: 1, p: [[0, 0]] }, 2: { c: 1, r: 2, p: [[0, 0], [0, 1]] }, 3: { c: 3, r: 3, p: [[0, 0], [1, 1], [2, 2]] },
  4: { c: 2, r: 2, p: [[0, 0], [1, 0], [0, 1], [1, 1]] }, 5: { c: 3, r: 3, p: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]] },
  6: { c: 2, r: 3, p: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]] },
  7: { c: 3, r: 4, p: [[0, 0], [1, 0.5], [2, 1], [0, 2.4], [2, 2.4], [0, 3.4], [2, 3.4]] },
  8: { c: 2, r: 4, p: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3]] },
  9: { c: 3, r: 3, p: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]] },
};

function dot(c, x, y, r, col, pal) {
  c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle = pal.face0; c.lineWidth = r * 0.22; c.beginPath(); c.arc(x, y, r * 0.62, 0, 7); c.stroke();
  c.fillStyle = pal.face0; c.beginPath(); c.arc(x, y, r * 0.26, 0, 7); c.fill();
}
function stalk(c, x, y, w, h, col, pal) {
  rr(c, x - w / 2, y - h / 2, w, h, w * 0.42); c.fillStyle = col; c.fill();
  c.strokeStyle = pal.face0; c.lineWidth = Math.max(1, w * 0.13); c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.28)'; rr(c, x - w * 0.28, y - h * 0.42, w * 0.2, h * 0.84, w * 0.1); c.fill();
}

export function drawFace(c, id, x, y, w, h, pal) {
  const k = id[0], n = +id[1];
  const px = w * 0.13, py = h * 0.12, aw = w - 2 * px, ah = h - 2 * py, cx = x + w / 2, cy = y + h / 2;
  if (k === 'd' || k === 'b') {
    const D = { 1: [[.5, .5]], 2: [[.5, .27], [.5, .73]], 3: [[.3, .2], [.5, .5], [.7, .8]], 4: [[.3, .27], [.7, .27], [.3, .73], [.7, .73]], 5: [[.28, .25], [.72, .25], [.5, .5], [.28, .75], [.72, .75]],
      6: [[.3, .2], [.7, .2], [.3, .5], [.7, .5], [.3, .8], [.7, .8]], 7: [[.22, .13], [.5, .25], [.78, .37], [.3, .62], [.7, .62], [.3, .86], [.7, .86]],
      8: [[.3, .13], [.7, .13], [.3, .38], [.7, .38], [.3, .62], [.7, .62], [.3, .87], [.7, .87]], 9: [[.2, .17], [.5, .17], [.8, .17], [.2, .5], [.5, .5], [.8, .5], [.2, .83], [.5, .83], [.8, .83]] };
    const R = [0, .36, .24, .2, .2, .19, .17, .13, .15, .14];
    const BW = [0, 0, .26, .26, .26, .24, .22, .2, .2, .17], BH = [0, 0, .4, .4, .4, .34, .3, .22, .22, .3];
    if (k === 'd') {
      const cols = [pal.green, pal.red, pal.blue];
      D[n].forEach(([u, v], i) => {
        const col = n === 1 ? pal.red : n === 5 && i === 2 ? pal.red : n === 9 ? cols[Math.floor(i / 3)] : n === 7 && i < 3 ? pal.red : n % 2 ? pal.green : (i % 2 ? pal.blue : pal.green);
        dot(c, x + px + u * aw, y + py + v * ah, R[n] * aw, col, pal);
      });
      if (n === 1) { c.strokeStyle = pal.blue; c.lineWidth = w * 0.03; c.beginPath(); c.arc(cx, cy, aw * 0.45, 0, 7); c.stroke(); }
    } else if (n === 1) {
      stalk(c, cx, cy + ah * 0.08, aw * 0.28, ah * 0.78, pal.green, pal);
      c.fillStyle = pal.red; c.beginPath(); c.ellipse(cx + aw * 0.24, cy - ah * 0.22, aw * 0.2, aw * 0.08, -0.6, 0, 7); c.fill();
      c.fillStyle = pal.green; c.beginPath(); c.ellipse(cx - aw * 0.24, cy - ah * 0.12, aw * 0.2, aw * 0.08, 0.6, 0, 7); c.fill();
    } else {
      D[n].forEach(([u, v], i) => {
        const red = (n === 5 && i === 2) || (n === 7 && i === 0) || (n === 3 && i === 0) || (n === 9 && i % 3 === 1);
        stalk(c, x + px + u * aw, y + py + v * ah, BW[n] * aw, BH[n] * ah, red ? pal.red : (n === 8 || n === 6 ? (i % 2 ? pal.green : pal.blue) : pal.green), pal);
      });
    }
  } else if (k === 'c') {
    glyph(c, NUM[n], cx, y + h * 0.35, h * 0.34, pal.ink, aw * 0.8);
    glyph(c, '萬', cx, y + h * 0.69, h * 0.3, pal.red, aw * 0.78);
  } else if (k === 'w') {
    glyph(c, { E: '東', S: '南', W: '西', N: '北' }[id[1]], cx, cy, Math.min(ah, aw) * 0.82, pal.ink, aw * 0.9);
    c.fillStyle = pal.blue; c.beginPath(); c.arc(x + w * 0.2, y + h * 0.17, w * 0.045, 0, 7); c.fill();
  } else if (k === 'p') {
    if (id[1] === 'W') { c.strokeStyle = pal.blue; c.lineWidth = w * 0.045; rr(c, x + px, y + py, aw, ah, w * 0.12); c.stroke(); c.lineWidth = w * 0.02; rr(c, x + px + w * 0.07, y + py + w * 0.07, aw - w * 0.14, ah - w * 0.14, w * 0.07); c.stroke(); }
    else glyph(c, id[1] === 'R' ? '中' : '發', cx, cy, Math.min(ah, aw) * 0.88, id[1] === 'R' ? pal.red : pal.green, aw * 0.92);
  } else if (k === 'f' || k === 's') {
    const ch = k === 'f' ? '梅蘭菊竹'[n - 1] : '春夏秋冬'[n - 1], col = k === 'f' ? pal.plum : pal.gold2;
    glyph(c, ch, cx, cy + h * 0.04, Math.min(ah, aw) * 0.74, col, aw * 0.86);
    // corner pip: 1-4 dots so the four are told apart without reading kanji
    for (let i = 0; i < n; i++) { c.fillStyle = col; c.beginPath(); c.arc(x + px + w * 0.045 + i * w * 0.1, y + py * 0.9, w * 0.034, 0, 7); c.fill(); }
  }
}

// Render one finished tile (body + face) to an offscreen canvas. dim=true is the "blocked" look.
export function renderTile(id, w, h, pal, { dim = false, selected = false, hint = false, contrast = false } = {}) {
  const cv = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
  const c = cv.getContext('2d'), d = Math.round(w * 0.1), rad = w * 0.15;
  // side (thickness)
  rr(c, 0, d * 0.55, w - d * 0.1, h - d * 0.55, rad); c.fillStyle = pal.side; c.fill();
  rr(c, 0, d * 0.3, w - d * 0.4, h - d, rad); c.fillStyle = pal.side2; c.fill();
  // face
  const fw = w - d, fh = h - d;
  const gr = c.createLinearGradient(0, 0, 0, fh); gr.addColorStop(0, pal.face0); gr.addColorStop(1, pal.face1);
  rr(c, 0, 0, fw, fh, rad); c.fillStyle = gr; c.fill();
  c.lineWidth = Math.max(1, w * 0.018); c.strokeStyle = contrast ? '#000' : pal.edge; rr(c, c.lineWidth / 2, c.lineWidth / 2, fw - c.lineWidth, fh - c.lineWidth, rad); c.stroke();
  c.save(); rr(c, 0, 0, fw, fh, rad); c.clip();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(0, 0, fw, fh * 0.06);
  if (pal.pattern) pal.pattern(c, fw, fh);
  c.restore();
  drawFace(c, id, 0, 0, fw, fh, contrast ? { ...pal, ink: '#000', red: '#b3140c', green: '#0b5f2e', blue: '#0a2f86' } : pal);
  if (dim) { c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = pal.dimColor; c.fillRect(0, 0, w, h); c.restore(); }
  if (selected || hint) { c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = hint ? 'rgba(255,196,92,.38)' : 'rgba(120,200,255,.30)'; c.fillRect(0, 0, fw, fh); c.restore(); }
  return cv;
}

export const FACE_IDS = [...'123456789'].flatMap(n => ['d' + n, 'b' + n, 'c' + n]).concat(['wE', 'wS', 'wW', 'wN', 'pR', 'pG', 'pW', 'fl1', 'fl2', 'fl3', 'fl4', 'se1', 'se2', 'se3', 'se4']);

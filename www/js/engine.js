// Calm Mahjong engine. Pure logic, no DOM. Runs identically in the browser, in Node tests and in the WebView.
//
// GUARANTEE (the core promise): every level is built by REVERSE CONSTRUCTION - we first find an order
// that removes all tiles two-at-a-time following the real "free tile" rule, and only then deal faces onto
// that order. So a solution exists by construction; tools/solver-test.mjs additionally replays it through
// the real rules and runs an independent solver.
import { mulberry32, shuffleInPlace, hashStr } from './rng.js';
import { layoutFor } from './layouts.js';

export const PLAIN = [
  ...[1,2,3,4,5,6,7,8,9].map(n => 'd' + n), ...[1,2,3,4,5,6,7,8,9].map(n => 'b' + n), ...[1,2,3,4,5,6,7,8,9].map(n => 'c' + n),
  'wE', 'wS', 'wW', 'wN', 'pR', 'pG', 'pW'];
export const FLOWERS = ['fl1', 'fl2', 'fl3', 'fl4'], SEASONS = ['se1', 'se2', 'se3', 'se4'];
export const keyOf = f => f.startsWith('fl') ? 'FL' : f.startsWith('se') ? 'SE' : f;
// Most visually distinct faces first - used for the very first levels so a beginner feels smart.
export const FRIENDLY = ['pR', 'pG', 'pW', 'wE', 'wS', 'wW', 'wN', 'd1', 'd3', 'd5', 'd8', 'b1', 'b3', 'b5', 'c1', 'c2', 'c3', 'c5', 'FL', 'SE'];

export class Board {
  constructor(layout) {
    this.n = layout.length;
    this.x = layout.map(t => t.x); this.y = layout.map(t => t.y); this.z = layout.map(t => t.z);
    this.face = new Array(this.n).fill(''); this.key = new Array(this.n).fill('');
    this.alive = new Uint8Array(this.n).fill(1);
    this.history = []; this.safeMark = 0;
    this.above = []; this.left = []; this.right = []; this.w = new Float32Array(this.n);
    for (let i = 0; i < this.n; i++) { this.above.push([]); this.left.push([]); this.right.push([]); }
    for (let i = 0; i < this.n; i++) for (let j = 0; j < this.n; j++) {
      if (i === j) continue;
      const dx = this.x[j] - this.x[i], dy = this.y[j] - this.y[i];
      if (Math.abs(dy) >= 2) continue;
      if (this.z[j] > this.z[i] && Math.abs(dx) < 2) { this.above[i].push(j); this.w[j] += 0; }
      else if (this.z[j] === this.z[i] && dx === -2) this.left[i].push(j);
      else if (this.z[j] === this.z[i] && dx === 2) this.right[i].push(j);
    }
    // weight: how many tiles are waiting on i (removing high-weight tiles first opens the board)
    for (let i = 0; i < this.n; i++) for (const j of [...this.above[i], ...this.left[i], ...this.right[i]]) this.w[j] += 1;
  }
  get remaining() { let c = 0; for (let i = 0; i < this.n; i++) c += this.alive[i]; return c; }
  freeIn(al) {
    const out = [];
    for (let i = 0; i < this.n; i++) {
      if (!al[i]) continue;
      let ok = true;
      for (const j of this.above[i]) if (al[j]) { ok = false; break; }
      if (!ok) continue;
      let l = true, r = true;
      for (const j of this.left[i]) if (al[j]) { l = false; break; }
      if (!l) for (const j of this.right[i]) if (al[j]) { r = false; break; }
      if (l || r) out.push(i);
    }
    return out;
  }
  isFree(i) { return this.freeIn(this.alive).includes(i); }
  freeSet() { return new Set(this.freeIn(this.alive)); }
  canMatch(i, j) { return i !== j && this.alive[i] && this.alive[j] && this.key[i] === this.key[j]; }
  moves() {
    const F = this.freeIn(this.alive), by = {}, out = [];
    for (const i of F) (by[this.key[i]] ||= []).push(i);
    for (const k in by) { const a = by[k]; for (let p = 0; p < a.length; p++) for (let q = p + 1; q < a.length; q++) out.push([a[p], a[q]]); }
    return out;
  }
  // user-facing removal. Returns false if the move is illegal.
  remove(i, j) {
    const F = this.freeSet();
    if (!this.canMatch(i, j) || !F.has(i) || !F.has(j)) return false;
    this.alive[i] = 0; this.alive[j] = 0; this.history.push([i, j]); return true;
  }
  undo() { const h = this.history.pop(); if (!h) return null; this.alive[h[0]] = 1; this.alive[h[1]] = 1; if (this.safeMark > this.history.length) this.safeMark = this.history.length; return h; }
  snapshot() { return { t: Array.from({ length: this.n }, (_, i) => [this.x[i], this.y[i], this.z[i], this.face[i]]), a: Array.from(this.alive), h: this.history, s: this.safeMark }; }
  static restore(s) {
    const b = new Board(s.t.map(t => ({ x: t[0], y: t[1], z: t[2] })));
    s.t.forEach((t, i) => { b.face[i] = t[3]; b.key[i] = keyOf(t[3]); });
    b.alive = Uint8Array.from(s.a); b.history = s.h.map(p => p.slice()); b.safeMark = s.s || 0; return b;
  }
}

// ---- order search: can this set of POSITIONS be cleared in free pairs? (faces ignored) ----
const packKey = al => { let s = '', v = 0; for (let i = 0; i < al.length; i++) { v = (v << 1) | al[i]; if ((i & 15) === 15) { s += String.fromCharCode(v); v = 0; } } return s + String.fromCharCode(v); };

// returns {order:[[i,j],...]} | 'none' (proved impossible) | 'unknown' (budget ran out)
export function findOrder(board, aliveMask, rng, budget = 20000, noise = 1.5, near = 0) {
  const al = Uint8Array.from(aliveMask); let count = 0; for (const v of al) count += v;
  if (count % 2) return 'none';
  const order = [], dead = new Set(); let nodes = 0, exhausted = false;
  function rec() {
    if (count === 0) return true;
    if (++nodes > budget) { exhausted = true; return false; }
    const k = packKey(al); if (dead.has(k)) return false;
    const F = board.freeIn(al);
    if (F.length >= 2) {
      const cands = [];
      for (let a = 0; a < F.length; a++) for (let b = a + 1; b < F.length; b++) cands.push([F[a], F[b], board.w[F[a]] + board.w[F[b]] + rng() * noise - near * (Math.abs(board.x[F[a]] - board.x[F[b]]) + Math.abs(board.y[F[a]] - board.y[F[b]])) / 2]);
      cands.sort((p, q) => q[2] - p[2]);
      const lim = Math.min(cands.length, 8);
      for (let c = 0; c < lim; c++) {
        const [a, b] = cands[c]; al[a] = 0; al[b] = 0; count -= 2; order.push([a, b]);
        if (rec()) return true;
        order.pop(); al[a] = 1; al[b] = 1; count += 2;
        if (exhausted) return false;
      }
    }
    if (!exhausted) dead.add(k);
    return false;
  }
  if (rec()) return { order };
  return exhausted ? 'unknown' : 'none';
}

// ---- solver on REAL faces (independent of how the level was generated) ----
export function solveFaces(board, budget = 60000) {
  const al = Uint8Array.from(board.alive); let count = 0; for (const v of al) count += v;
  const order = [], dead = new Set(); let nodes = 0, exhausted = false;
  function rec() {
    if (count === 0) return true;
    if (++nodes > budget) { exhausted = true; return false; }
    const k = packKey(al); if (dead.has(k)) return false;
    const F = board.freeIn(al), by = {};
    for (const i of F) (by[board.key[i]] ||= []).push(i);
    const cands = [];
    for (const kk in by) { const a = by[kk]; for (let p = 0; p < a.length; p++) for (let q = p + 1; q < a.length; q++) cands.push([a[p], a[q], board.w[a[p]] + board.w[a[q]] + (a.length === 2 ? 3 : 0)]); }
    cands.sort((p, q) => q[2] - p[2]);
    for (const [a, b] of cands.slice(0, 10)) {
      al[a] = 0; al[b] = 0; count -= 2; order.push([a, b]);
      if (rec()) return true;
      order.pop(); al[a] = 1; al[b] = 1; count += 2;
      if (exhausted) return false;
    }
    if (!exhausted) dead.add(k);
    return false;
  }
  if (rec()) return { order };
  return exhausted ? 'unknown' : 'none';
}

// ---- dealing faces onto a removal order ----
function makePool(pairs, types, mix, rng, dup = 1) {
  // dup = share of face-types that appear 4x (2 pairs). 0 => every face appears exactly twice (no ambiguity at all: ideal for level 1-8).
  const base = shuffleInPlace(types.slice(), rng);
  const k4 = Math.min(Math.floor(pairs / 2), Math.round(dup * pairs / 2)), single = pairs - 2 * k4;
  const need = k4 + single, chosen = [];
  for (let i = 0; chosen.length < need; i++) chosen.push(base[i % base.length]);
  let pool = []; chosen.forEach((t, i) => { pool.push(t); if (i < k4) pool.push(t); });
  pool = pool.slice(0, pairs);
  const swaps = Math.floor(mix * pairs);
  for (let s = 0; s < swaps; s++) { const a = Math.floor(rng() * pairs), b = Math.floor(rng() * pairs); [pool[a], pool[b]] = [pool[b], pool[a]]; }
  return pool;
}
function deal(board, order, pool, rng, existingFaces) {
  const fl = shuffleInPlace(existingFaces?.FL ? existingFaces.FL.slice() : FLOWERS.slice(), rng), se = shuffleInPlace(existingFaces?.SE ? existingFaces.SE.slice() : SEASONS.slice(), rng);
  order.forEach(([a, b], p) => {
    const t = pool[p];
    if (t === 'FL') { board.face[a] = fl.pop() || 'fl1'; board.face[b] = fl.pop() || 'fl2'; board.key[a] = board.key[b] = 'FL'; }
    else if (t === 'SE') { board.face[a] = se.pop() || 'se1'; board.face[b] = se.pop() || 'se2'; board.key[a] = board.key[b] = 'SE'; }
    else { board.face[a] = board.face[b] = t; board.key[a] = board.key[b] = t; }
  });
}

export function levelParams(L) {
  const n = L <= 20 ? 24 + 1.2 * L : L <= 50 ? 48 + (L - 20) * 0.9 : Math.min(112, 75 + (L - 50) * 0.35);
  const mix = L <= 20 ? 0.04 : L <= 50 ? 0.12 + (L - 20) * 0.006 : Math.min(0.75, 0.3 + (L - 50) * 0.006);
  const types = L <= 20 ? FRIENDLY.filter(t => t !== 'FL' && t !== 'SE').concat(L > 8 ? ['FL'] : []) : PLAIN.concat(['FL', 'SE']);
  const dup = L <= 8 ? 0 : L <= 20 ? 0.15 + (L - 8) * 0.07 : 1;
  const near = L <= 20 ? 1.2 : Math.max(0, 1.2 - (L - 20) * 0.04);
  return { n: Math.round(n), mix, types, dup, near };
}

export function buildBoard({ seed, n, mix, types, dup = 1, near = 0, preferTemplate = true, force = -1 }) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const rng = mulberry32((seed + attempt * 7919) >>> 0);
    const lay = layoutFor((seed + attempt * 31) >>> 0, n, preferTemplate && attempt < 20, attempt < 30 ? force : -1);
    const board = new Board(lay.tiles);
    const res = findOrder(board, board.alive, rng, 40000, 2.5, near);
    if (typeof res === 'string') continue;
    deal(board, res.order, makePool(board.n / 2, types, mix, rng, dup), rng);
    if (board.moves().length < 2) continue; // never start with a single obvious move
    board.layoutName = lay.name; board.solution = res.order;
    return board;
  }
  throw new Error('buildBoard: could not generate a solvable board for seed ' + seed);
}
export const buildLevel = L => { const p = levelParams(L); return buildBoard({ seed: hashStr('calm-level-' + L), n: p.n, mix: p.mix, types: p.types, dup: p.dup, near: p.near, force: L <= 4 ? L - 1 : -1 }); };
export const buildDaily = ymd => buildBoard({ seed: hashStr('calm-daily-' + ymd), n: 56 + (hashStr(ymd) % 24), mix: 0.35, types: PLAIN.concat(['FL', 'SE']) });

// ---- helpers used while playing ----
// After a user match: is the board still clearable (positions-wise)? 'unknown' counts as OK (never block play on a guess).
export function positionsClearable(board, rng = Math.random) {
  const r = findOrder(board, board.alive, rng, 6000, 1);
  return r !== 'none';
}
// Shuffle remaining faces so a solution is guaranteed. Returns false only if positions themselves are a dead end.
export function reshuffle(board, rng = Math.random) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const res = findOrder(board, board.alive, rng, 20000, 3 + attempt);
    if (typeof res === 'string') { if (res === 'none') return false; continue; }
    const keys = {}, flowers = [], seasons = [];
    for (let i = 0; i < board.n; i++) if (board.alive[i]) { keys[board.key[i]] = (keys[board.key[i]] || 0) + 1; if (board.key[i] === 'FL') flowers.push(board.face[i]); if (board.key[i] === 'SE') seasons.push(board.face[i]); }
    const pool = []; for (const k in keys) for (let c = 0; c < keys[k] / 2; c++) pool.push(k);
    shuffleInPlace(pool, rng);
    deal(board, res.order, pool, rng, { FL: flowers, SE: seasons });
    if (board.moves().length >= 1) { board.history = board.history.slice(); return true; }
  }
  return false;
}
// Best hint: a move that keeps the board winnable.
export function bestHint(board, rng = Math.random) {
  const mv = board.moves(); if (!mv.length) return null;
  const sol = solveFaces(board, 25000);
  if (typeof sol !== 'string') return sol.order[0];
  mv.sort((p, q) => (board.w[q[0]] + board.w[q[1]]) - (board.w[p[0]] + board.w[p[1]]));
  for (const [a, b] of mv.slice(0, 6)) { board.alive[a] = 0; board.alive[b] = 0; const ok = positionsClearable(board, rng); board.alive[a] = 1; board.alive[b] = 1; if (ok) return [a, b]; }
  return mv[0];
}

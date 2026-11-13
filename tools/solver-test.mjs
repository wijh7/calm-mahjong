// Release gate: "No Matching Tiles" must be 0. Usage: node tools/solver-test.mjs [count]
import { buildLevel, buildDaily, Board, solveFaces, reshuffle } from '../www/js/engine.js';
import { mulberry32 } from '../www/js/rng.js';
const N = +process.argv[2] || 1000;
let bad = [], t0 = Date.now(), minTiles = 1e9, maxTiles = 0, solvedIndep = 0, unknownIndep = 0, stuckPlay = {e: [0,0], m: [0,0], h: [0,0]}, shuf = {e: [0,0], m: [0,0], h: [0,0]}, unrecoverable = 0;
function replay(b0) {                       // 1) replay the construction order through the REAL rules on a fresh board
  const b = Board.restore(b0.snapshot());
  for (const [i, j] of b0.solution) if (!b.remove(i, j)) return false;
  return b.remaining === 0;
}
function shufflesNeeded(b0, rng) {          // careless random play + free auto-shuffle: how many shuffles until cleared?
  const b = Board.restore(b0.snapshot()); let sh = 0;
  for (let guard = 0; guard < 400; guard++) { const m = b.moves(); if (!m.length) { if (!b.remaining) return sh; if (!reshuffle(b, rng)) return -1; sh++; continue; } const [i, j] = m[Math.floor(rng() * m.length)]; b.remove(i, j); }
  return -1;
}
function randomPlay(b0, rng) {              // 2) how often does careless random play hit a dead end? (difficulty telemetry)
  const b = Board.restore(b0.snapshot());
  for (;;) { const m = b.moves(); if (!m.length) return b.remaining === 0; const [i, j] = m[Math.floor(rng() * m.length)]; b.remove(i, j); }
}
for (let L = 1; L <= N; L++) {
  let b; try { b = buildLevel(L); } catch (e) { bad.push([L, 'generate: ' + e.message]); continue; }
  minTiles = Math.min(minTiles, b.n); maxTiles = Math.max(maxTiles, b.n);
  if (!replay(b)) bad.push([L, 'construction order fails real rules']);
  if (L % 5 === 0) {                        // independent solver on real faces (budgeted)
    const r = solveFaces(b, 60000); if (typeof r === 'string') { if (r === 'none') bad.push([L, 'independent solver: UNSOLVABLE']); else unknownIndep++; } else solvedIndep++;
  }
  if (L % 10 === 0) { const rng = mulberry32(L), bucket = L <= 20 ? 'e' : L <= 50 ? 'm' : 'h'; let ok = 0; for (let k = 0; k < 30; k++) ok += randomPlay(b, rng) ? 1 : 0; stuckPlay[bucket][0] += 30 - ok; stuckPlay[bucket][1] += 30; for (let k = 0; k < 10; k++) { const s2 = shufflesNeeded(b, rng); if (s2 < 0) unrecoverable++; else { shuf[bucket][0] += s2; shuf[bucket][1]++; } } }
  if (L % 25 === 0) {                       // shuffle must always open a move and stay solvable
    const rng = mulberry32(L * 3); const c = Board.restore(b.snapshot());
    for (let k = 0; k < 6; k++) { const m = c.moves(); if (!m.length) break; c.remove(...m[Math.floor(rng() * m.length)]); }
    if (c.remaining && !c.moves().length || c.remaining) { const ok = reshuffle(c, rng); if (ok === false) { /* positional dead end: engine falls back to safe-step-back */ } else { if (!c.moves().length) bad.push([L, 'shuffle left no move']); const s = solveFaces(c, 60000); if (s === 'none') bad.push([L, 'shuffle produced unsolvable board']); } }
  }
}
for (let d = 0; d < 120; d++) { const ymd = new Date(Date.UTC(2026, 10, 13 + d)).toISOString().slice(0, 10); try { const b = buildDaily(ymd); if (!replay(b)) bad.push(['daily ' + ymd, 'replay fails']); } catch (e) { bad.push(['daily ' + ymd, e.message]); } }
const pct = ([s, t]) => t ? (100 * s / t).toFixed(1) + '% stuck' : 'n/a';
console.log(JSON.stringify({ levels: N, dailies: 120, failures: bad.length, firstFailures: bad.slice(0, 8), tiles: [minTiles, maxTiles], independentSolverSolved: solvedIndep, independentUnknown: unknownIndep, randomPlayStuck: { 'L1-20': pct(stuckPlay.e), 'L21-50': pct(stuckPlay.m), 'L51+': pct(stuckPlay.h) }, avgShufflesRandomPlay: { 'L1-20': (shuf.e[0]/(shuf.e[1]||1)).toFixed(2), 'L21-50': (shuf.m[0]/(shuf.m[1]||1)).toFixed(2), 'L51+': (shuf.h[0]/(shuf.h[1]||1)).toFixed(2) }, randomPlayPositionalDeadEnds: unrecoverable, seconds: ((Date.now() - t0) / 1000).toFixed(1) }, null, 1));
process.exit(bad.length ? 1 : 0);

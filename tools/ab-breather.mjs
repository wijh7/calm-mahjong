import { buildLevel, Board } from '../www/js/engine.js'; import { mulberry32 } from '../www/js/rng.js';
function randomPlay(b0, rng) { const b = Board.restore(b0.snapshot()); for (;;) { const m = b.moves(); if (!m.length) return b.remaining === 0; const [i, j] = m[Math.floor(rng() * m.length)]; b.remove(i, j); } }
const rate = (Ls, T = 40) => { let s = 0, n = 0; for (const L of Ls) { const b = buildLevel(L), rng = mulberry32(L * 7 + 1); for (let k = 0; k < T; k++) { s += randomPlay(b, rng) ? 0 : 1; n++; } } return (100 * s / n).toFixed(1) + '%'; };
const range = (a, z, f = () => true) => Array.from({ length: z - a + 1 }, (_, i) => a + i).filter(f);
console.log('breather levels (L%5==0) 25-50:', rate(range(25, 50, L => L % 5 === 0)));
console.log('normal levels 21-50:', rate(range(21, 50, L => L % 5 !== 0)));
console.log('breather levels 10-20:', rate(range(10, 20, L => L % 5 === 0)), ' normal 5-20:', rate(range(5, 20, L => L % 5 !== 0)));

// Board layouts. Coordinates are in HALF-tile units: a tile occupies [x,x+2) x [y,y+2).
// Portrait-first: max 7 columns so tiles stay BIG (the #1 reason seniors pick Vita).
import { mulberry32, ri } from './rng.js';

// Each layout = list of layers. Layer = {o:[ox,oy], r:[rows]} ; '#' = tile, '.' = empty.
// Layers above 0 with o:[1,1] sit on the seam between four tiles (classic pyramid look).
const T = (name, ...layers) => ({ name, layers: layers.map(l => Array.isArray(l) ? { o: [0, 0], r: l } : l) });

export const TEMPLATES = [
  T('Warm-up', ['######', '######', '####..']),
  T('Window', ['######', '#....#', '#....#', '######']),
  T('Diamond', ['...#...', '..###..', '.#####.', '#######', '.#####.', '..###..', '...#...']),
  T('Heart', ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']),
  T('Pond', ['.#####.', '##...##', '##...##', '##...##', '.#####.'], { o: [0, 0], r: ['.......', '.#...#.', '.......', '.#...#.', '.......'] }),
  T('Pyramid', ['#######', '#######', '#######', '#######'], { o: [1, 1], r: ['######', '######', '######'] }, { o: [2, 2], r: ['#####', '#####'] }),
  T('Lantern', ['..###..', '.#####.', '..###..', '.#####.', '..###..', '.#####.', '..###..'], { o: [0, 0], r: ['.......', '..###..', '.......', '..###..', '.......', '..###..', '.......'] }),
  T('Moon', ['..###..', '.##....', '##.....', '##.....', '##.....', '.##....', '..###..'], { o: [0, 0], r: ['.......', '.......', '.#.....', '.#.....', '.#.....', '.......', '.......'] }),
  T('Butterfly', ['##...##', '###.###', '#######', '###.###', '##...##', '#.....#'], { o: [0, 0], r: ['.......', '.#...#.', '..#.#..', '.#...#.', '.......', '.......'] }),
  T('Pagoda', ['...#...', '..###..', '...#...', '.#####.', '..###..', '#######', '.#####.'], { o: [0, 0], r: ['.......', '...#...', '.......', '..###..', '.......', '.#####.', '.......'] }, { o: [0, 0], r: ['.......', '.......', '.......', '...#...', '.......', '..###..', '.......'] }),
  T('Garden', ['#######', '#.....#', '#.###.#', '#.###.#', '#.....#', '#######'], { o: [0, 0], r: ['.......', '.......', '..###..', '..###..', '.......', '.......'] }),
  T('Fish', ['..###..', '.#####.', '#######', '#######', '.#####.', '..###..', '.#...#.', '##...##'], { o: [0, 0], r: ['.......', '.......', '..###..', '..###..', '.......', '.......', '.......', '.......'] }),
  T('Tree', ['..###..', '.#####.', '#######', '.#####.', '#######', '...#...', '...#...', '..###..'], { o: [0, 0], r: ['.......', '..###..', '.#####.', '..###..', '.......', '.......', '.......', '.......'] }, { o: [0, 0], r: ['.......', '.......', '..###..', '.......', '.......', '.......', '.......', '.......'] }),
  T('Cross', ['..###..', '..###..', '#######', '#######', '#######', '..###..', '..###..'], { o: [0, 0], r: ['.......', '.......', '..###..', '..###..', '..###..', '.......', '.......'] }, { o: [0, 0], r: ['.......', '.......', '.......', '...#...', '.......', '.......', '.......'] }),
  T('Turtle', ['.#####.', '#######', '#######', '#######', '#######', '.#####.'], { o: [0, 0], r: ['.......', '.#####.', '.#####.', '.#####.', '.#####.', '.......'] }, { o: [0, 0], r: ['.......', '.......', '..###..', '..###..', '.......', '.......'] }, { o: [0, 0], r: ['.......', '.......', '.......', '...#...', '.......', '.......'] }),
  T('Blossom', ['..#.#..', '.#####.', '#######', '.#####.', '#######', '.#####.', '..#.#..'], { o: [1, 1], r: ['.####.', '.####.', '.####.', '.####.', '.####.', '......'] }, { o: [0, 0], r: ['.......', '.......', '..###..', '..###..', '..###..', '.......', '.......'] }),
];

function parse(t) {
  const out = [];
  t.layers.forEach((L, z) => {
    L.r.forEach((row, ry) => {
      for (let cx = 0; cx < row.length; cx++) if (row[cx] === '#') out.push({ x: cx * 2 + L.o[0], y: ry * 2 + L.o[1], z });
    });
  });
  return out;
}

// Procedural symmetric layouts so levels stay fresh forever (hundreds of distinct boards).
export function procedural(seed, target) {
  const r = mulberry32(seed);
  const cols = target < 40 ? ri(r, 5, 6) : 7, rows = Math.min(10, Math.max(5, Math.round(target / (cols * 0.62))));
  const mid = (cols - 1) / 2, rmid = (rows - 1) / 2;
  const L0 = [];
  for (let y = 0; y < rows; y++) {
    const env = 1 - Math.pow(Math.abs(y - rmid) / (rmid + 1), 1.6 + r());
    const hw = Math.max(0.5, Math.min(mid + 0.5, (mid + 0.5) * (0.55 + 0.6 * env) + (r() - 0.5)));
    const row = [];
    for (let x = 0; x < cols; x++) row.push(Math.abs(x - mid) <= hw);
    for (let x = 0; x < Math.ceil(cols / 2); x++) row[cols - 1 - x] = row[x]; // mirror
    L0.push(row);
  }
  // carve a few symmetric holes (breathing space, never in the border)
  for (let k = ri(r, 0, 2); k > 0; k--) {
    const y = ri(r, 1, rows - 2), x = ri(r, 1, Math.floor(cols / 2));
    L0[y][x] = false; L0[y][cols - 1 - x] = false;
  }
  const tiles = [];
  const has = (g, x, y) => y >= 0 && y < g.length && x >= 0 && x < cols && g[y][x];
  L0.forEach((row, y) => row.forEach((v, x) => v && tiles.push({ x: x * 2, y: y * 2, z: 0 })));
  let prev = L0; const layers = target > 30 ? ri(r, 1, target > 70 ? 3 : 2) : 0;
  for (let z = 1; z <= layers; z++) {
    const g = prev.map((row, y) => row.map((v, x) => v && has(prev, x - 1, y) && has(prev, x + 1, y) && has(prev, x, y - 1) && has(prev, x, y + 1) && r() < 0.62));
    for (let y = 0; y < rows; y++) for (let x = 0; x < Math.ceil(cols / 2); x++) g[y][cols - 1 - x] = g[y][x];
    g.forEach((row, y) => row.forEach((v, x) => v && tiles.push({ x: x * 2, y: y * 2, z })));
    prev = g;
  }
  return tiles;
}

// Make tile count even; drop from the outermost, highest tile (keeps the shape intact).
export function fixParity(tiles) {
  if (tiles.length % 2 === 0) return tiles;
  let best = 0;
  tiles.forEach((t, i) => { const b = tiles[best]; if (t.z > b.z || (t.z === b.z && Math.abs(t.x - 6) + Math.abs(t.y - 8) > Math.abs(b.x - 6) + Math.abs(b.y - 8))) best = i; });
  return tiles.filter((_, i) => i !== best);
}

// Erode the board towards `target` tiles by removing the outermost tile that has nothing stacked on it (shape stays whole & supported).
export function trimTo(tiles, target) {
  const out = tiles.slice();
  const cx = out.reduce((a, t) => a + t.x, 0) / out.length, cy = out.reduce((a, t) => a + t.y, 0) / out.length;
  while (out.length > target) {
    let best = -1, bd = -1;
    out.forEach((t, i) => { if (out.some(o => o.z > t.z && Math.abs(o.x - t.x) < 2 && Math.abs(o.y - t.y) < 2)) return; const d = t.z * 100 + Math.abs(t.x - cx) * 1.2 + Math.abs(t.y - cy); if (d > bd) { bd = d; best = i; } });
    if (best < 0) break; out.splice(best, 1);
  }
  return out;
}
export function layoutFor(seed, targetCount, preferTemplate = true, force = -1) {
  const r = mulberry32(seed ^ 0x9e3779b9);
  if (force >= 0) return { name: TEMPLATES[force].name, tiles: fixParity(parse(TEMPLATES[force])) };
  if (preferTemplate) {
    const cands = TEMPLATES.map(parse).map((t, i) => ({ t, i })).filter(c => Math.abs(c.t.length - targetCount) <= Math.max(8, targetCount * 0.22));
    if (cands.length && r() < 0.7) { const c = cands[Math.floor(r() * cands.length)]; return { name: TEMPLATES[c.i].name, tiles: fixParity(trimTo(c.t, targetCount + 2)) }; }
  }
  return { name: 'Garden path', tiles: fixParity(trimTo(procedural(seed, targetCount), targetCount)) };
}

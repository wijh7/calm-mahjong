// Palettes. "Look" = global light (day / evening / night-calm / high-contrast). "Region" = cultural tile theme earned by progress.
// All art is original; country names are cultural inspirations only.
const base = {
  face0: '#f7f0df', face1: '#eadfc7', edge: '#c9b894', side: '#b8a583', side2: '#d7c6a2', ink: '#27324b', red: '#c8453b', green: '#2f7d5b', blue: '#2b5a9e',
  gold2: '#b8892b', plum: '#9a3f6a', dimColor: 'rgba(36,40,72,.23)', accent: '#ffbf66', pattern: null,
};
export const LOOKS = {
  evening: { ...base, id: 'evening', bg: ['#0f1730', '#1f2b52', '#3d416f'], glow: '#ffbf66', ground: ['#24344a', '#18222f'], ui: '#f3ead8', uiSoft: 'rgba(243,234,216,.72)', panel: 'rgba(18,24,44,.72)', dark: true },
  day: { ...base, id: 'day', face0: '#fcfefd', face1: '#e6eeea', edge: '#b4c8bf', side: '#8fa99d', side2: '#b7cbc2', ink: '#1c3a33', red: '#d2574a', green: '#237a62', blue: '#2a63a8', dimColor: 'rgba(20,60,50,.27)', bg: ['#dbe8d6', '#b1c9b6', '#85a999'], glow: '#fff2c0', ground: ['#7fa690', '#69917c'], ui: '#16332c', uiSoft: 'rgba(22,51,44,.7)', panel: 'rgba(255,255,255,.55)', dark: false },
  night: { ...base, id: 'night', face0: '#d9d1bf', face1: '#c6bda7', edge: '#9d927a', side: '#6a624f', side2: '#857b64', ink: '#252a39', red: '#a3433b', green: '#2a674d', blue: '#2b4d84', dimColor: 'rgba(6,8,16,.4)', bg: ['#05070d', '#090d18', '#101626'], glow: '#c9b27a', ground: ['#121a26', '#0b111a'], ui: '#cfc7b4', uiSoft: 'rgba(207,199,180,.62)', panel: 'rgba(10,13,22,.8)', dark: true, accent: '#d9b26a' },
};
export const CONTRAST = { face0: '#ffffff', face1: '#f2f2f2', edge: '#000', side: '#555', side2: '#777', ink: '#000', red: '#b3140c', green: '#0b5f2e', blue: '#0a2f86', dimColor: 'rgba(0,0,0,.52)', bg: ['#0b0b0b', '#121212', '#1a1a1a'], ground: ['#222', '#161616'], ui: '#fff', uiSoft: 'rgba(255,255,255,.85)', panel: 'rgba(0,0,0,.85)', dark: true };

const dots = (r, a, gap) => (c, w, h) => { c.fillStyle = `rgba(80,50,20,${a})`; for (let y = gap / 2; y < h; y += gap) for (let x = (Math.round(y / gap) % 2 ? gap / 2 : 0) + gap / 2; x < w; x += gap) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } };
const stripes = (col, a, gap) => (c, w, h) => { c.strokeStyle = col.replace('A', a); c.lineWidth = gap * 0.3; for (let k = -h; k < w + h; k += gap) { c.beginPath(); c.moveTo(k, h); c.lineTo(k + h, 0); c.stroke(); } };
const crosses = (col, a, gap) => (c, w, h) => { c.strokeStyle = col.replace('A', a); c.lineWidth = 1.2; for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) { c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x + 3, y); c.moveTo(x, y - 3); c.lineTo(x, y + 3); c.stroke(); } };

// 10 regions x 50 levels. `from` = first level. Theme unlocks by progress (or 500 coins / 1 ad, player's choice).
export const REGIONS = [
  { id: 'batik', name: 'Indonesia', theme: 'Batik', face0: '#f8ecd0', face1: '#ecd9ae', edge: '#b89560', side: '#a07848', side2: '#c9a46c', accent: '#d98b3a', pattern: dots(1.6, 0.07, 14) },
  { id: 'capiz', name: 'Philippines', theme: 'Capiz', face0: '#fbf4e4', face1: '#efe3c6', edge: '#c9b48a', side: '#b69a68', side2: '#d8c28f', accent: '#f2b84b', pattern: crosses('rgba(160,120,40,A)', 0.2, 16) },
  { id: 'sakura', name: 'Japan', theme: 'Sakura', face0: '#fdf1ef', face1: '#f3d9d6', edge: '#d9a9a6', side: '#c48a8a', side2: '#e0b4b2', accent: '#f4a6b8', pattern: dots(2.2, 0.06, 22) },
  { id: 'carnaval', name: 'Brazil', theme: 'Carnaval', face0: '#f6f3dc', face1: '#e6e3b8', edge: '#b5b36a', side: '#4f9a5b', side2: '#7fc18a', accent: '#ffd23f', pattern: stripes('rgba(40,140,80,A)', 0.07, 12) },
  { id: 'iznik', name: 'Türkiye', theme: 'Iznik', face0: '#f3f8fa', face1: '#d9e8ee', edge: '#8fb4c4', side: '#2f7da1', side2: '#62a8c7', accent: '#3fb7c9', pattern: crosses('rgba(30,100,150,A)', 0.22, 14) },
  { id: 'fachwerk', name: 'Germany', theme: 'Fachwerk', face0: '#f4efe6', face1: '#e4dccb', edge: '#b0a48a', side: '#8a6a4a', side2: '#ad8c68', accent: '#c98a4b', pattern: stripes('rgba(90,60,30,A)', 0.05, 18) },
  { id: 'lavande', name: 'France', theme: 'Lavande', face0: '#f6f2fb', face1: '#e4dbf0', edge: '#b9a9d4', side: '#8a74b4', side2: '#b09bd4', accent: '#b69be0', pattern: dots(1.6, 0.06, 15) },
  { id: 'talavera', name: 'Mexico', theme: 'Talavera', face0: '#fbf6ea', face1: '#efe3c8', edge: '#c9a874', side: '#c2603f', side2: '#e0876a', accent: '#f0a03c', pattern: crosses('rgba(30,90,160,A)', 0.2, 15) },
  { id: 'azulejo', name: 'Spain', theme: 'Azulejo', face0: '#f5f8fc', face1: '#dde6f2', edge: '#97add0', side: '#35599a', side2: '#6a8cc6', accent: '#4f79c9', pattern: crosses('rgba(40,80,160,A)', 0.22, 13) },
  { id: 'prairie', name: 'USA', theme: 'Prairie', face0: '#faf3e3', face1: '#ecdfbf', edge: '#bda878', side: '#a8794a', side2: '#cf9f6e', accent: '#e0a84a', pattern: dots(1.4, 0.06, 16) },
];
export const regionFor = level => REGIONS[Math.min(REGIONS.length - 1, Math.floor((level - 1) / 50)) % REGIONS.length];
export const regionIndex = level => Math.floor((level - 1) / 50);

export function lookId(set, hour = new Date().getHours()) { return set.look === 'auto' ? (hour >= 6 && hour < 17 ? 'day' : 'evening') : set.look; }
// Final tile/UI palette.
export function palette(set, level = 1, opts = {}) {
  const look = LOOKS[lookId(set)] || LOOKS.evening;
  let p = { ...look };
  if (look.id !== 'night' && level >= 1 && !opts.noRegion) { const r = opts.region || regionFor(level); p = { ...p, face0: r.face0, face1: r.face1, edge: r.edge, side: r.side, side2: r.side2, accent: r.accent, pattern: r.pattern }; }
  if (set.contrast) p = { ...p, ...CONTRAST, accent: p.accent, pattern: null };
  return p;
}

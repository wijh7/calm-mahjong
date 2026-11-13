// Save system: double backup (two slots + checksum) so a crash mid-write can never wipe progress, plus an optional
// mirror into Capacitor Preferences (survives WebView storage resets). Android Auto Backup restores it after reinstall.
const KEY = 'cm.save.a', KEY2 = 'cm.save.b', VERSION = 3;
const sum = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h >>> 0; };
export const ymd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; // LOCAL device date, never UTC/server
export const dayNum = s => { const [y, m, d] = s.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };       // DST-proof day difference

export const DEFAULT = () => ({
  v: VERSION, coins: 80, level: 1, items: {}, themes: ['washi'], pass: false, installYmd: ymd(), firstRun: true,
  set: { lang: '', sound: 'silent', look: 'auto', contrast: false, text: 1, haptics: true, showFree: true, motion: true, reminder: false, vol: 0.6 },
  streak: { n: 0, last: '', rest: '' }, daily: { ymd: '', done: false },
  ads: { day: '', rewarded: 0, inter: 0, lastInter: 0, since: 0, failGrants: 0, consent: '' },
  hints: 0, stats: { done: 0, played: 0 }, game: null, rated: 0, lastSeen: 0,
});
const merge = (d, s) => { for (const k in s) d[k] = (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]) && d[k] && typeof d[k] === 'object') ? merge(d[k], s[k]) : s[k]; return d; };

function readSlot(k) {
  try { const raw = localStorage.getItem(k); if (!raw) return null; const o = JSON.parse(raw); if (o.c !== sum(o.d)) return null; return { t: o.t, data: JSON.parse(o.d) }; } catch { return null; }
}
export function load() {
  const a = readSlot(KEY), b = readSlot(KEY2);
  const best = [a, b].filter(Boolean).sort((p, q) => q.t - p.t)[0];
  const st = DEFAULT(); if (best) merge(st, best.data); migrate(st); return st;
}
function migrate(st) { // older saves stay playable after updates (Update Test)
  if (!st.v || st.v < VERSION) st.v = VERSION;
  if (!Array.isArray(st.themes)) st.themes = ['washi'];
  st.coins = Math.max(0, st.coins | 0); st.level = Math.max(1, st.level | 0);
}
let slot = 0, timer = 0, pending = null;
export function save(st, now = false) {
  pending = st; if (now) return flush(); if (!timer) timer = setTimeout(flush, 400);
}
export function flush() {
  clearTimeout(timer); timer = 0; if (!pending) return; const st = pending; pending = null;
  try {
    const d = JSON.stringify(st), payload = JSON.stringify({ t: Date.now(), c: sum(d), d });
    slot ^= 1; localStorage.setItem(slot ? KEY : KEY2, payload);
    const P = window.Capacitor?.Plugins?.Preferences; if (P) P.set({ key: 'cm.mirror', value: payload }).catch(() => {});
  } catch (e) { /* storage full or blocked: keep playing, never crash */ }
}
// If WebView storage was wiped but the native mirror survived, restore from it.
export async function restoreFromMirror(st) {
  const P = window.Capacitor?.Plugins?.Preferences; if (!P) return false;
  try { const { value } = await P.get({ key: 'cm.mirror' }); if (!value) return false; const o = JSON.parse(value); if (o.c !== sum(o.d)) return false;
    if (st.stats.done === 0 && JSON.parse(o.d).stats?.done > 0) { merge(st, JSON.parse(o.d)); migrate(st); return true; } } catch {} return false;
}
addEventListener('pagehide', flush); document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

// Streak: counts when a level is finished. One missed day per week is forgiven ("rest day"). Clock going backwards never punishes.
export function touchStreak(st, today = ymd()) {
  const s = st.streak; if (s.last === today) return { n: s.n, rested: false };
  if (!s.last) { s.n = 1; s.last = today; return { n: 1, rested: false }; }
  const gap = dayNum(today) - dayNum(s.last);
  let rested = false;
  if (gap <= 0) return { n: s.n, rested: false };
  if (gap === 1) s.n++;
  else if (gap === 2 && (!s.rest || dayNum(today) - dayNum(s.rest) >= 7)) { s.n++; s.rest = today; rested = true; }
  else s.n = 1;
  s.last = today; return { n: s.n, rested };
}

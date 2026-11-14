// Recorded music collection. Streams one file at a time through two <audio> elements (no decoding into memory), crossfading
// at the end of each track so shuffle and single-track loops never click or leave a gap. Off by default; pauses when hidden.
export const TRACKS = [
  { id: 'harp', g: 'china', title: 'Chinese Peaceful Heartwarming Harp', short: 'Chinese Peaceful Harp', by: 'REDproductions', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'tea', g: 'china', title: 'Chinese Tea', by: 'DayNigthMorning', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'chinese', g: 'china', title: 'Chinese', by: 'Kulakovka', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'oriental', g: 'china', title: 'Chinese Traditional Asian Oriental Music', short: 'Chinese Traditional', by: 'Denis-Pavlov-Music', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'ripple', g: 'china', title: 'Ripple', by: 'ET11LX', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'flute9', g: 'china', title: 'Guzheng and Japanese Bamboo Flute 9', short: 'Guzheng & Bamboo Flute 9', by: 'Guzheng-Soundtrack', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'gmorning', g: 'china', title: 'Guzheng Morning', by: 'RainStreetCat', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'flute4', g: 'china', title: 'Guzheng and Japanese Bamboo Flute 4', short: 'Guzheng & Bamboo Flute 4', by: 'Guzheng-Soundtrack', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'balix', g: 'indo', title: 'Bali Xylophone', by: 'adamfk', src: 'Freesound', lic: 'CC0' },
  { id: 'balix2', g: 'indo', title: 'Bali Xylophone 2', by: 'thedialogueproject', src: 'Freesound', lic: 'CC0' },
  { id: 'tingklik', g: 'indo', title: 'Angklung (xylophone) - Bali', short: 'Tingklik Bali', by: 'RTB45', src: 'freesound.org/s/203364', lic: 'CC BY 4.0' },
  { id: 'garden', g: 'other', title: 'Peaceful Garden', by: 'HarumachiMusic', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'birds', g: 'other', title: 'Morning Birds (Harp and Birds)', short: 'Morning Birds', by: 'KonstantinPazuzuStudio', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'kalimba', g: 'other', title: 'My Dreamy Place', by: 'Alex_Jauk', src: 'Pixabay', lic: 'Pixabay Content License' },
  { id: 'sky', g: 'other', title: 'Morning Sky', by: 'Centurion_of_war', src: 'OpenGameArt', lic: 'CC0' },
];
export const WIN_TRACK = { id: 'win', title: 'Chinese Ancient Style Music - Love', by: 'ET11LX', src: 'Pixabay', lic: 'Pixabay Content License' };
const XF = 3.5, LEVEL = 0.85;
const holds = new Set();
let have = null, mode = 'off', vol = 0.6, cur = null, old = null, curId = null, timer = null, held = false, winEl = null, lastIds = [];
const url = id => 'music/' + id + '.ogg';
const mk = () => { const a = new window.Audio(); a.preload = 'auto'; a.volume = 0; a._f = 0; return a; };
const apply = a => { if (a) a.volume = Math.max(0, Math.min(1, a._f * vol * LEVEL)); };
function fade(a, to, secs, done) {
  if (!a) return; clearInterval(a._t); const from = a._f, t0 = performance.now();
  a._t = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / (secs * 1000)); a._f = from + (to - from) * k; apply(a); if (k >= 1) { clearInterval(a._t); done?.(); } }, 60);
}
function kill(a) { if (!a) return; clearInterval(a._t); try { a.pause(); a.removeAttribute('src'); a.load(); } catch {} }
function pick() {
  const list = Music.available(); if (!list.length) return null;
  if (mode !== 'shuffle') return list.find(x => x.id === mode)?.id || null;
  const fresh = list.filter(x => !lastIds.includes(x.id)); const pool = fresh.length ? fresh : list.filter(x => x.id !== curId);
  return (pool.length ? pool : list)[Math.floor(Math.random() * (pool.length || list.length))].id;
}
function start(id, secs = 1.2) {
  if (!id) return; const a = mk(); a.src = url(id); const prev = cur; cur = a; curId = id; lastIds = [id, ...lastIds].slice(0, Math.min(5, Math.max(0, Music.available().length - 1)));
  if (prev) { old = prev; fade(prev, 0, secs, () => { kill(prev); if (old === prev) old = null; }); }
  a.addEventListener('error', () => { if (cur === a) { cur = null; curId = null; } }, { once: true });
  a.play().then(() => fade(a, 1, secs)).catch(() => {});
}
function tick() {
  if (held || !cur || mode === 'off' || cur.paused) return; const d = cur.duration;
  if (Number.isFinite(d) && d > XF * 2 && cur.currentTime >= d - XF) start(pick(), XF);
  else if (cur.ended) start(pick(), 0.6);
}
export const Music = {
  async init() { try { const r = await fetch('music/manifest.json'); have = r.ok ? new Set((await r.json()).tracks) : new Set(); } catch { have = new Set(); } },
  available() { return TRACKS.filter(x => have && have.has(x.id)); },
  hasWin() { return !!(have && have.has('win')); },
  mode() { return mode; }, current() { return curId; }, playing() { return !!cur && !cur.paused && cur.currentTime > 0; }, _el() { return cur; },
  setVolume(v) { vol = v; apply(cur); apply(old); if (winEl) winEl.volume = Math.min(1, vol * LEVEL); },
  // 'off' | 'shuffle' | track id. Must be called from a user gesture the first time (autoplay policy).
  set(m) {
    mode = m; clearInterval(timer); timer = null; this.endWin(true);
    if (m === 'off' || !this.available().length) { mode = this.available().length ? m : 'off'; const a = cur; cur = null; curId = null; if (a) fade(a, 0, 0.8, () => kill(a)); return; }
    if (m !== 'shuffle' && curId === m && cur && !cur.paused) { timer = setInterval(tick, 400); return; }
    start(pick()); timer = setInterval(tick, 400);
  },
  next() { if (mode === 'shuffle' && cur && !held) start(pick(), 1.5); },
  win() {
    if (mode === 'off' || !this.hasWin() || held) return; this.endWin(true);
    const w = new window.Audio(url('win')); w.volume = Math.min(1, vol * LEVEL); winEl = w; if (cur) fade(cur, 0.12, 0.8);
    w.addEventListener('ended', () => this.endWin(), { once: true }); w.play().catch(() => this.endWin());
  },
  endWin(silent) { if (!winEl) return; const w = winEl; winEl = null; try { w.pause(); } catch {} if (!silent && cur) fade(cur, 1, 1.5); else if (cur) fade(cur, 1, 0.6); },
  hold(why = 'ad') { holds.add(why); held = true; cur?.pause(); old?.pause(); winEl?.pause(); },
  release(why = 'ad') { holds.delete(why); if (holds.size || !held) return; held = false; if (mode !== 'off') { cur?.play().catch(() => {}); winEl?.play().catch(() => {}); } },
};
document.addEventListener('visibilitychange', () => document.hidden ? Music.hold('bg') : Music.release('bg'));

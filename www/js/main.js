import { load, save, flush, restoreFromMirror, touchStreak, ymd } from './store.js';
import { t, setLang, detect, lang, LANGS } from './i18n.js';
import { Board, buildLevel, buildDaily, positionsClearable, reshuffle, bestHint } from './engine.js';
import { renderTile } from './tiles.js';
import { palette, REGIONS, regionFor, regionIndex, lookId, LOOKS } from './themes.js';
import { Garden, ITEMS, drawItem } from './scene.js';
import { Audio } from './audio.js';
import { Ads, AdPolicy } from './ads.js';
import { Billing } from './billing.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const DEBUG = new URLSearchParams(location.search).has('debug');
const CAP = window.Capacitor?.Plugins || {};
const ICONS = {
  coin: '<circle cx="12" cy="12" r="9" fill="#ffbf66"/><circle cx="12" cy="12" r="6" fill="none" stroke="#a8691a" stroke-width="1.6"/><path d="M12 8.5v7M9.8 12h4.4" stroke="#a8691a" stroke-width="1.6" stroke-linecap="round"/>',
  gear: '<path d="M12 8.6a3.4 3.4 0 100 6.8 3.4 3.4 0 000-6.8zm8 4.4v-2l-2.1-.5a6.6 6.6 0 00-.7-1.6l1.1-1.9-1.4-1.4-1.9 1.1a6.6 6.6 0 00-1.6-.7L12.9 4h-2l-.5 2.1a6.6 6.6 0 00-1.6.7L6.9 5.7 5.5 7.1l1.1 1.9c-.3.5-.5 1-.7 1.6L3.8 11v2l2.1.5c.2.6.4 1.1.7 1.6l-1.1 1.9 1.4 1.4 1.9-1.1c.5.3 1 .5 1.6.7l.5 2.1h2l.5-2.1c.6-.2 1.1-.4 1.6-.7l1.9 1.1 1.4-1.4-1.1-1.9c.3-.5.5-1 .7-1.6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  sun: '<circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  map: '<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  bag: '<path d="M5 8h14l-1 12H6zM9 8V6.5a3 3 0 016 0V8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c3-4 6-7 10-9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  undo: '<path d="M9 7L4.5 11.5 9 16M5 11.5h9.5a5 5 0 010 10H12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -3)"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0012 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  shuffle: '<path d="M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.4 0 2.4-1.2 3.3-2.7M20 7h-3.5c-1.4 0-2.4 1.2-3.3 2.7M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
};
const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const hydrateIcons = (root = document) => root.querySelectorAll('[data-ic]').forEach(e => { if (!e.dataset.done) { e.innerHTML = icon(e.dataset.ic); e.dataset.done = 1; } });

let st = load(), pal, game = null, garden, current = 'home';
const live = m => { $('#live').textContent = ''; setTimeout(() => $('#live').textContent = m, 30); };
const buzz = ms => { if (!st.set.haptics) return; try { CAP.Haptics ? CAP.Haptics.impact({ style: 'LIGHT' }) : navigator.vibrate?.(ms); } catch {} };

// ---------- look, language, static text ----------
function regionOf(level) { const o = st.set.theme; return (o && o !== 'auto' && REGIONS.find(r => r.id === o && st.themes.includes(r.id))) || regionFor(level); }
function applyLook() {
  pal = palette(st.set, game ? game.level : st.level, { region: regionOf(game ? game.level : st.level) });
  const r = document.documentElement.style, p = pal;
  r.setProperty('--ui', p.ui); r.setProperty('--soft', p.uiSoft); r.setProperty('--panel', p.panel); r.setProperty('--ts', [1, 1.15, 1.3][st.set.text] || 1);
  r.setProperty('--accent', p.accent || '#ffbf66'); document.body.classList.toggle('light', !p.dark);
  const nm = !st.set.motion || matchMedia('(prefers-reduced-motion: reduce)').matches; document.body.classList.toggle('nomotion', nm);
  document.querySelector('meta[name=theme-color]').content = p.bg[0]; document.body.style.background = `linear-gradient(180deg,${p.bg[0]},${p.bg[1]} 55%,${p.bg[2]})`;
  garden?.set(st.items, palette(st.set, 1, { noRegion: true }), !nm);
  spriteCache.clear();
}
function renderStatic() {
  $('#brand').textContent = t('app'); $('#nMap').textContent = t('map'); $('#nShop').textContent = t('shop'); $('#nDecor').textContent = t('garden');
  $('#lUndo').textContent = t('undo'); $('#lHint').textContent = t('hint'); $('#lShuffle').textContent = t('shuffle');
  $('#dailyTitle').textContent = t('daily'); renderHome();
}
function renderHome() {
  $$('.coin b').forEach(b => b.textContent = st.coins.toLocaleString(lang()));
  const resume = st.game && st.game.mode === 'level';
  $('#playLabel').textContent = t(resume ? 'continue' : 'play');
  const rg = regionOf(st.level); $('#playSub').textContent = `${t('level', { n: st.level })} · ${rg.theme}`;
  const done = st.daily.ymd === ymd() && st.daily.done; $('#btnDaily').disabled = done;
  $('#dailySub').textContent = done ? t('dailyDone') : t('S11'); $('#btnDaily').setAttribute('aria-label', t('daily') + ': ' + (done ? t('dailyDone') : t('dailyOpen')));
  document.body.classList.toggle('banner', Ads.bannerOn);
}

// ---------- sheets / toast ----------
let sheetClose = null;
function openSheet({ title, body, buttons = [], onClose, dismiss = true }) {
  const s = $('#sheet'); s.innerHTML = ''; s.classList.remove('win'); const h = document.createElement('h2'); h.textContent = title; s.append(h);
  if (body) { const p = document.createElement('p'); p.textContent = body; s.append(p); }
  const wrap = document.createElement('div'); wrap.className = 'btns'; s.append(wrap);
  buttons.forEach(b => { const e = document.createElement('button'); e.className = 'btn ' + (b.kind || ''); e.textContent = b.label; if (b.sub) { const sm = document.createElement('small'); sm.textContent = b.sub; e.append(sm); } e.onclick = () => b.fn?.(); wrap.append(e); });
  sheetClose = () => { closeSheet(); onClose?.(); }; $('#sheetWrap').hidden = false; if (dismiss) $('#sheetBack').onclick = sheetClose; else $('#sheetBack').onclick = null; s.querySelector('button')?.focus();
  return s;
}
function closeSheet() { $('#sheetWrap').hidden = true; sheetClose = null; }
let toastTimer = 0;
function toast(msg, o = {}) { const e = $('#toast'); e.textContent = msg; if (o.action) { const b = document.createElement('button'); b.textContent = o.action; b.onclick = () => { e.classList.remove('on'); o.fn(); }; e.append(b); } e.classList.add('on'); live(msg); clearTimeout(toastTimer); toastTimer = setTimeout(() => e.classList.remove('on'), o.ms || 3600); }

// ---------- sprite cache ----------
const spriteCache = new Map();
function sprite(id, w, h, state) { const k = `${id}|${w}|${h}|${state}|${pal.id}|${regionOf(game?.level || st.level).id}|${st.set.contrast}`; let s = spriteCache.get(k); if (!s) { s = renderTile(id, w, h, pal, { dim: state === 'dim', selected: state === 'sel', hint: state === 'hint', contrast: st.set.contrast }); spriteCache.set(k, s); if (spriteCache.size > 220) spriteCache.delete(spriteCache.keys().next().value); } return s; }

// ---------- game ----------
const cv = $('#board'), cx2 = cv.getContext('2d');
let raf = 0, dirty = true;
function startGame(mode, level) {
  Audio.unlock();
  let board, hints = 3, shuffles = 2, resumed = false; const today = ymd();
  const g = st.game;
  if (g && g.mode === mode && (mode === 'daily' ? g.ymd === today : g.level === level)) { try { board = Board.restore(g.snap); hints = g.hints ?? 3; shuffles = g.shuffles ?? 2; resumed = true; } catch { board = null; } }
  if (!board) { board = mode === 'daily' ? buildDaily(today) : buildLevel(level); }
  game = { mode, level, board, hints, shuffles, sel: -1, hintPair: null, fx: [], shake: null, combo: 0, lastMatch: 0, won: false, riskShown: false, ymd: today, tut: mode === 'level' && level === 1 && st.stats.done === 0 && !resumed };
  game.free = board.freeSet(); st.stats.played++;
  applyLook(); show('game'); layout(); updateHUD(); persist();
  if (game.tut) { game.hintPair = bestHint(board); $('#coach').hidden = false; $('#coach').textContent = t('tut1'); } else $('#coach').hidden = true;
  if (!board.moves().length && board.remaining) autoShuffle();
  requestDraw(); Ads.banner(false, st);
}
function persist() { if (!game || game.won) return; st.game = { mode: game.mode, level: game.level, ymd: game.ymd, snap: game.board.snapshot(), hints: game.hints, shuffles: game.shuffles }; save(st); }
function updateHUD() {
  const b = game.board; $('#gLevel').textContent = game.mode === 'daily' ? t('daily') : t('level', { n: game.level }); $('#gLeft').textContent = t('tilesLeft', { n: b.remaining });
  $('#tUndo').disabled = !b.history.length; $('#cHint').textContent = game.hints > 0 ? game.hints : (Ads.rewardedAvailable(st) || st.coins >= 15 ? '+' : ''); $('#gCoins b').textContent = st.coins.toLocaleString(lang());
}
let L = null; // layout metrics
function layout() {
  if (!game) return; const wrap = $('#boardWrap'), r = wrap.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  if (!r.width) return; cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); cx2.setTransform(dpr, 0, 0, dpr, 0, 0);
  const b = game.board; let minx = 1e9, maxx = 0, miny = 1e9, maxy = 0, zmax = 0;
  for (let i = 0; i < b.n; i++) { minx = Math.min(minx, b.x[i]); maxx = Math.max(maxx, b.x[i] + 2); miny = Math.min(miny, b.y[i]); maxy = Math.max(maxy, b.y[i] + 2); zmax = Math.max(zmax, b.z[i]); }
  const Wh = maxx - minx, Hh = maxy - miny, ASP = 1.28, pad = 8;
  let u = Math.min((r.width - pad * 2) / (Wh + 0.2 + 0.18 * zmax), (r.height - pad * 2) / (ASP * Hh + 0.26 + 0.18 * zmax), 46);
  u = Math.floor(u * 2) / 2; const tw = Math.round(2 * u), th = Math.round(2 * u * ASP), dz = 0.18 * u;
  const totalW = Wh * u + tw * 0.1 + zmax * dz, totalH = Hh * ASP * u + th * 0.1 + zmax * dz, ox = (r.width - totalW) / 2 + zmax * dz, oy = (r.height - totalH) / 2 + zmax * dz;
  const X = new Float32Array(b.n), Y = new Float32Array(b.n);
  for (let i = 0; i < b.n; i++) { X[i] = ox + (b.x[i] - minx) * u - b.z[i] * dz; Y[i] = oy + (b.y[i] - miny) * ASP * u - b.z[i] * dz; }
  const order = [...Array(b.n).keys()].sort((p, q) => b.z[p] - b.z[q] || b.y[p] - b.y[q] || b.x[p] - b.x[q]);
  L = { X, Y, tw, th, order, dpr, spw: Math.round(tw * dpr), sph: Math.round(th * dpr), fw: tw - Math.round(tw * 0.1), fh: th - Math.round(tw * 0.1) };
  game.metrics = { tileWidthCssPx: tw, tileHeightCssPx: th, boardW: Math.round(totalW), boardH: Math.round(totalH), viewW: Math.round(r.width) };
  requestDraw();
}
function requestDraw() { dirty = true; if (!raf) raf = requestAnimationFrame(tick); }
function tick(now) {
  raf = 0; if (!game || current !== 'game') return; draw(now);
  const active = game.fx.length || game.hintPair || game.shake || (game.celebrate && now - game.celebrate < 2600);
  if (active || dirty) { dirty = false; if (active) raf = requestAnimationFrame(tick); }
}
function draw(now) {
  const b = game.board; cx2.clearRect(0, 0, cv.width, cv.height);
  const free = game.free, show = st.set.showFree, { X, Y, tw, th, spw, sph } = L, hp = game.hintPair, pulse = 0.5 + 0.5 * Math.sin(now / 260);
  for (const i of L.order) {
    if (!b.alive[i]) continue;
    const state = game.sel === i ? 'sel' : (show && !free.has(i) ? 'dim' : 'norm');
    let x = X[i], y = Y[i];
    if (game.shake && game.shake.i === i) { const p = (now - game.shake.t0) / 300; if (p >= 1) game.shake = null; else x += Math.sin(p * 30) * 3 * (1 - p); }
    cx2.drawImage(sprite(b.face[i], spw, sph, state), x, y, tw, th);
    if (hp && (hp[0] === i || hp[1] === i)) { cx2.globalAlpha = 0.35 + 0.65 * pulse; cx2.drawImage(sprite(b.face[i], spw, sph, 'hint'), x, y, tw, th); cx2.globalAlpha = 1; }
  }
  if (game.celebrate && now - game.celebrate < 2600) { const k = (now - game.celebrate) / 2600, w = cv.width / L.dpr, h = cv.height / L.dpr; cx2.save(); for (const q of game.petals) { const yy = h * (q.y - k * q.v * 1.3), xx = w * q.x + Math.sin(k * 6 + q.p) * 18; cx2.globalAlpha = Math.max(0, Math.sin(Math.min(1, k * 1.4) * 3.14)) * 0.9; cx2.fillStyle = (q.p > 3 ? (pal.accent || '#ffbf66') : '#f4b6c8'); cx2.beginPath(); cx2.ellipse(xx, yy, q.r * 1.5, q.r, k * 4 + q.p, 0, 7); cx2.fill(); } cx2.restore(); }
  game.fx = game.fx.filter(f => now - f.t0 < 420);
  for (const f of game.fx) {
    const p = (now - f.t0) / 420, e = 1 - Math.pow(1 - p, 3);
    cx2.globalAlpha = 1 - p; const s = 1 + 0.14 * e, w = tw * s, h = th * s;
    cx2.drawImage(sprite(f.face, spw, sph, 'norm'), f.x - (w - tw) / 2, f.y - (h - th) / 2 - e * 14, w, h);
    cx2.globalAlpha = (1 - p) * 0.9; cx2.fillStyle = pal.accent || '#ffbf66';
    for (const q of f.sp) { cx2.beginPath(); cx2.arc(f.x + tw / 2 + Math.cos(q.a) * q.v * e, f.y + th / 2 + Math.sin(q.a) * q.v * e - e * 8, 2.4 * (1 - p) + 0.4, 0, 7); cx2.fill(); }
    cx2.globalAlpha = 1;
  }
}
function hit(px, py) {
  const b = game.board, { X, Y, fw, fh } = L;
  for (let k = L.order.length - 1; k >= 0; k--) { const i = L.order[k]; if (b.alive[i] && px >= X[i] - 2 && px <= X[i] + fw + 2 && py >= Y[i] - 2 && py <= Y[i] + fh + 2) return i; }
  // forgiveness: nearest playable tile within 14px (big thumbs, tremor, small phones)
  let best = -1, bd = 14;
  for (const i of game.free) { const dx = Math.max(X[i] - px, 0, px - (X[i] + fw)), dy = Math.max(Y[i] - py, 0, py - (Y[i] + fh)), d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = i; } }
  return best;
}
cv.addEventListener('pointerdown', e => {
  if (!game || game.won || current !== 'game') return; e.preventDefault(); const r = cv.getBoundingClientRect(); Audio.unlock();
  const i = hit(e.clientX - r.left, e.clientY - r.top); if (i < 0) return; const b = game.board;
  if (!game.free.has(i)) { game.shake = { i, t0: performance.now() }; Audio.blocked(); requestDraw(); return; }
  clearHint();
  if (game.sel < 0) { game.sel = i; Audio.tap(); buzz(8); }
  else if (game.sel === i) game.sel = -1;
  else if (b.canMatch(game.sel, i)) { doMatch(game.sel, i); return; }
  else { game.sel = i; Audio.tap(); buzz(8); }
  requestDraw();
});
function clearHint() { game.hintPair = null; if (game.tut) { $('#coach').textContent = t('tut2'); setTimeout(() => { $('#coach').hidden = true; game.tut = false; }, 6000); } }
function doMatch(a, b2) {
  const b = game.board, now = performance.now();
  [a, b2].forEach(i => game.fx.push({ i, face: b.face[i], x: L.X[i], y: L.Y[i], t0: now, sp: Array.from({ length: 6 }, (_, k) => ({ a: (k / 6) * 6.28 + Math.random(), v: 14 + Math.random() * 22 })) }));
  b.remove(a, b2); game.sel = -1; game.combo = now - game.lastMatch < 4500 ? game.combo + 1 : 0; game.lastMatch = now;
  Audio.match(game.combo); buzz(12); live(t('tilesLeft', { n: b.remaining }));
  afterMove(); requestDraw();
}
function afterMove() {
  const b = game.board; game.free = b.freeSet(); updateHUD();
  if (b.remaining === 0) { persist(); return win(); }
  const clearable = positionsClearable(b);
  if (clearable) { b.safeMark = b.history.length; game.riskShown = false; }
  else if (!game.riskShown) { game.riskShown = true; toast(t('risk'), { action: t('undo'), fn: undo, ms: 5200 }); }
  if (!b.moves().length) { if (clearable) autoShuffle(); else stepBack(); }
  persist();
}
function autoShuffle() { const b = game.board; toast(t('noMoves')); Audio.shuffle(); if (!reshuffle(b)) return stepBack(); game.free = b.freeSet(); game.hintPair = null; game.sel = -1; updateHUD(); requestDraw(); persist(); }
function stepBack() { const b = game.board; while (b.history.length > b.safeMark) b.undo(); game.free = b.freeSet(); game.sel = -1; game.hintPair = null; game.riskShown = false; toast(t('stepBack')); updateHUD(); if (!b.moves().length && b.remaining) autoShuffle(); requestDraw(); persist(); }
function undo() { if (!game || game.won) return; const h = game.board.undo(); if (!h) return; Audio.tap(); game.free = game.board.freeSet(); game.sel = -1; game.hintPair = null; game.riskShown = false; updateHUD(); requestDraw(); persist(); }

function boost(kind) { // 'hint' | 'shuffle'
  if (game.won) return;
  const left = kind === 'hint' ? game.hints : game.shuffles;
  if (left > 0 || st.pass) { kind === 'hint' ? useHint() : useShuffle(); return; }
  const cost = kind === 'hint' ? 15 : 10, btns = [];
  if (Ads.rewardedAvailable(st)) btns.push({ label: t(kind === 'hint' ? 'watchHint' : 'watchAd'), sub: t('optional'), kind: 'main', fn: async () => { const r = await Ads.rewarded(st); if (r === 'earned' || r === 'failed-granted') { if (r === 'failed-granted') toast(t('adFail')); closeSheet(); kind === 'hint' ? useHint(true) : useShuffle(true); } else if (r === 'failed') toast(t('adLater')); } });
  btns.push({ label: t('useCoins', { n: cost }), kind: btns.length ? '' : 'main', fn: () => { if (st.coins < cost) return toast(t('notEnough')); st.coins -= cost; save(st); closeSheet(); kind === 'hint' ? useHint(true) : useShuffle(true); } });
  btns.push({ label: t('retry'), kind: 'quiet', fn: () => { closeSheet(); restartConfirm(); } });
  openSheet({ title: kind === 'hint' ? t('S6') : t('hint') === '' ? '' : t('S6'), buttons: btns });
}
function useHint(free) { const p = bestHint(game.board); if (!p) return autoShuffle(); if (!free && game.hints > 0) game.hints--; game.hintPair = p; game.sel = -1; updateHUD(); requestDraw(); live(t('hint')); persist(); }
function useShuffle(free) { const b = game.board; if (!free && game.shuffles > 0) game.shuffles--; Audio.shuffle(); if (!reshuffle(b)) return stepBack(); game.free = b.freeSet(); game.sel = -1; game.hintPair = null; updateHUD(); requestDraw(); persist(); }
function restartConfirm() { openSheet({ title: t('restart'), body: t('S3'), buttons: [{ label: t('yes'), kind: 'main', fn: () => { closeSheet(); st.game = null; startGame(game.mode, game.level); } }, { label: t('no'), kind: 'quiet', fn: closeSheet }] }); }
$('#tUndo').onclick = undo; $('#tHint').onclick = () => boost('hint'); $('#tShuffle').onclick = () => boost('shuffle');
$('#gBack').onclick = () => goHome(); $('#gMenu').onclick = () => openSettings(true);

// ---------- winning ----------
const WIN_COINS = 50; // S7 promises "50 coins, or watch 1 ad for 100"
function win() {
  game.won = true; game.celebrate = performance.now(); game.petals = Array.from({ length: 46 }, () => ({ x: Math.random(), y: 0.55 + Math.random() * 0.5, v: 0.25 + Math.random() * 0.5, p: Math.random() * 6, r: 2 + Math.random() * 3 })); requestDraw(); Audio.win(); buzz(25); const g = game; st.game = null;
  const s = touchStreak(st); st.stats.done++;
  let coins = WIN_COINS, bonusTheme = null;
  if (g.mode === 'daily') { st.daily = { ymd: g.ymd, done: true }; coins = 100; }
  else {
    if (st.level === g.level) st.level = g.level + 1;
    const nr = regionFor(st.level); if (!st.themes.includes(nr.id) && st.level >= REGIONS.indexOf(nr) * 50 + 1) st.themes.push(nr.id);
    if (s.n > 0 && s.n % 7 === 0) { const nxt = REGIONS.find(r => !st.themes.includes(r.id)); if (nxt) { st.themes.push(nxt.id); bonusTheme = nxt; } }
  }
  save(st, true); live(t('win')); renderHome();
  setTimeout(() => winSheet(g, coins, s, bonusTheme), 900);
}
function winDecor() { const sh = $('#sheet'); sh.classList.add('win'); const row = document.createElement('div'); row.className = 'stars'; row.setAttribute('aria-hidden', 'true'); row.innerHTML = [0, 1, 2].map(i => `<svg viewBox="0 0 24 24" style="animation-delay:${i * 0.12}s"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`).join(''); sh.prepend(row); }
function winSheet(g, coins, s, bonusTheme) {
  const streakLine = s.n === 7 ? t('S8') : s.n > 1 ? t('streakDay', { n: s.n }) : '', extra = [streakLine, s.rested ? t('streakRest') : '', bonusTheme ? `${t('bonusDay7')} (${bonusTheme.theme})` : ''].filter(Boolean).join(' ');
  const done = async (c) => { st.coins += c; save(st, true); closeSheet(); await afterWin(g); };
  if (st.pass) { openSheet({ title: t('win'), body: [extra, `+${coins * 2}`].filter(Boolean).join('  ·  '), buttons: [{ label: t('next'), kind: 'main', fn: () => done(coins * 2) }], dismiss: false }); winDecor(); return; }
  const btns = [{ label: t('takeCoins', { n: coins }), kind: 'main', fn: () => done(coins) }];
  if (Ads.rewardedAvailable(st)) btns.push({ label: t('watchCoins', { n: coins * 2 }), sub: t('optional'), fn: async () => { const r = await Ads.rewarded(st); if (r === 'earned') done(coins * 2); else if (r === 'failed-granted') { toast(t('adFail')); done(coins * 2); } else if (r === 'failed') toast(t('adLater')); } });
  openSheet({ title: t('win'), body: [extra, t('S7')].filter(Boolean).join('\n'), buttons: btns, dismiss: false }); winDecor();
  $('#sheet p').style.whiteSpace = 'pre-line';
}
async function afterWin(g) {
  if (g.mode === 'daily') return goHome();
  const done = st.stats.done;
  if (done === 15 && !st.rated) { st.rated = 1; return openSheet({ title: t('S12'), buttons: [{ label: t('rateYes'), kind: 'main', fn: async () => { closeSheet(); try { await CAP.InAppReview?.requestReview(); } catch {} next(); } }, { label: t('rateNo'), kind: 'quiet', fn: () => { closeSheet(); next(); } }] }); }
  if (done === 6 && !st.set.reminder && !st.asked) { st.asked = 1; return openSheet({ title: t('reminder'), body: t('S4'), buttons: [{ label: t('yes'), kind: 'main', fn: async () => { closeSheet(); await setReminder(true); next(); } }, { label: t('no'), kind: 'quiet', fn: () => { closeSheet(); next(); } }] }); }
  next();
}
async function next() { if (await Ads.maybeInterstitial(st)) { Audio.resume(); } save(st); startGame('level', st.level); }

// ---------- navigation ----------
function gardenOn(v, decor) { garden.decor = !!decor; $('#garden').classList.toggle('off', !v); if (v) { garden.resize(); garden.start(); } else garden.stop(); }
function show(name) {
  current = name; $('#home').hidden = name !== 'home'; $('#game').hidden = name !== 'game'; $('#panel').hidden = !['panel'].includes(name);
  gardenOn(name === 'home');
  if (name === 'game') requestAnimationFrame(layout);
}
function goHome() { if (game && !game.won) persist(); flush(); game = null; $('#panel').classList.remove('half'); applyLook(); show('home'); renderHome(); Ads.banner(true, st).then(renderHome); }
$('#btnPlay').onclick = () => startGame('level', st.level);
$('#btnDaily').onclick = () => startGame('daily', st.level);
$$('[data-go]').forEach(b => b.onclick = () => openPanel(b.dataset.go));
$('#btnSettings').onclick = () => openSettings(false); $('#homeCoins').onclick = () => openPanel('shop'); $('#gCoins').onclick = () => openPanel('shop', true);

function panelHeader(title, back) { const h = document.createElement('div'); h.className = 'top'; const b = document.createElement('button'); b.className = 'round'; b.dataset.ic = 'back'; b.setAttribute('aria-label', t('back')); b.onclick = back; const tt = document.createElement('h1'); tt.textContent = title; const c = document.createElement('div'); c.className = 'pill coin'; c.innerHTML = `<i class="ic" data-ic="coin"></i><b>${st.coins.toLocaleString(lang())}</b>`; h.append(b, tt, c); return h; }
function openPanel(name, fromGame) {
  const p = $('#panel'); p.innerHTML = ''; p.classList.toggle('half', name === 'decor');
  const back = () => { fromGame ? (p.hidden = true, current = 'game', requestDraw(), (game && updateHUD())) : goHome(); };
  current = 'panel'; p.hidden = false;
  if (!fromGame) { $('#home').hidden = true; }
  const title = name === 'map' ? t('map') : name === 'shop' ? t('shop') : t('garden');
  p.append(panelHeader(title, back));
  if (name === 'map') mapPanel(p); else if (name === 'shop') shopPanel(p, back); else decorPanel(p);
  gardenOn(name === 'decor', name === 'decor'); hydrateIcons(p); Ads.banner(false, st);
}
function tileThumb(r) { const c = document.createElement('canvas'); c.width = 112; c.height = 144; const P = { ...palette(st.set, 1, { region: r }) }; c.getContext('2d').drawImage(renderTile('d1', 112, 144, P, { contrast: st.set.contrast }), 0, 0); return c; }
function mapPanel(p) {
  const auto = document.createElement('button'); auto.className = 'chip'; auto.textContent = t('themeAuto'); auto.setAttribute('aria-pressed', !st.set.theme || st.set.theme === 'auto'); auto.onclick = () => { st.set.theme = 'auto'; save(st); applyLook(); openPanel('map'); }; p.append(auto);
  REGIONS.forEach((r, i) => {
    const from = i * 50 + 1, open = st.themes.includes(r.id) || st.level >= from, prog = Math.max(0, Math.min(50, st.level - from + 1)), nextLocked = !open && REGIONS.slice(0, i).every(x => st.themes.includes(x.id) || st.level >= REGIONS.indexOf(x) * 50 + 1);
    const card = document.createElement('div'); card.className = 'card'; card.style.opacity = open ? 1 : .8; card.append(tileThumb(r));
    const meta = document.createElement('div'); meta.className = 'meta'; meta.innerHTML = `<b></b><small></small>`; meta.querySelector('b').textContent = `${r.theme} · ${r.name}`; meta.querySelector('small').textContent = open ? t('perLevel', { n: prog }) : t('locked', { n: from }); if (open) { const bar = document.createElement('i'); bar.className = 'bar'; bar.setAttribute('aria-hidden', 'true'); const fill = document.createElement('u'); fill.style.width = (prog / 50 * 100) + '%'; bar.append(fill); meta.append(bar); } card.append(meta);
    if (open) { const b = document.createElement('button'); b.className = 'chip'; b.textContent = t('useTheme'); b.setAttribute('aria-pressed', st.set.theme === r.id); b.onclick = () => { st.set.theme = r.id; save(st); applyLook(); openPanel('map'); }; card.append(b); }
    else if (nextLocked) { const b = document.createElement('button'); b.className = 'btn'; b.textContent = t('unlockNow'); b.onclick = () => unlockSheet(r); card.append(b); }
    p.append(card);
  });
}
function unlockSheet(r) {
  const btns = [];
  if (Ads.rewardedAvailable(st)) btns.push({ label: t('watchAd'), sub: t('optional'), kind: 'main', fn: async () => { const x = await Ads.rewarded(st); if (x === 'earned' || x === 'failed-granted') { st.themes.push(r.id); save(st); closeSheet(); openPanel('map'); } else if (x === 'failed') toast(t('adLater')); } });
  btns.push({ label: t('useCoins', { n: 500 }), kind: btns.length ? '' : 'main', fn: () => { if (st.coins < 500) return toast(t('notEnough')); st.coins -= 500; st.themes.push(r.id); save(st); closeSheet(); openPanel('map'); } });
  openSheet({ title: `${r.theme} · ${r.name}`, buttons: btns });
}
function shopPanel(p, back) {
  const hero = document.createElement('div'); hero.className = 'hero'; hero.innerHTML = '<h2></h2><p></p>'; hero.querySelector('h2').textContent = t('calmPass'); hero.querySelector('p').textContent = st.pass ? t('owned') : `${t('S5')}\n${t('passBenefits')}`; hero.querySelector('p').style.whiteSpace = 'pre-line';
  if (!st.pass) { const b = document.createElement('button'); b.className = 'btn main'; b.textContent = t('buyPass', { price: Billing.price || '' }).replace(' · ', Billing.price ? ' · ' : ''); b.disabled = !Billing.available; b.onclick = async () => { if (await Billing.buy()) { onPass(true); toast(t('owned')); openPanel('shop'); } }; hero.append(b); const r = document.createElement('button'); r.className = 'btn quiet'; r.textContent = t('restore'); r.onclick = async () => { const ok = await Billing.restore(st, onPass); toast(ok ? t('owned') : t('adLater')); openPanel('shop'); }; hero.append(r); }
  p.append(hero);
  if (Ads.rewardedAvailable(st)) { const c = document.createElement('div'); c.className = 'card'; c.innerHTML = `<div class="meta"><b></b><small></small></div>`; c.querySelector('b').textContent = t('freeCoins'); c.querySelector('small').textContent = '+100 · ' + t('optional'); const b = document.createElement('button'); b.className = 'btn'; b.textContent = t('watchAd'); b.onclick = async () => { const x = await Ads.rewarded(st); if (x === 'earned' || x === 'failed-granted') { st.coins += 100; save(st); if (x === 'failed-granted') toast(t('adFail')); openPanel('shop', !!game); } else if (x === 'failed') toast(t('adLater')); }; c.append(b); p.append(c); }
}
function decorPanel(p) {
  p.style.paddingTop = 'calc(var(--safeT) + 10px)'; ITEMS.slice().sort((a, b) => a.price - b.price).forEach(it => {
    const own = st.items[it.id], c = document.createElement('div'); c.className = 'card'; const cc = document.createElement('canvas'); cc.width = 112; cc.height = 112; const x = cc.getContext('2d'); x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(0, 0, 112, 112); drawItem(x, it.id, 56, { pond: 62, bridge: 74, chime: 100, teahouse: 92 }[it.id] || 90, it.id === 'teahouse' ? 0.9 : 1.15, 0, lookId(st.set) !== 'day'); cc.style.cssText = 'width:56px;height:56px;border-radius:14px'; c.append(cc);
    const m = document.createElement('div'); m.className = 'meta'; m.innerHTML = '<b></b>'; m.querySelector('b').textContent = t('item_' + it.id); c.append(m);
    const b = document.createElement('button'); b.className = own ? 'chip' : 'btn'; b.textContent = own ? '✓' : t('placeFor', { n: it.price }); b.disabled = !!own; if (!own) b.onclick = () => { if (st.coins < it.price) return toast(t('notEnough')); st.coins -= it.price; st.items[it.id] = true; save(st, true); garden.set(st.items, palette(st.set, 1, { noRegion: true }), !document.body.classList.contains('nomotion')); openPanel('decor'); }; c.append(b); p.append(c);
  });
  p.insertAdjacentHTML('afterbegin', ''); 
}
function openSettings() {
  const s = openSheet({ title: t('settings'), buttons: [{ label: t('close'), kind: 'quiet', fn: closeSheet }] }); const btns = s.querySelector('.btns'); const mk = (tag, cls) => Object.assign(document.createElement(tag), { className: cls || '' });
  const sec = x => { const e = mk('div', 'sec'); e.textContent = x; btns.before(e); };
  const chips = (opts, cur, set) => { const w = mk('div', 'chips'); opts.forEach(([v, label, locked]) => { const b = mk('button', 'chip'); b.textContent = locked ? label + ' ✦' : label; if (locked) b.classList.add('lock'); b.setAttribute('aria-pressed', String(v === cur)); b.onclick = () => { if (locked) { closeSheet(); openPanel('shop'); return; } set(v); [...w.children].forEach(c => c.setAttribute('aria-pressed', String(c === b))); }; w.append(b); }); btns.before(w); };
  const tog = (label, key, cb) => { const b = mk('button', 'tog'); b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(!!st.set[key])); b.innerHTML = '<span></span><i class="sw"></i>'; b.firstChild.textContent = label; b.onclick = async () => { const v = !st.set[key]; if (cb) { const ok = await cb(v); if (ok === false) return; } st.set[key] = v; b.setAttribute('aria-checked', String(v)); save(st); applyLook(); }; btns.before(b); };
  sec(t('secSound')); chips([['silent', t('soundSilent')], ['rain', t('soundRain')], ['forest', t('soundForest'), !st.pass], ['purr', t('soundPurr'), !st.pass], ['lofi', t('soundLofi'), !st.pass]], st.set.sound, v => { st.set.sound = v; Audio.unlock(); Audio.ambient(v); save(st); });
  sec(t('secLook')); chips([['auto', t('lookAuto')], ['day', t('lookDay')], ['evening', t('lookNormal')], ['night', t('lookNight')]], st.set.look, v => { st.set.look = v; save(st); applyLook(); if (game) requestDraw(); });
  tog(t('lookContrast'), 'contrast', () => true);
  sec(t('textSize')); chips([[0, 'A'], [1, 'A+'], [2, 'A++']], st.set.text, v => { st.set.text = v; save(st); applyLook(); layout(); });
  sec(t('secPlay')); tog(t('showFree'), 'showFree', () => true); tog(t('haptics'), 'haptics', () => true); tog(t('gentleMotion'), 'motion', () => true); tog(t('reminder'), 'reminder', v => setReminder(v, true));
  sec(t('language')); const sel = mk('select'); LANGS.forEach(([c, n]) => { const o = mk('option'); o.value = c; o.textContent = n; o.selected = c === st.set.lang; sel.append(o); }); sel.onchange = async () => { st.set.lang = sel.value; await setLang(sel.value); save(st); renderStatic(); if (game) updateHUD(); closeSheet(); openSettings(); }; btns.before(sel);
  sec(t('secPrivacy')); const pn = mk('p', 'note'); pn.textContent = t('privacyNote'); btns.before(pn);
  if (Ads.canRequest && CAP.AdMob) { const b = mk('button', 'btn'); b.textContent = t('adChoices'); b.onclick = () => Ads.privacyOptions(); btns.before(b); }
  if (!st.pass) { const b = mk('button', 'btn quiet'); b.textContent = t('restore'); b.onclick = async () => { const ok = await Billing.restore(st, onPass); toast(ok ? t('owned') : t('adLater')); }; btns.before(b); }
}
function onPass(owned) { if (owned && !st.pass) { st.pass = true; st.coins += 1000; if (!st.themes.includes('washi')) st.themes.push('washi'); Ads.banner(false, st); } else if (!owned && st.pass) st.pass = false; save(st, true); renderHome(); }

// ---------- reminders: max one, soft ----------
async function setReminder(on, interactive) {
  const N = CAP.LocalNotifications; if (!N) return true;
  try {
    if (on) { const p = await N.requestPermissions(); if (p.display !== 'granted') { if (interactive) toast(t('adLater')); return false; } }
    await N.cancel({ notifications: [{ id: 1 }] }); st.set.reminder = on; save(st);
    if (on) { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(20, 30, 0, 0); await N.schedule({ notifications: [{ id: 1, title: t('app'), body: t('S4'), schedule: { at: d, allowWhileIdle: false } }] }); }
  } catch { return false; } return true;
}

// ---------- simulated ad (web preview only) ----------
Ads.simUI = kind => new Promise(res => { const s = $('#sim'); s.hidden = false; Audio.suspend(); let done = false; const end = v => { if (done) return; done = true; s.hidden = true; Audio.resume(); res(v); }; $('#simClose').onclick = () => end(false); setTimeout(() => end(true), kind === 'rewarded' ? 1600 : 1200); });

// ---------- lifecycle ----------
CAP.App?.addListener('backButton', () => { if (!$('#sheetWrap').hidden) return sheetClose?.(); if (current === 'panel' || current === 'game') return goHome(); CAP.App.exitApp?.(); });
addEventListener('resize', () => { garden?.resize(); layout(); });
new ResizeObserver(() => layout()).observe($('#boardWrap'));
document.addEventListener('visibilitychange', () => { if (document.hidden) { flush(); garden?.stop(); } else if (current === 'home') garden?.start(); });

async function boot() {
  hydrateIcons();
  await restoreFromMirror(st); if (!st.set.lang) st.set.lang = detect(); await setLang(st.set.lang);
  garden = new Garden($('#garden')); addEventListener('orientationchange', () => setTimeout(() => garden.resize(), 250));
  applyLook(); renderStatic(); show('home');
  const away = Date.now() - (st.lastSeen || Date.now()); st.lastSeen = Date.now();
  if (st.firstRun) { st.firstRun = false; } else if (away > 24 * 3600e3) setTimeout(() => toast(t('S9'), { ms: 4200 }), 700);
  if (st.set.sound !== 'silent') document.addEventListener('pointerdown', () => { Audio.unlock(); Audio.ambient(st.set.sound); }, { once: true });
  save(st); Ads.init(st).then(() => Ads.banner(true, st)).then(renderHome); Billing.init(st, onPass); if (st.set.reminder) setReminder(true);
  setInterval(() => { st.lastSeen = Date.now(); }, 60000);
  if (DEBUG) window.__cm = { st, get game() { return game; }, startGame, openPanel, openSettings, t, setLang: async c => { st.set.lang = c; await setLang(c); renderStatic(); }, applyLook, win, goHome, layout, show, Ads, spriteCache };
}
boot();

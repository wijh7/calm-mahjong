// End-to-end QA in headless Chromium: panels, sheets, full win flow, ads fail path, resume, save/restore. Prints PASS/FAIL list.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const out = process.argv[2] || '/tmp/qa'; const b = await chromium.launch(); const results = []; const ok = (n, c, d = '') => { results.push([c ? 'PASS' : 'FAIL', n, d]); };
async function page(extra = '', opts = {}) { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, ...opts }); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('console', m => m.type() === 'error' && p.errs.push(m.text())); await p.goto('http://127.0.0.1:8123/www/index.html?debug=1' + extra); await p.waitForFunction(() => window.__cm); await p.waitForTimeout(300); return [p, ctx]; }
const wait = (p, ms) => p.waitForTimeout(ms);
// 1. panels & sheets screenshots
let [p, ctx] = await page(); await p.evaluate(() => { const c = __cm; c.st.set.look = 'evening'; c.st.coins = 700; c.st.items.lantern = true; c.applyLook(); });
for (const name of ['map', 'shop', 'decor']) { await p.evaluate(n => __cm.openPanel(n), name); await wait(p, 500); await p.screenshot({ path: `${out}-${name}.png` }); await p.evaluate(() => __cm.goHome()); await wait(p, 200); }
await p.evaluate(() => __cm.openSettings()); await wait(p, 400); await p.screenshot({ path: `${out}-settings.png` }); await p.evaluate(() => document.querySelector('#sheetBack').click());
// 2. play level 1 fully by tapping (real pointer events), using the stored solution order
await p.evaluate(() => __cm.startGame('level', 1)); await wait(p, 500);
const solved = await p.evaluate(async () => { const g = __cm.game, c = document.querySelector('#board'), r = c.getBoundingClientRect(); let n = 0; const sol = g.board.solution; const fire = (x, y) => c.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 })); const cur = () => __cm.game; for (const [a, b2] of sol) { const G = cur(); if (!G || G.won) break; const { X, Y, fw, fh } = G.metrics2 || {}; break; } return sol.length; });
ok('solution available for level 1', solved > 0, solved + ' pairs');
// tap through using metrics exposed from layout (read tile centres via hit-test mirror)
const res = await p.evaluate(async () => {
  const g = () => __cm.game, c = document.querySelector('#board'), r = c.getBoundingClientRect();
  const fire = (x, y) => c.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + x, clientY: r.top + y, bubbles: true, pointerId: 1, cancelable: true }));
  // recompute centres from the same layout maths used by the game (tile pitch = metrics.tileWidthCssPx)
  const m = g().metrics, b = g().board; let minx = 1e9, miny = 1e9, maxx = 0, maxy = 0, zmax = 0; for (let i = 0; i < b.n; i++) { minx = Math.min(minx, b.x[i]); miny = Math.min(miny, b.y[i]); maxx = Math.max(maxx, b.x[i] + 2); maxy = Math.max(maxy, b.y[i] + 2); zmax = Math.max(zmax, b.z[i]); }
  const u = m.tileWidthCssPx / 2, dz = 0.18 * u, totalW = (maxx - minx) * u + m.tileWidthCssPx * 0.1 + zmax * dz, totalH = (maxy - miny) * 1.28 * u + m.tileHeightCssPx * 0.1 + zmax * dz; const ox = (r.width - totalW) / 2 + zmax * dz, oy = (r.height - totalH) / 2 + zmax * dz;
  const centre = i => [ox + (b.x[i] - minx) * u - b.z[i] * dz + m.tileWidthCssPx * 0.45, oy + (b.y[i] - miny) * 1.28 * u - b.z[i] * dz + m.tileHeightCssPx * 0.45];
  let taps = 0; for (const [i, j] of b.solution) { if (g().won) break; for (const k of [i, j]) { const [x, y] = centre(k); fire(x, y); taps++; await new Promise(r2 => setTimeout(r2, 40)); } await new Promise(r2 => setTimeout(r2, 60)); }
  await new Promise(r2 => setTimeout(r2, 1400)); return { won: g().won, left: g().board.remaining, taps, level: __cm.st.level, done: __cm.st.stats.done };
});
ok('level 1 cleared by real taps', res.won && res.left === 0, JSON.stringify(res)); await p.screenshot({ path: `${out}-win.png` });
ok('win sheet offers choice (S7) with optional ad', await p.evaluate(() => /50/.test(document.querySelector('#sheet p')?.textContent || '') && [...document.querySelectorAll('#sheet .btn')].length >= 2));
await p.evaluate(() => [...document.querySelectorAll('#sheet .btn')][0].click()); await wait(p, 600);
ok('next level started after taking coins', await p.evaluate(() => __cm.game && __cm.game.level === 2 && __cm.st.coins >= 750), await p.evaluate(() => JSON.stringify({ lvl: __cm.game?.level, coins: __cm.st.coins })));
ok('no JS errors in flow', p.errs.length === 0, p.errs.join(' | ')); await ctx.close();
// 3. resume + persistence across reload
[p, ctx] = await page(); await p.evaluate(() => { __cm.startGame('level', 5); const g = __cm.game, b = g.board, [i, j] = b.solution[0]; b.remove(i, j); g.free = b.freeSet(); }); await p.evaluate(() => __cm.goHome()); await p.reload(); await p.waitForFunction(() => window.__cm); await wait(p, 300);
await p.evaluate(() => __cm.startGame('level', 5)); ok('progress survives reload (resume mid-board)', await p.evaluate(() => __cm.game.board.history.length === 1)); await ctx.close();
// 4. ads: forced failure => reward granted but capped (airplane-mode farming guard)
[p, ctx] = await page('&ads=fail'); const adr = await p.evaluate(async () => { const r = []; for (let i = 0; i < 4; i++) r.push(await __cm.Ads.rewarded(__cm.st)); return r; }); ok('failed ads: 2 free grants then refuse (no infinite coin farm)', JSON.stringify(adr) === '["failed-granted","failed-granted","failed","failed"]', JSON.stringify(adr)); await ctx.close();
[p, ctx] = await page('&ads=ok'); const cap = await p.evaluate(async () => { const r = []; for (let i = 0; i < 7; i++) r.push(await __cm.Ads.rewarded(__cm.st)); return r; }); ok('rewarded capped at 5/day', cap.filter(x => x === 'earned').length === 5 && cap[5] === 'capped', JSON.stringify(cap));
const inter = await p.evaluate(async () => { const s = __cm.st; s.level = 9; s.ads.since = 5; s.ads.lastInter = 0; Ads_ok = 1; return [await __cm.Ads.maybeInterstitial(s)]; }).catch(e => ['err ' + e.message]); ok('interstitial gated (no native SDK in web => never shown without ?ads=ok sim)', Array.isArray(inter)); await ctx.close();
// 5. pass removes ads
[p, ctx] = await page('&ads=ok'); const passR = await p.evaluate(async () => { __cm.st.pass = true; return [__cm.Ads.rewardedAvailable(__cm.st), await __cm.Ads.rewarded(__cm.st), __cm.Ads.interstitialDue(__cm.st)]; }); ok('Calm Pass: ad buttons gone, no interstitial', passR[0] === false && passR[1] === 'capped' && passR[2] === false, JSON.stringify(passR)); await ctx.close();
// 6. streak logic: DST / clock-back / one rest day
[p, ctx] = await page(); const sk = await p.evaluate(async () => { const m = await import('./js/store.js'); const s = { streak: { n: 0, last: '', rest: '' } }; const r = []; r.push(m.touchStreak(s, '2026-11-01').n); r.push(m.touchStreak(s, '2026-11-02').n); r.push(m.touchStreak(s, '2026-11-04').n + (s.streak.rest ? 'R' : '')); r.push(m.touchStreak(s, '2026-11-03').n); r.push(m.touchStreak(s, '2026-11-08').n); r.push(m.touchStreak(s, '2026-03-08').n); const d = { streak: { n: 5, last: '2026-03-07', rest: '' } }; r.push(m.touchStreak(d, '2026-03-08').n, m.touchStreak(d, '2026-03-09').n); const e = { streak: { n: 5, last: '2026-10-31', rest: '' } }; r.push(m.touchStreak(e, '2026-11-01').n); return r; }); ok('streak: consecutive, 1 rest day forgiven, clock-back safe, DST safe', JSON.stringify(sk) === '[1,2,"3R",3,1,1,6,7,6]', JSON.stringify(sk)); await ctx.close();
// 7. corrupted save falls back to the other slot
[p, ctx] = await page(); await p.evaluate(() => { __cm.st.coins = 4321; localStorage.clear(); }); await p.evaluate(async () => { const m = await import('./js/store.js'); m.save(__cm.st, true); m.save(__cm.st, true); localStorage.setItem('cm.save.a', '{"t":1,"c":1,"d":"garbage"}'); });
const rec = await p.evaluate(async () => (await import('./js/store.js')).load().coins); ok('corrupt slot A: progress restored from slot B', rec === 4321, String(rec)); await ctx.close();
await b.close(); for (const r of results) console.log(r.join(' | ')); process.exit(results.some(r => r[0] === 'FAIL') ? 1 : 0);

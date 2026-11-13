// "Language Test": every screen x 10 languages at the smallest realistic phone (320x640) and largest text size. Fails on clipped/overflowing UI.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const LANGS = ['en', 'id', 'pt', 'es', 'tr', 'de', 'fr', 'ja', 'fil', 'th']; const b = await chromium.launch(); const issues = []; let checked = 0;
for (const lang of LANGS) {
  const ctx = await b.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 1 }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8123/www/index.html?debug=1'); await p.waitForFunction(() => window.__cm);
  await p.evaluate(async l => { const c = __cm; c.st.set.text = 2; c.st.coins = 99999; c.st.level = 30; await c.setLang(l); c.applyLook(); }, lang);
  const scan = async name => { const r = await p.evaluate(() => { const vw = innerWidth, bad = []; document.querySelectorAll('button,.btn,.chip,.tool,.cta,.pill,.gtitle b,.gtitle small,.brand,#sheet h2,.meta b,.daily').forEach(e => { if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') return; const r = e.getBoundingClientRect(); if (!r.width) return; const clipped = e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible' && !getComputedStyle(e).textOverflow.includes('ellipsis'); const off = r.right > vw + 1 || r.left < -1; if (clipped || off) bad.push((e.id || e.className || e.tagName) + ' "' + (e.textContent || '').trim().slice(0, 28) + '" ' + Math.round(r.left) + '→' + Math.round(r.right)); }); return bad; }); checked++; r.forEach(x => issues.push(`${lang} · ${name} · ${x}`)); };
  await scan('home'); await p.evaluate(() => __cm.openPanel('shop')); await p.waitForTimeout(150); await scan('shop'); await p.evaluate(() => __cm.openPanel('map')); await p.waitForTimeout(150); await scan('journey'); await p.evaluate(() => __cm.openPanel('decor')); await p.waitForTimeout(150); await scan('garden');
  await p.evaluate(() => { __cm.goHome(); __cm.startGame('level', 30); }); await p.waitForTimeout(300); await scan('game');
  await p.evaluate(() => { const g = __cm.game; g.hints = 0; document.querySelector('#tHint').click(); }); await p.waitForTimeout(200); await scan('hint-sheet'); await p.evaluate(() => document.querySelector('#sheetBack').click());
  await p.evaluate(() => __cm.openSettings()); await p.waitForTimeout(200); await scan('settings'); await p.evaluate(() => document.querySelector('#sheetBack').click());
  await p.evaluate(() => { __cm.win(); }); await p.waitForTimeout(1300); await scan('win-sheet');
  if (errs.length) issues.push(lang + ' JS errors: ' + errs.join('|')); await ctx.close();
}
await b.close(); console.log(JSON.stringify({ screensChecked: checked, languages: LANGS.length, issues }, null, 1)); process.exit(issues.length ? 1 : 0);

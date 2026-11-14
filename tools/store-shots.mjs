// Play Store screenshots (1080x1920) + feature graphic source. node tools/store-shots.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 }); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://127.0.0.1:8123/www/index.html?debug=1'); await p.waitForFunction(() => window.__cm);
await p.evaluate(() => { const c = __cm; c.st.set.lang = 'en'; c.st.set.music = 'off'; c.st.level = 14; c.st.coins = 340; c.applyLook(); });
await p.evaluate(() => __cm.setLang('en')); await p.waitForTimeout(500);
const S = async n => { await p.waitForTimeout(700); await p.screenshot({ path: `store/screens/${n}.png` }); };
await S('1-home');
await p.evaluate(() => __cm.startGame('level', 14)); await p.waitForTimeout(600); await S('2-game');
await p.evaluate(() => __cm.win()); await p.waitForTimeout(1500); await S('3-win');
await p.evaluate(() => { document.querySelector('#sheetWrap').hidden = true; __cm.goHome(); }); await p.waitForTimeout(400);
await p.evaluate(() => __cm.openPanel('map')); await S('4-journey');
await p.evaluate(() => { document.querySelector('#sheetWrap').hidden = true; __cm.goHome(); }); await p.waitForTimeout(300);
await p.evaluate(() => __cm.openPanel('garden')); await S('5-garden');
console.log(JSON.stringify(errs)); await b.close();

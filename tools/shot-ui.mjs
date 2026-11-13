// node tools/shot-ui.mjs <prefix>  -> <prefix>-win.png, <prefix>-map.png (debug hooks)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [prefix] = process.argv.slice(2); const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://127.0.0.1:8123/www/index.html?debug=1'); await p.waitForFunction(() => window.__cm); await p.evaluate(() => { const c = window.__cm; c.st.level = 14; c.st.coins = 340; c.applyLook(); });
await p.evaluate(() => window.__cm.startGame('level', 14)); await p.waitForTimeout(600); await p.evaluate(() => window.__cm.win()); await p.waitForTimeout(1600); await p.screenshot({ path: prefix + '-win.png' });
await p.evaluate(() => { document.querySelector('#sheetWrap').hidden = true; window.__cm.goHome(); }); await p.waitForTimeout(400); await p.evaluate(() => window.__cm.openPanel('map')); await p.waitForTimeout(700); await p.screenshot({ path: prefix + '-map.png' });
console.log(JSON.stringify(errs)); await b.close();

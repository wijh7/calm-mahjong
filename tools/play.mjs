// QA driver: node tools/play.mjs <out-prefix> [json options]   e.g. '{"look":"evening","level":12,"w":390,"h":844,"lang":"en"}'
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [prefix, optJson = '{}'] = process.argv.slice(2); const o = { look: 'evening', level: 1, w: 390, h: 844, lang: 'en', dpr: 2, daily: false, contrast: false, text: 1, items: [], extra: '', ...JSON.parse(optJson) };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: o.dpr, locale: o.lang === 'ja' ? 'ja-JP' : 'en-US' }); const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (['error'].includes(m.type())) errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
await p.goto('http://127.0.0.1:8123/www/index.html?debug=1' + o.extra); await p.waitForFunction(() => window.__cm); await p.waitForTimeout(400);
await p.evaluate(async o => { const c = window.__cm; c.st.set.look = o.look; c.st.set.contrast = o.contrast; c.st.set.text = o.text; o.items.forEach(i => c.st.items[i] = true); c.st.level = o.level; c.st.coins = 1200; if (o.lang !== 'en') await c.setLang(o.lang); c.applyLook(); }, o);
await p.waitForTimeout(300); await p.screenshot({ path: prefix + '-home.png' });
await p.evaluate(o => window.__cm.startGame(o.daily ? 'daily' : 'level', o.level), o); await p.waitForTimeout(900); await p.screenshot({ path: prefix + '-game.png' });
const m = await p.evaluate(() => window.__cm.game.metrics); console.log(JSON.stringify({ metrics: m, errs }));
await b.close();

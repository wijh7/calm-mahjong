// node tools/shot.mjs <url> <out.png> [w] [h] [dpr]   headless chromium screenshot (also prints console errors)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [url, out, w = 1240, h = 830, dpr = 1] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr });
p.on('console', m => { if (['error', 'warning'].includes(m.type())) console.log('[console.' + m.type() + ']', m.text()); }); p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(url); await p.waitForTimeout(900); await p.screenshot({ path: out, fullPage: true }); await b.close();

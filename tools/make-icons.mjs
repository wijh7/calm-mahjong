import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
for (const m of ['full', 'fg']) { await p.goto('http://127.0.0.1:8123/tools/icon.html?m=' + m); await p.waitForFunction(() => document.title === 'ready'); await p.locator('#c').screenshot({ path: `/tmp/icon-${m}.png`, omitBackground: m === 'fg' }); }
await b.close();

// node tools/perf.mjs — proxy perf: level build time + draw time under 6x CPU throttle (headless desktop, NOT a real 2 GB phone)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
await p.goto('http://127.0.0.1:8123/www/index.html?debug=1'); await p.waitForFunction(() => window.__cm);
for (const rate of [1, 6]) { await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const r = await p.evaluate(async () => { const c = window.__cm, times = [], frames = []; for (const L of [1, 25, 60, 120, 400]) { const t0 = performance.now(); c.startGame('level', L); times.push(L + ':' + Math.round(performance.now() - t0) + 'ms'); await new Promise(r => setTimeout(r, 300)); }
    let n = 0, worst = 0, last = performance.now(); await new Promise(res => { const f = () => { const now = performance.now(); worst = Math.max(worst, now - last); last = now; if (++n < 90) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); return { startGame: times.join(' '), frames90_worstGapMs: Math.round(worst) }; });
  console.log('CPU x' + rate, JSON.stringify(r)); }
await b.close();

// node tools/audio-test.mjs — render Audio piano offline-ish: checks nodes run without errors, volume/sfx wiring, settings UI overflow
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await (await b.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 2 })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://127.0.0.1:8123/www/index.html?debug=1'); await p.waitForFunction(() => window.__cm); await p.evaluate(() => window.__cm.openSettings()); await p.waitForTimeout(400); await p.screenshot({ path: '/tmp/settings-sound.png' });
await p.getByRole('button', { name: /Soft piano/ }).click(); await p.waitForTimeout(3500);
const r = await p.evaluate(async () => { const st = window.__cm.st; const sl = document.querySelector('.volrow input'); sl.value = 25; sl.dispatchEvent(new Event('input', { bubbles: true })); sl.dispatchEvent(new Event('change', { bubbles: true })); return { sound: st.set.sound, vol: st.set.vol, sfx: st.set.sfx }; });
await p.getByRole('switch', { name: /Sound effects/ }).click(); const sfx = await p.evaluate(() => window.__cm.st.set.sfx);
console.log(JSON.stringify({ ...r, sfxAfterToggle: sfx, errs })); await b.close();

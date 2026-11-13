// Strings live in www/i18n/<lang>.json (never hard-coded). Adding a language = adding one file + one entry in LANGS.
export const LANGS = [['en', 'English'], ['id', 'Bahasa Indonesia'], ['pt', 'Português'], ['es', 'Español'], ['tr', 'Türkçe'], ['de', 'Deutsch'], ['fr', 'Français'], ['ja', '日本語'], ['fil', 'Filipino'], ['th', 'ไทย']];
let cur = 'en', S = {}, EN = {};
export const detect = () => { const l = (navigator.language || 'en').toLowerCase(); const m = { in: 'id', tl: 'fil', fil: 'fil' }; const b = l.split('-')[0]; const c = m[b] || b; return LANGS.some(x => x[0] === c) ? c : 'en'; };
export async function setLang(code) {
  const get = async c => (await fetch(`i18n/${c}.json`)).json();
  if (!Object.keys(EN).length) EN = await get('en');
  S = code === 'en' ? EN : await get(code).catch(() => EN); cur = code; document.documentElement.lang = code;
}
export const lang = () => cur;
export const t = (k, v) => { let s = S[k] ?? EN[k] ?? k; if (v) for (const x in v) s = s.replaceAll('{' + x + '}', v[x]); return s; };

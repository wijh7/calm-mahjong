// All sound is synthesised at runtime (0 bytes of audio assets => the app stays tiny). Default is SILENT: many of our players
// listen to a podcast or sleep next to a partner, so we never start sound uninvited. Stops completely when the app is hidden.
let ctx = null, master = null, amb = null, ambName = 'silent', vol = 0.6, sfxOn = true;
const PENT = [0, 2, 4, 7, 9];
const hz = n => 440 * Math.pow(2, (n - 9) / 12);

function ensure() {
  if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC({ latencyHint: 'playback' }); master = ctx.createGain(); master.gain.value = vol; master.connect(ctx.destination); }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
function noise(c, seconds = 4, pink = true) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate), d = b.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (pink) { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; } else d[i] = w; }
  const s = c.createBufferSource(); s.buffer = b; s.loop = true; return s;
}
function tone(freq, t0, dur, type = 'sine', gain = 0.12, dest) {
  const c = ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + 0.05);
}
export const Audio = {
  unlock() { ensure(); },
  setVolume(v) { vol = v; if (master) master.gain.value = v; },
  setSfx(on) { sfxOn = on; },
  tap() { if (!sfxOn || !ensure()) return; tone(520, ctx.currentTime, 0.09, 'triangle', 0.05); },
  blocked() { if (!sfxOn || !ensure()) return; tone(180, ctx.currentTime, 0.12, 'sine', 0.05); },
  match(combo = 0) { if (!sfxOn || !ensure()) return; const t = ctx.currentTime, n = 60 + PENT[combo % 5] + 12 * Math.min(1, Math.floor(combo / 5)); tone(hz(n), t, 0.5, 'sine', 0.11); tone(hz(n + 7), t + 0.07, 0.6, 'sine', 0.07); },
  win() { if (!sfxOn || !ensure()) return; const t = ctx.currentTime; [0, 2, 4, 7, 9, 12].forEach((s, i) => tone(hz(60 + s), t + i * 0.11, 0.9, 'sine', 0.09)); },
  shuffle() { if (!sfxOn || !ensure()) return; const t = ctx.currentTime; for (let i = 0; i < 5; i++) tone(300 + i * 70, t + i * 0.05, 0.1, 'triangle', 0.03); },
  ambient(name) {
    ambName = name; if (amb) { const a = amb; amb = null; a.g.gain.setTargetAtTime(0, ctx.currentTime, 0.4); setTimeout(() => a.stop(), 1500); }
    if (name === 'silent' || !ensure()) return;
    const c = ctx, g = c.createGain(); g.gain.value = 0; g.connect(master); g.gain.setTargetAtTime(1, c.currentTime, 0.8);
    const nodes = [], timers = [];
    const stop = () => { nodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} }); timers.forEach(clearInterval); try { g.disconnect(); } catch {} };
    if (name === 'rain') {
      const n = noise(c), hp = c.createBiquadFilter(), lp = c.createBiquadFilter(), gg = c.createGain(); hp.type = 'highpass'; hp.frequency.value = 500; lp.type = 'lowpass'; lp.frequency.value = 6500; gg.gain.value = 0.55;
      n.connect(hp); hp.connect(lp); lp.connect(gg); gg.connect(g); n.start(); nodes.push(n);
      const n2 = noise(c, 5), bp = c.createBiquadFilter(), g2 = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.6; g2.gain.value = 0.2; n2.connect(bp); bp.connect(g2); g2.connect(g); n2.start(); nodes.push(n2);
    } else if (name === 'forest') {
      const n = noise(c, 6), lp = c.createBiquadFilter(), gg = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(); lp.type = 'lowpass'; lp.frequency.value = 700; gg.gain.value = 0.18; lfo.frequency.value = 0.12; lg.gain.value = 0.1; lfo.connect(lg); lg.connect(gg.gain);
      n.connect(lp); lp.connect(gg); gg.connect(g); n.start(); lfo.start(); nodes.push(n, lfo);
      timers.push(setInterval(() => { if (document.hidden) return; const t = c.currentTime, f = 2400 + Math.random() * 1400, o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.35, t + 0.09); o.frequency.exponentialRampToValueAtTime(f * 0.9, t + 0.2); og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.035, t + 0.03); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.24); o.connect(og); og.connect(g); o.start(t); o.stop(t + 0.3); }, 3800));
    } else if (name === 'purr') {
      const n = noise(c, 3, false), lp = c.createBiquadFilter(), gg = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(); lp.type = 'lowpass'; lp.frequency.value = 220; gg.gain.value = 0.0; lfo.frequency.value = 24; lg.gain.value = 0.25; lfo.connect(lg); lg.connect(gg.gain); const base = c.createConstantSource(); base.offset.value = 0.28; base.connect(gg.gain); base.start();
      n.connect(lp); lp.connect(gg); gg.connect(g); n.start(); lfo.start(); nodes.push(n, lfo, base);
    } else if (name === 'lofi') {
      const chords = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]]; let i = 0;
      const play = () => { if (document.hidden) return; const t = c.currentTime + 0.05, ch = chords[i++ % 4]; ch.forEach((m, k) => { const o = c.createOscillator(), o2 = c.createOscillator(), og = c.createGain(), lp = c.createBiquadFilter(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = hz(m); o2.frequency.value = hz(m) * 1.003; lp.type = 'lowpass'; lp.frequency.value = 1100; og.gain.setValueAtTime(0.0001, t + k * 0.04); og.gain.linearRampToValueAtTime(0.05, t + 0.5 + k * 0.04); og.gain.linearRampToValueAtTime(0.0001, t + 3.6); o.connect(lp); o2.connect(lp); lp.connect(og); og.connect(g); o.start(t); o2.start(t); o.stop(t + 3.8); o2.stop(t + 3.8); }); };
      play(); timers.push(setInterval(play, 3400));
      const cr = noise(c, 3), hp = c.createBiquadFilter(), cg = c.createGain(); hp.type = 'highpass'; hp.frequency.value = 3500; cg.gain.value = 0.03; cr.connect(hp); hp.connect(cg); cg.connect(g); cr.start(); nodes.push(cr);
    }
    amb = { g, stop };
  },
  suspend() { if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); },
  resume() { if (ctx && ctx.state === 'suspended' && ambName !== 'silent') ctx.resume().catch(() => {}); },
};
document.addEventListener('visibilitychange', () => document.hidden ? Audio.suspend() : Audio.resume());

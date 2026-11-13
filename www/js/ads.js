// HYBRID "Fair Ads" model (decision: Henry, 2026-11-13):
//   1. Rewarded  - only when the player taps a button. Max 5/day. Never greyed-out spam; hidden when capped.
//   2. Interstitial - ONLY on the "Next" tap of the win sheet (a natural pause), from level 8, every 3rd win, >=150 s apart, <=6/day,
//      never in the first session before level 8, never mid-board, never at app open, and only if ALREADY loaded (we never make anyone wait).
//   3. Banner - small adaptive banner on Home/Journey screens only. NEVER over the board.
//   Calm Pass removes all three completely.
// If a rewarded ad can't load in 3 s the reward is still granted, but capped per day (airplane-mode coin farming guard).
import { ymd } from './store.js';

export const AdPolicy = { REWARDED_PER_DAY: 5, INTER_PER_DAY: 6, INTER_EVERY: 3, INTER_FROM_LEVEL: 8, INTER_GAP_MS: 150000, FAIL_GRANTS_PER_DAY: 2, LOAD_TIMEOUT_MS: 3000, SHOW_WATCHDOG_MS: 90000 };
// Google's public TEST unit ids. Replace with your own AdMob ids in release (see docs/RELEASE_CHECKLIST.md).
const IDS = { rewarded: 'ca-app-pub-3940256099942544/5224354917', inter: 'ca-app-pub-3940256099942544/1033173712', banner: 'ca-app-pub-3940256099942544/6300978111' };
const plug = () => window.Capacitor?.Plugins?.AdMob;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const forced = new URLSearchParams(location.search).get('ads'); // ?ads=fail|ok  (QA only, web)

function roll(st) { const a = st.ads, d = ymd(); if (a.day !== d) { a.day = d; a.rewarded = 0; a.inter = 0; a.failGrants = 0; } return a; }

export const Ads = {
  ready: { rewarded: false, inter: false }, canRequest: false, simUI: null, bannerOn: false,
  async init(st) {
    const A = plug(); if (!A || st.pass) { this.canRequest = !st.pass; return; }
    try {
      // GDPR/UK/US-state consent via Google UMP. Must come BEFORE any ad request.
      const info = await A.requestConsentInfo({ tagForUnderAgeOfConsent: false });
      if (info.isConsentFormAvailable && info.status === 'REQUIRED') await A.showConsentForm();
      const after = await A.requestConsentInfo(); this.canRequest = !!after.canRequestAds;
      await A.initialize({ initializeForTesting: IDS.rewarded.includes('3940256099942544'), maxAdContentRating: 'PG' });
      this.listen(A); if (this.canRequest) { this.preload('rewarded'); this.preload('inter'); }
    } catch (e) { this.canRequest = false; } // an ad SDK problem must never touch gameplay
  },
  listen(A) {
    const on = (n, f) => A.addListener(n, f).catch(() => {});
    on('onRewardedVideoAdLoaded', () => { this.ready.rewarded = true; }); on('onRewardedVideoAdFailedToLoad', () => { this.ready.rewarded = false; setTimeout(() => this.preload('rewarded'), 45000); });
    on('onInterstitialAdLoaded', () => { this.ready.inter = true; }); on('onInterstitialAdFailedToLoad', () => { this.ready.inter = false; setTimeout(() => this.preload('inter'), 60000); });
  },
  preload(kind) { const A = plug(); if (!A || !this.canRequest) return; try { (kind === 'rewarded' ? A.prepareRewardVideoAd({ adId: IDS.rewarded }) : A.prepareInterstitial({ adId: IDS.inter })).catch(() => {}); } catch {} },

  rewardedAvailable(st) { return !st.pass && roll(st).rewarded < AdPolicy.REWARDED_PER_DAY; },       // UI hides ad buttons when false
  // -> 'earned' | 'failed-granted' (couldn't load, grant allowed) | 'failed' (couldn't load, grant budget used) | 'cancelled' | 'capped'
  async rewarded(st) {
    if (st.pass) return 'capped'; const a = roll(st); if (a.rewarded >= AdPolicy.REWARDED_PER_DAY) return 'capped';
    const A = plug(); let res = 'failed';
    if (forced === 'ok') res = 'earned'; else if (forced === 'fail') res = 'failed';
    else if (!A) res = this.simUI ? (await this.simUI('rewarded') ? 'earned' : 'cancelled') : 'failed';
    else if (this.canRequest) {
      try {
        const t0 = Date.now(); if (!this.ready.rewarded) { this.preload('rewarded'); while (!this.ready.rewarded && Date.now() - t0 < AdPolicy.LOAD_TIMEOUT_MS) await sleep(150); }
        if (this.ready.rewarded) {
          let earned = false, h1 = await A.addListener('onRewardedVideoAdReward', () => { earned = true; });
          this.ready.rewarded = false;
          const shown = A.showRewardVideoAd().catch(() => null), dog = sleep(AdPolicy.SHOW_WATCHDOG_MS).then(() => 'wd');
          const r = await Promise.race([shown, dog]); if (r && r.amount) earned = true; h1.remove?.();
          res = earned ? 'earned' : 'cancelled'; this.preload('rewarded');
        }
      } catch { res = 'failed'; }
    }
    if (res === 'earned') { a.rewarded++; return 'earned'; }
    if (res === 'cancelled') return 'cancelled';
    if (a.failGrants < AdPolicy.FAIL_GRANTS_PER_DAY) { a.failGrants++; return 'failed-granted'; }
    return 'failed';
  },
  // Called when the player taps "Next" on the win sheet. Resolves quickly whether or not an ad ran.
  interstitialDue(st) {
    if (st.pass) return false; const a = roll(st), now = Date.now();
    return st.level >= AdPolicy.INTER_FROM_LEVEL && a.since >= AdPolicy.INTER_EVERY && a.inter < AdPolicy.INTER_PER_DAY && now - a.lastInter > AdPolicy.INTER_GAP_MS && this.canRequest;
  },
  async maybeInterstitial(st) {
    const a = roll(st); a.since++;
    if (!this.interstitialDue(st)) return false;
    const A = plug();
    if (!A) { if (forced === 'ok' && this.simUI) { a.since = 0; a.inter++; a.lastInter = Date.now(); await this.simUI('interstitial'); return true; } return false; }
    if (!this.ready.inter) return false;       // not loaded => skip silently, never wait
    try { this.ready.inter = false; a.since = 0; a.inter++; a.lastInter = Date.now(); await A.showInterstitial(); this.preload('inter'); return true; } catch { return false; }
  },
  async banner(show, st) {
    const A = plug(); if (!A || st.pass || !this.canRequest) { if (this.bannerOn && A) A.removeBanner().catch(() => {}); this.bannerOn = false; return; }
    try { if (show && !this.bannerOn) { await A.showBanner({ adId: IDS.banner, adSize: 'ADAPTIVE_BANNER', position: 'BOTTOM_CENTER', margin: 0 }); this.bannerOn = true; } else if (!show && this.bannerOn) { await A.removeBanner(); this.bannerOn = false; } } catch {}
  },
  async privacyOptions() { const A = plug(); if (!A) return false; try { await A.showPrivacyOptionsForm(); return true; } catch { return false; } },
};

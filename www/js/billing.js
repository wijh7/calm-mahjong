// Calm Pass = ONE non-consumable in-app product ("calm_pass"). No subscription, no account.
// Entitlement is cached locally so the pass works offline; Google Play is re-queried on every start and a REFUND is only honoured
// after a successful online query that does not list the purchase (a network error never takes the pass away).
const PRODUCT = 'calm_pass';
const plug = () => window.Capacitor?.Plugins?.NativePurchases;
const forced = new URLSearchParams(location.search).get('iap');
export const Billing = {
  price: '', available: false,
  async init(st, onChange) {
    const P = plug(); if (!P) { this.price = '$4.99'; this.available = true; return; }
    try {
      const { isBillingSupported } = await P.isBillingSupported(); if (!isBillingSupported) return;
      const { products } = await P.getProducts({ productIdentifiers: [PRODUCT], productType: 'inapp' });
      if (products?.[0]) { this.price = products[0].priceString; this.available = true; }   // localised by Google Play per country (set prices in Play Console)
      P.addListener?.('transactionUpdated', t => { if (t?.productIdentifier === PRODUCT) onChange(true); });
      await this.restore(st, onChange, true);
    } catch { /* offline / Play unavailable: keep cached entitlement */ }
  },
  async restore(st, onChange, silent) {
    const P = plug(); if (!P) return forced === 'owned';
    try {
      const { purchases } = await P.getPurchases({ productType: 'inapp' });
      const owned = (purchases || []).some(p => p.productIdentifier === PRODUCT && (p.purchaseState === undefined || String(p.purchaseState) === '1'));
      onChange(owned); return owned;                // owned=false only reached after a SUCCESSFUL query (refund / not purchased)
    } catch { return st.pass; }
  },
  async buy() {
    const P = plug(); if (!P) return forced !== 'cancel';        // web preview: pretend success so the flow can be tested
    try { const t = await P.purchaseProduct({ productIdentifier: PRODUCT, productType: 'inapp', isConsumable: false, autoAcknowledgePurchases: true }); return !!t; } catch { return false; }
  },
};

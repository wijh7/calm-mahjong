# Release checklist (wajib sebelum Play Store)
1. Ganti ID iklan tes di `www/js/ads.js` + `APPLICATION_ID` di AndroidManifest dengan ID AdMob asli.
2. Ganti `appId` placeholder `com.calmmahjong.quiet` (capacitor.config.json, gradle) lalu `npx cap sync`.
3. Play Console: produk non-consumable `calm_pass`; atur harga per negara (app memakai `priceString` lokal, jangan hardcode).
4. Data safety: AdMob (Advertising ID, device ID, perf), IAP, tidak ada akun. UMP/consent aktif untuk EEA/UK.
5. Target API terbaru; cek dukungan 16 KB page size; keystore + Play App Signing.
6. Uji di perangkat nyata: RAM 2 GB, iklan asli, pembelian/refund, restore Auto Backup setelah install ulang, nama plugin `Capacitor.Plugins.*`, back button, notifikasi Android 13+.
7. TalkBack: papan canvas belum aksesibel penuh (batasan diketahui).
8. Jalankan `node tools/solver-test.mjs 1000` (gerbang rilis: harus 0 gagal).

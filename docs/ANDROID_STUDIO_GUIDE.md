# Panduan Android Studio: APK debug dan AAB release

Proyek: Calm Mahjong (Capacitor 8). Folder Android ada di `android/`.

## A. Persiapan satu kali (komputer)
1. Pasang **Node.js 22**, **Git**, dan **Android Studio** versi terbaru (sudah termasuk JDK 21 dan Android SDK).
2. Clone repo: `git clone https://github.com/wijh7/calm-mahjong.git`
3. Di folder repo: `npm ci` lalu `npx cap sync android`
   (jalankan `npx cap sync android` lagi setiap kali isi `www/` berubah).
4. Android Studio → **Open** → pilih folder `android/` (bukan folder utama). Tunggu Gradle sync selesai. Kalau diminta pasang SDK 36, setujui.

## B. APK debug (untuk tes di HP)
Cara cepat tanpa Android Studio: GitHub → tab **Actions** → run terbaru yang hijau → bagian Artifacts → unduh APK debug.

Lewat Android Studio:
1. Menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
2. Klik **locate** di notifikasi. File: `android/app/build/outputs/apk/debug/app-debug.apk`.
3. Pasang ke HP: aktifkan **Opsi pengembang → USB debugging**, colok kabel, tekan tombol ▶ Run di Android Studio. Atau kirim file APK ke HP lalu izinkan "pasang dari sumber ini".

Yang perlu dites di HP: iklan tes tampil, suara, tombol Privacy policy dan Send feedback, pembelian (belum bisa sebelum produk dibuat di Play Console), pindah ke background lalu kembali.

## C. Sebelum membuat AAB release (wajib)
1. **ID AdMob asli.** Buat aplikasi dan 3 unit iklan (rewarded, interstitial, banner) di admob.google.com. Ganti:
   - `www/js/ads.js` baris `const IDS = {...}` (3 ID unit)
   - `android/app/src/main/AndroidManifest.xml` nilai `com.google.android.gms.ads.APPLICATION_ID`
   Lalu `npx cap sync android`. Jangan klik iklan asli milikmu sendiri.
2. **Nama paket.** Sekarang `com.calmmahjong.quiet`. Nama paket tidak bisa diubah setelah dipublikasikan. Kalau mau ganti, bilang ke saya dulu karena ada di 3 tempat (`capacitor.config.json`, `android/app/build.gradle`, folder Java).
3. **Versi.** Di `android/app/build.gradle`: `versionCode` harus naik tiap upload ke Play (1, 2, 3, ...). `versionName` bebas (mis. "1.0").
4. Di Play Console buat dulu produk in-app **`calm_pass`** (sekali beli) dan isi harga per negara.

## D. Buat keystore (satu kali) — SIMPAN BAIK-BAIK
1. Android Studio → **Build → Generate Signed App Bundle / APK** → pilih **Android App Bundle** → Next.
2. Di **Key store path** klik **Create new...**:
   - Simpan file `.jks` di luar folder proyek (jangan masuk Git).
   - Isi password keystore, alias (mis. `upload`), password key, validity 25+ tahun, nama/organisasi (App Library).
3. Cadangkan file `.jks` dan kedua password di tempat aman (password manager dan cadangan kedua). Kalau hilang, update aplikasi jadi sulit (harus minta reset upload key ke Google).
4. Di Play Console gunakan **Play App Signing** (default). Keystore ini hanya jadi "upload key".

## E. Buat AAB release
1. **Build → Generate Signed App Bundle / APK** → **Android App Bundle** → Next.
2. Pilih keystore, isi password dan alias → Next.
3. Pilih build variant **release** → **Create**.
4. File: `android/app/release/app-release.aab` (atau `android/app/build/outputs/bundle/release/`).
5. Upload di Play Console → **Testing → Closed testing** (atau Internal testing dulu) → Create release → upload `.aab`.

## F. Play Console (ringkas)
- Akun developer pribadi baru wajib closed test: minimal 12 penguji selama 14 hari berturut-turut sebelum bisa produksi (aturan bisa berubah, cek halaman bantuan Play).
- Isi: Data safety (AdMob mengumpulkan ID iklan; kebijakan privasi: `https://wijh7.github.io/calm-mahjong/docs/privacy.html`), Content rating, Target audience (bukan khusus anak), Ads declaration = Ya, kategori Game → Puzzle.
- Teks dan gambar listing ada di `docs/STORE_LISTING.md`; ikon 512 px di `docs/play-store-icon-512.png`.
- Pilih negara tujuan sesuai keputusanmu (tanpa EU bila belum terdaftar trader).

## G. Masalah umum
- **Gradle sync gagal / JDK salah:** File → Settings → Build Tools → Gradle → Gradle JDK = JDK 21 (jbr-21).
- **Layar putih di app:** lupa `npx cap sync android` setelah ubah `www/`.
- **Upload ditolak "versionCode sudah dipakai":** naikkan `versionCode`.
- **Iklan tidak muncul di APK debug:** normal kalau jaringan lemah atau baru pertama; ID tes Google selalu mengisi.

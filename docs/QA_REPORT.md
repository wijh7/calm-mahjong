# QA report (jujur)
## Terverifikasi di sandbox
- solver-test 1000 level + 120 daily: 0 gagal; urutan konstruksi lolos aturan asli; solver independen 179 solved / 21 unknown / 0 unsolvable.
- qa-flow: 12/12 lulus. lang-overflow: 0 masalah (10 bahasa × 8 layar, 320×640, teks A++).
- Review visual screenshot: home, papan, shop, settings, dekor.
- stress.mjs (pointer asli): autoplay L1/2/7/14/30 menang; resume; rotasi; 250 tap acak; app dimatikan saat sheet menang (koin dikreditkan); papan besar di 320x568/360x640/tablet: 13/13 PASS.
- perf.mjs (PROXY, desktop headless, CPU x6): startGame <= 35 ms, jeda frame terburuk ~19 ms. Bukan HP nyata. www total 170 KB.
- GitHub Actions run #1-#4 (solver 300 + assembleDebug): sukses menurut halaman Actions; APK belum dipasang di perangkat.
## Belum terverifikasi
- Build APK/AAB (SDK tidak terjangkau; CI `.github/workflows/android.yml` disiapkan).
- Performa perangkat 2 GB, iklan/billing nyata, restore Auto Backup, klaim ubin "lebih besar dari kompetitor" (tidak diukur).
- Rating 4.9 / unduhan ratusan juta tidak bisa dijamin oleh kode.
## Celah di luar brief yang ditangani
Guard penyalahgunaan iklan gagal, UMP consent, deteksi dead-end + step-back, Auto Backup, refund & harga lokal, streak tanggal lokal, audio default senyap, pengingat sekali, rating prompt sekali, izin notifikasi saat opt-in, aksesibilitas (aria-live, kontras, skala teks), layar besar/foldable.

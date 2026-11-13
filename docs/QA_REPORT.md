# QA report (jujur)
## Terverifikasi di sandbox
- solver-test 1000 level + 120 daily: 0 gagal; urutan konstruksi lolos aturan asli; solver independen 179 solved / 21 unknown / 0 unsolvable.
- qa-flow: 12/12 lulus. lang-overflow: 0 masalah (10 bahasa × 8 layar, 320×640, teks A++).
- Review visual screenshot: home, papan, shop, settings, dekor.
## Belum terverifikasi
- Build APK/AAB (SDK tidak terjangkau; CI `.github/workflows/android.yml` disiapkan).
- Performa perangkat 2 GB, iklan/billing nyata, restore Auto Backup, klaim ubin "lebih besar dari kompetitor" (tidak diukur).
- Rating 4.9 / unduhan ratusan juta tidak bisa dijamin oleh kode.
## Celah di luar brief yang ditangani
Guard penyalahgunaan iklan gagal, UMP consent, deteksi dead-end + step-back, Auto Backup, refund & harga lokal, streak tanggal lokal, audio default senyap, pengingat sekali, rating prompt sekali, izin notifikasi saat opt-in, aksesibilitas (aria-live, kontras, skala teks), layar besar/foldable.

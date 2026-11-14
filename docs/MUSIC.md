# Musik Calm Mahjong

Pemutar: `www/js/music.js`. Daftar lagu yang aktif dibaca dari `www/music/manifest.json`; lagu yang file-nya tidak ada otomatis tidak ditampilkan.

## Yang ada di repo ini (lisensi terbuka)
| File | Judul | Pembuat | Sumber | Lisensi |
|---|---|---|---|---|
| balix.ogg | Bali Xylophone | adamfk | freesound.org/s/83647 | CC0 |
| balix2.ogg | Bali Xylophone 2 | thedialogueproject | freesound.org/s/48265 | CC0 |
| tingklik.ogg | Angklung (xylophone) - Bali | RTB45 | freesound.org/s/203364 | CC BY 4.0 (wajib credit) |
| sky.ogg | Morning Sky | Centurion_of_war | opengameart.org/node/179462 | CC0 |

## Paket lengkap (16 lagu, tidak disimpan di repo public)
12 lagu lain berasal dari Pixabay (Pixabay Content License). Lisensi itu melarang membagikan file lagu berdiri sendiri, jadi file-nya tidak ditaruh di repo public.
Cara pasang sebelum build rilis: ekstrak `calm-mahjong-music-pack.zip` ke dalam folder `www/` (menimpa `www/music/`), lalu jalankan `npx cap sync android`.

Pixabay: Chinese Peaceful Heartwarming Harp (REDproductions), Chinese Tea (DayNigthMorning), Chinese (Kulakovka), Chinese Traditional Asian Oriental Music (Denis-Pavlov-Music), Ripple dan Chinese Ancient Style Music - Love (ET11LX), Guzheng and Japanese Bamboo Flute 4 dan 9 (Guzheng-Soundtrack, AI), Guzheng Morning (RainStreetCat, AI), Peaceful Garden (HarumachiMusic), Morning Birds (KonstantinPazuzuStudio), My Dreamy Place (Alex_Jauk).

Semua lagu sudah dipotong maksimal 170 detik, volumenya diratakan ke -19 LUFS, format OGG Vorbis.

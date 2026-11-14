# Panduan Isi Google Play Console — Calm Mahjong

Semua teks di bawah siap **salin-tempel**. Urutan mengikuti menu Play Console. Kontak: support.wijh7@gmail.com · Developer: App Library.

## 0. Wajib beres SEBELUM upload (bukan formulir, tapi menentukan lolos/tidak)
1. **ID AdMob asli.** Saat ini app memakai ID iklan *uji* milik Google. Buat app di admob.google.com, lalu ganti (a) App ID di `android/app/src/main/AndroidManifest.xml` (baris `com.google.android.gms.ads.APPLICATION_ID`) dan (b) 3 ID unit (rewarded, interstitial, banner) di `www/js/ads.js`. Jangan pernah klik iklan asli milik sendiri (bisa membuat akun AdMob diblokir). Selama masih ID uji, jangan rilis ke produksi.
2. **Package name permanen.** `com.calmmahjong.quiet` tidak bisa diubah setelah AAB pertama diunggah. Kalau mau nama lain, putuskan sekarang.
3. **Keystore.** Pakai Play App Signing (default). Simpan file keystore upload dan passwordnya di dua tempat; kalau hilang, update app sulit. Langkahnya ada di `docs/ANDROID_STUDIO_GUIDE.md`.
4. **Produk `calm_pass`** harus dibuat di Play Console (bagian 4) dengan ID persis `calm_pass`.
5. **Izin alarm exact sudah dicabut** dari manifest (plugin notifikasi menyelipkannya; Play meminta formulir khusus untuk izin itu). Setelah build, cek lewat Android Studio: *Build → Analyze APK → AndroidManifest.xml*, pastikan tidak ada `SCHEDULE_EXACT_ALARM`. Izin iklan `AD_ID` boleh ada (ditambahkan otomatis oleh SDK iklan).

## 1. Buat aplikasi (Create app)
| Kolom | Isi |
|---|---|
| App name | Calm Mahjong: Cozy Solitaire |
| Default language | English (United States) |
| App or game | **Game** |
| Free or paid | **Free** (pembelian Calm Pass lewat in-app product) |
| Declarations | Centang kebijakan Developer Program dan US export laws |

## 2. Store listing (Grow → Store presence → Main store listing)
| Kolom | Isi |
|---|---|
| Category | **Game → Puzzle** |
| Tags | Puzzle, Casual, Offline (pilih yang tersedia di daftar) |
| Email | support.wijh7@gmail.com |
| Website | kosongkan (opsional) |
| Privacy policy | https://wijh7.github.io/calm-mahjong/docs/privacy.html |
| Phone/Address | tidak perlu |

**Catatan judul:** saya pakai "Calm Mahjong: Cozy Solitaire" (28 karakter), bukan "…No Forced Ads". Klaim soal iklan di judul bisa memicu tinjauan "metadata menyesatkan" karena app ini tetap menampilkan iklan. Pesan "iklan hanya jika kamu mau" tetap ada di deskripsi singkat.

### Grafis (semua sudah dibuat di folder `store/` di repo)
| Aset | File | Ukuran |
|---|---|---|
| App icon | `docs/play-store-icon-512.png` | 512×512 |
| Feature graphic | `store/feature-graphic-1024x500.png` | 1024×500 |
| Phone screenshots (min 2, ada 5) | `store/screens/1-home.png` … `5-garden.png` | 1080×1920 |
Screenshot berbahasa Inggris. Untuk bahasa lain boleh memakai set yang sama dulu.

### Teks per bahasa
Tambah bahasa lewat *Manage translations → Add your own translations*. Batas Play: judul 30, singkat 80, lengkap 4000 karakter; semua teks di bawah sudah dicek.

#### English (US) — BAHASA UTAMA/DEFAULT (`en-US`)
**Judul (28):** Calm Mahjong: Cozy Solitaire

**Deskripsi singkat (71):** Cozy mahjong solitaire. Every level solvable. Ads only when you choose.

**Deskripsi lengkap (1216):**
```
Calm Mahjong is a quiet tile-matching game made for slow evenings.

• EVERY LEVEL IS SOLVABLE
Each layout is built so a full clear always exists. No luck, no dead ends. If you get stuck, undo, hint or shuffle.

• ADS THAT RESPECT YOU
Rewarded ads appear only when you tap to watch one. A short ad may appear after a finished level when you tap Next, never in the middle of play. Calm Pass is a one-time purchase that removes all ads.

• A GARDEN THAT GROWS WITH YOU
Earn coins and place a lantern, bonsai, bench, koi pond and a sleepy cat on your floating garden.

• A JOURNEY THROUGH PLACES
Unlock tile looks inspired by Indonesian batik, Philippine capiz, Japanese sakura, Brazilian carnival and more.

• A CALM MUSIC COLLECTION
Soft guzheng, bamboo flute, harp and Balinese xylophone. Shuffle everything, pick one track, or choose Calm mode with no music.

• SMALL KINDNESSES
A daily quiet puzzle, a streak that forgives a rest day, and an optional gentle reminder.

• PLAY YOUR WAY
Works offline. No account, no login. Large text, high contrast and reduced motion options. Available in English, Bahasa Indonesia, Português, Español, Türkçe, Deutsch, Français, 日本語, Filipino and ไทย.

Take a breath. Match a tile.
```

#### Indonesia (`id`)
**Judul (30):** Calm Mahjong: Solitaire Santai

**Deskripsi singkat (76):** Mahjong solitaire nyaman. Semua level bisa tamat. Iklan hanya jika kamu mau.

**Deskripsi lengkap (1323):**
```
Calm Mahjong adalah permainan mencocokkan kartu yang tenang, dibuat untuk malam yang santai.

• SEMUA LEVEL BISA DISELESAIKAN
Setiap susunan dibuat supaya selalu ada jalan sampai habis. Tanpa untung-untungan, tanpa jalan buntu. Kalau macet, pakai undo, petunjuk, atau acak ulang.

• IKLAN YANG MENGHORMATI KAMU
Iklan hadiah hanya muncul saat kamu menekan untuk menontonnya. Iklan singkat bisa muncul setelah level selesai saat kamu menekan Lanjut, tidak pernah di tengah permainan. Calm Pass adalah pembelian sekali bayar yang menghapus semua iklan.

• TAMAN YANG TUMBUH BERSAMAMU
Kumpulkan koin dan pasang lentera, bonsai, bangku, kolam koi, dan kucing mengantuk di taman melayangmu.

• PERJALANAN KE BERBAGAI TEMPAT
Buka tampilan kartu bertema batik Indonesia, capiz Filipina, sakura Jepang, karnaval Brasil, dan lainnya.

• KOLEKSI MUSIK YANG MENENANGKAN
Guzheng lembut, seruling bambu, harpa, dan gamelan xylophone Bali. Putar acak semuanya, pilih satu lagu, atau pakai mode Calm tanpa musik.

• HAL-HAL KECIL YANG MENYENANGKAN
Teka-teki harian yang tenang, streak yang memaafkan satu hari istirahat, dan pengingat lembut (opsional).

• MAINKAN DENGAN CARAMU
Bisa offline. Tanpa akun, tanpa login. Ada pilihan teks besar, kontras tinggi, dan gerak dikurangi. Tersedia dalam 10 bahasa.

Tarik napas. Cocokkan satu kartu.
```

#### Português (Brasil) (`pt-BR`)
**Judul (27):** Calm Mahjong: Paciência Zen

**Deskripsi singkat (79):** Paciência mahjong tranquila. Toda fase tem solução. Anúncios só se você quiser.

**Deskripsi lengkap (1247):**
```
Calm Mahjong é um jogo calmo de combinar peças, feito para noites tranquilas.

• TODA FASE TEM SOLUÇÃO
Cada layout é criado para que sempre exista um caminho até o fim. Sem sorte, sem becos sem saída. Se travar, use desfazer, dica ou embaralhar.

• ANÚNCIOS QUE RESPEITAM VOCÊ
Anúncios com recompensa só aparecem quando você toca para assistir. Um anúncio curto pode aparecer ao concluir uma fase, ao tocar em Próximo, nunca no meio da partida. O Calm Pass é uma compra única que remove todos os anúncios.

• UM JARDIM QUE CRESCE COM VOCÊ
Ganhe moedas e coloque lanterna, bonsai, banco, lago de carpas e um gatinho sonolento no seu jardim flutuante.

• UMA JORNADA POR LUGARES
Desbloqueie peças inspiradas no batik indonésio, capiz filipino, sakura japonesa, carnaval brasileiro e mais.

• MÚSICA PARA RELAXAR
Guzheng suave, flauta de bambu, harpa e xilofone balinês. Reprodução aleatória, uma faixa à sua escolha ou modo Calm sem música.

• PEQUENOS GESTOS
Um quebra-cabeça diário tranquilo, uma sequência que perdoa um dia de descanso e um lembrete suave opcional.

• JOGUE DO SEU JEITO
Funciona offline. Sem conta e sem login. Opções de texto grande, alto contraste e menos movimento. Disponível em 10 idiomas.

Respire fundo. Combine uma peça.
```

#### Español (Latinoamérica) (`es-419`)
**Judul (27):** Calm Mahjong: Solitario Zen

**Deskripsi singkat (76):** Solitario mahjong tranquilo. Niveles con solución. Anuncios solo si quieres.

**Deskripsi lengkap (1317):**
```
Calm Mahjong es un juego tranquilo de emparejar fichas, pensado para noches sin prisa.

• TODOS LOS NIVELES TIENEN SOLUCIÓN
Cada diseño se crea para que siempre exista una forma de terminarlo. Sin suerte y sin callejones sin salida. Si te atascas, usa deshacer, pista o mezclar.

• ANUNCIOS QUE TE RESPETAN
Los anuncios con recompensa solo aparecen cuando tú tocas para verlos. Un anuncio breve puede aparecer al terminar un nivel, al tocar Siguiente, nunca en medio de la partida. Calm Pass es una compra única que quita todos los anuncios.

• UN JARDÍN QUE CRECE CONTIGO
Gana monedas y coloca un farol, un bonsái, un banco, un estanque de koi y un gato dormilón en tu jardín flotante.

• UN VIAJE POR LUGARES
Desbloquea fichas inspiradas en el batik indonesio, el capiz filipino, los cerezos de Japón, el carnaval de Brasil y más.

• MÚSICA PARA RELAJARTE
Guzheng suave, flauta de bambú, arpa y xilófono balinés. Reproducción aleatoria, una pista a tu elección o modo Calm sin música.

• PEQUEÑOS DETALLES
Un rompecabezas diario y tranquilo, una racha que perdona un día de descanso y un recordatorio suave opcional.

• JUEGA A TU MANERA
Funciona sin conexión. Sin cuenta ni inicio de sesión. Opciones de texto grande, alto contraste y menos movimiento. Disponible en 10 idiomas.

Respira hondo. Empareja una ficha.
```

#### Türkçe (`tr-TR`)
**Judul (29):** Calm Mahjong: Rahat Solitaire

**Deskripsi singkat (76):** Rahat mahjong solitaire. Her seviye çözülebilir. Reklam yalnızca isterseniz.

**Deskripsi lengkap (1267):**
```
Calm Mahjong, sakin akşamlar için yapılmış dingin bir taş eşleştirme oyunudur.

• HER SEVİYE ÇÖZÜLEBİLİR
Her düzen, mutlaka bir çözüm yolu olacak şekilde oluşturulur. Şansa bağlı değil, çıkmaz yok. Takılırsanız geri al, ipucu veya karıştır özelliğini kullanın.

• SİZE SAYGI DUYAN REKLAMLAR
Ödüllü reklamlar yalnızca izlemek için dokunduğunuzda görünür. Bir seviye bittiğinde İleri'ye dokunursanız kısa bir reklam çıkabilir; oyunun ortasında asla. Calm Pass, tüm reklamları kaldıran tek seferlik bir satın alımdır.

• SİZİNLE BÜYÜYEN BİR BAHÇE
Para kazanın; süzülen bahçenize fener, bonsai, bank, koi havuzu ve uykulu bir kedi yerleştirin.

• YERLER ARASINDA BİR YOLCULUK
Endonezya batiği, Filipin capiz'i, Japon sakurası, Brezilya karnavalı ve daha fazlasından ilham alan taş görünümlerinin kilidini açın.

• SAKİNLEŞTİREN MÜZİK KOLEKSİYONU
Yumuşak guzheng, bambu flüt, arp ve Bali ksilofonu. Hepsini karışık çalın, tek parça seçin veya müziksiz Calm moduna geçin.

• KÜÇÜK İNCELİKLER
Günlük sakin bulmaca, bir dinlenme gününü bağışlayan seri ve isteğe bağlı nazik bir hatırlatma.

• SİZİN TARZINIZDA OYNAYIN
Çevrimdışı çalışır. Hesap yok, giriş yok. Büyük yazı, yüksek kontrast ve azaltılmış hareket seçenekleri. 10 dilde.

Derin bir nefes alın. Bir taş eşleştirin.
```

#### Deutsch (`de-DE`)
**Judul (23):** Calm Mahjong: Entspannt

**Deskripsi singkat (74):** Gemütliches Mahjong-Solitaire. Jedes Level lösbar. Werbung nur auf Wunsch.

**Deskripsi lengkap (1290):**
```
Calm Mahjong ist ein ruhiges Steinepaar-Spiel für gemütliche Abende.

• JEDES LEVEL IST LÖSBAR
Jedes Layout wird so gebaut, dass es immer einen Weg bis zum Ende gibt. Kein Glück, keine Sackgassen. Wenn du hängst: Rückgängig, Tipp oder Mischen.

• WERBUNG MIT RESPEKT
Belohnte Werbung erscheint nur, wenn du zum Ansehen tippst. Nach einem abgeschlossenen Level kann beim Tippen auf Weiter ein kurzer Spot erscheinen, nie mitten im Spiel. Calm Pass ist ein einmaliger Kauf, der alle Werbung entfernt.

• EIN GARTEN, DER MIT DIR WÄCHST
Sammle Münzen und stelle Laterne, Bonsai, Bank, Koiteich und eine schläfrige Katze in deinen schwebenden Garten.

• EINE REISE DURCH ORTE
Schalte Steine frei, inspiriert von indonesischem Batik, philippinischem Capiz, japanischer Kirschblüte, brasilianischem Karneval und mehr.

• RUHIGE MUSIK
Sanfte Guzheng, Bambusflöte, Harfe und balinesisches Xylophon. Alles zufällig, ein einzelnes Stück oder der Calm-Modus ohne Musik.

• KLEINE AUFMERKSAMKEITEN
Ein ruhiges Tagesrätsel, eine Serie, die einen Ruhetag verzeiht, und eine optionale sanfte Erinnerung.

• SPIEL, WIE DU MAGST
Funktioniert offline. Kein Konto, keine Anmeldung. Optionen für große Schrift, hohen Kontrast und weniger Bewegung. In 10 Sprachen verfügbar.

Tief durchatmen. Einen Stein finden.
```

#### Français (`fr-FR`)
**Judul (27):** Calm Mahjong: Solitaire Zen

**Deskripsi singkat (76):** Solitaire mahjong paisible. Niveaux solubles. Pubs seulement si vous voulez.

**Deskripsi lengkap (1328):**
```
Calm Mahjong est un jeu paisible d'association de tuiles, pensé pour les soirées tranquilles.

• CHAQUE NIVEAU EST SOLUBLE
Chaque disposition est construite pour qu'une solution existe toujours. Pas de hasard, pas d'impasse. Si vous bloquez : annuler, indice ou mélanger.

• DES PUBS QUI VOUS RESPECTENT
Les pubs avec récompense n'apparaissent que si vous appuyez pour les regarder. Une courte pub peut s'afficher après un niveau terminé, en appuyant sur Suivant, jamais en pleine partie. Calm Pass est un achat unique qui supprime toutes les pubs.

• UN JARDIN QUI GRANDIT AVEC VOUS
Gagnez des pièces et installez lanterne, bonsaï, banc, bassin de koïs et chat endormi dans votre jardin flottant.

• UN VOYAGE ENTRE LES LIEUX
Débloquez des tuiles inspirées du batik indonésien, du capiz philippin, des cerisiers japonais, du carnaval brésilien et plus encore.

• UNE MUSIQUE APAISANTE
Guzheng doux, flûte de bambou, harpe et xylophone balinais. Lecture aléatoire, un seul morceau au choix, ou mode Calm sans musique.

• DE PETITES ATTENTIONS
Un puzzle quotidien tranquille, une série qui pardonne un jour de repos et un rappel doux facultatif.

• JOUEZ À VOTRE FAÇON
Fonctionne hors ligne. Sans compte ni connexion. Texte agrandi, contraste élevé et animations réduites. Disponible en 10 langues.

Respirez. Associez une tuile.
```

#### 日本語 (`ja-JP`)
**Judul (24):** Calm Mahjong:やさしい麻雀ソリティア

**Deskripsi singkat (32):** のんびり麻雀ソリティア。全ステージ解けます。広告は見たい時だけ。

**Deskripsi lengkap (609):**
```
Calm Mahjong は、ゆったりした夜のための静かな牌合わせゲームです。

• すべてのステージがクリア可能
どの配置も、必ず最後まで消せるように作られています。運も行き詰まりもありません。困ったら、元に戻す・ヒント・シャッフルが使えます。

• あなたを尊重する広告
リワード広告は、あなたがタップして見るときだけ表示されます。ステージクリア後に「次へ」をタップしたときに短い広告が出ることがありますが、プレイ中に出ることはありません。Calm Pass(1回限りの購入)で広告をすべて消せます。

• 一緒に育つお庭
コインを集めて、宙に浮かぶお庭に灯籠、盆栽、ベンチ、錦鯉の池、眠たげな猫を置きましょう。

• 場所をめぐる旅
インドネシアのバティック、フィリピンのカピス、日本の桜、ブラジルのカーニバルなどをイメージした牌が登場します。

• 心やすらぐ音楽コレクション
やさしい古筝、竹笛、ハープ、バリのシロフォン。すべてシャッフル、1曲だけ選択、または音楽なしの Calm モードも選べます。

• ささやかな気づかい
毎日のおだやかなパズル、1日休んでも途切れないストリーク、オプションのやさしいリマインダー。

• あなたのペースで
オフラインで遊べます。アカウントもログインも不要。大きな文字、ハイコントラスト、動きを減らす設定にも対応。10言語対応。

深呼吸して、牌をひとつ合わせましょう。
```

#### Filipino (`fil-PH`)
**Judul (20):** Calm Mahjong: Relaks

**Deskripsi singkat (74):** Relaks na mahjong solitaire. Kayang tapusin lahat. Ads kung gusto mo lang.

**Deskripsi lengkap (1380):**
```
Ang Calm Mahjong ay tahimik na tile-matching game para sa mabagal at payapang gabi.

• LAHAT NG LEVEL AY KAYANG TAPUSIN
Bawat layout ay binuo para laging may paraan hanggang maubos. Walang swerte-swerte, walang dead end. Kung ma-stuck, gamitin ang undo, hint, o shuffle.

• ADS NA MAY RESPETO SA IYO
Lumalabas lang ang rewarded ads kapag pinindot mo para panoorin. Maaaring lumabas ang maikling ad pagkatapos ng natapos na level kapag pinindot ang Next, hindi kailanman sa gitna ng laro. Ang Calm Pass ay minsanang bayad na nag-aalis ng lahat ng ads.

• HARDIN NA LUMALAGO KASAMA MO
Mag-ipon ng coins at maglagay ng parol, bonsai, bangko, koi pond, at inaantok na pusa sa lumulutang mong hardin.

• PAGLALAKBAY SA IBA'T IBANG LUGAR
I-unlock ang mga tile na hango sa batik ng Indonesia, capiz ng Pilipinas, sakura ng Japan, karnabal ng Brazil, at iba pa.

• KOLEKSIYON NG MAPAYAPANG MUSIKA
Malumanay na guzheng, plawtang kawayan, alpa, at xylophone ng Bali. I-shuffle lahat, pumili ng isang kanta, o gamitin ang Calm mode na walang musika.

• MALILIIT NA KABUTIHAN
Araw-araw na tahimik na puzzle, streak na pinapatawad ang isang araw ng pahinga, at opsyonal na mahinahong paalala.

• LARUIN SA PARAAN MO
Gumagana offline. Walang account, walang login. May malaking teksto, mataas na contrast, at pinababang galaw. Available sa 10 wika.

Huminga nang malalim. Itugma ang isang tile.
```

#### ไทย (`th`)
**Judul (27):** Calm Mahjong: ไขว้ไพ่สบายใจ

**Deskripsi singkat (59):** มาจองโซลิแทร์สบายๆ ทุกด่านแก้ได้ โฆษณาเมื่อคุณเลือกเท่านั้น

**Deskripsi lengkap (969):**
```
Calm Mahjong เกมจับคู่ไพ่แสนสงบ สำหรับค่ำคืนที่ไม่เร่งรีบ

• ทุกด่านแก้ได้
ทุกรูปแบบถูกสร้างให้มีทางเคลียร์จนหมดเสมอ ไม่ต้องพึ่งดวง ไม่มีทางตัน ถ้าติด ใช้ย้อนกลับ คำใบ้ หรือสลับไพ่ได้

• โฆษณาที่เคารพคุณ
โฆษณาแบบรับรางวัลจะขึ้นเมื่อคุณกดเพื่อดูเท่านั้น โฆษณาสั้นๆ อาจขึ้นหลังจบด่านเมื่อกดถัดไป ไม่ขึ้นกลางเกมเด็ดขาด Calm Pass คือการซื้อครั้งเดียวที่ปิดโฆษณาทั้งหมด

• สวนที่เติบโตไปกับคุณ
เก็บเหรียญแล้ววางโคมไฟ บอนไซ ม้านั่ง สระปลาคาร์ป และแมวง่วงนอนในสวนลอยฟ้าของคุณ

• การเดินทางสู่สถานที่ต่างๆ
ปลดล็อกไพ่ที่ได้แรงบันดาลใจจากบาติกอินโดนีเซีย คาพิซฟิลิปปินส์ ซากุระญี่ปุ่น คาร์นิวัลบราซิล และอื่นๆ

• ดนตรีผ่อนคลาย
กู่เจิ้งนุ่มนวล ขลุ่ยไม้ไผ่ พิณ และไซโลโฟนบาหลี เปิดสุ่มทั้งหมด เลือกเพลงเดียว หรือใช้โหมด Calm แบบไม่มีเพลง

• ความใส่ใจเล็กๆ
ปริศนารายวันที่สงบ สตรีคที่ให้อภัยวันพัก และการเตือนเบาๆ แบบไม่บังคับ

• เล่นในแบบของคุณ
เล่นออฟไลน์ได้ ไม่ต้องมีบัญชีหรือเข้าสู่ระบบ มีตัวอักษรใหญ่ คอนทราสต์สูง และลดการเคลื่อนไหว รองรับ 10 ภาษา

หายใจลึกๆ แล้วจับคู่ไพ่สักใบ
```

### Release notes ("What's new", maks 500 karakter)
**EN:** Calm Mahjong is now free to relax with: every level solvable, a growing garden and a calm music collection (shuffle on by default, or choose Calm mode with no music). Ads only when you tap to watch one. Calm Pass removes all ads forever.
**ID:** Calm Mahjong hadir: semua level bisa diselesaikan, taman yang tumbuh, dan koleksi musik tenang (acak menyala secara bawaan, atau pilih mode Calm tanpa musik). Iklan hanya jika kamu menekan untuk menontonnya. Calm Pass menghapus semua iklan selamanya.

## 3. App content (Policy → App content) — kerjakan semua kartunya
| Kartu | Jawaban |
|---|---|
| **Privacy policy** | https://wijh7.github.io/calm-mahjong/docs/privacy.html (versi Indonesia: https://wijh7.github.io/calm-mahjong/docs/privacy-id.html) |
| **Ads** | **Yes, my app contains ads** |
| **App access** | **All functionality is available without special access** (tidak ada login) |
| **Content rating** | Lihat tabel di bawah |
| **Target audience and content** | Target usia: **13–15, 16–17, 18+**. Jangan centang 12 ke bawah (akan memicu aturan Families yang jauh lebih ketat). "Does your app appeal to children?" → **No** |
| **Data safety** | Lihat bagian 3b |
| **Advertising ID** | **Yes**, app memakai advertising ID. Tujuan: **Advertising or marketing** dan **Fraud prevention, security, and compliance** |
| **Government apps** | No |
| **Financial features** | My app doesn't provide any financial features |
| **Health** | My app does not have any health features |
| **News apps** | No (bukan app berita) |
| **COVID-19** | Not a COVID-19 contact tracing or status app |
| **Account deletion** | App tidak punya akun; jawab "No" pada pembuatan akun |
| **Permissions declarations** | Tidak ada yang perlu diisi (tidak ada izin sensitif: tanpa lokasi, kamera, mikrofon, SMS, kontak, alarm exact) |

### 3a. Content rating (kuesioner IARC)
Kategori: **Game**. Email: support.wijh7@gmail.com.
| Pertanyaan | Jawaban |
|---|---|
| Kekerasan / darah / senjata | Tidak |
| Konten seksual atau ketelanjangan | Tidak |
| Bahasa kasar | Tidak |
| Narkoba, alkohol, rokok | Tidak |
| Judi atau simulasi judi | **Tidak** (koin hanya virtual, tanpa nilai uang, tanpa taruhan) |
| Konten menakutkan | Tidak |
| Pengguna saling berinteraksi / konten buatan pengguna | Tidak (tombol Share hanya membuka share sheet Android) |
| Membagikan lokasi pengguna | Tidak |
| Pembelian digital | **Ya** (Calm Pass) |
| Akses web tanpa batas | Tidak |
Perkiraan hasil: Everyone / PEGI 3 / IARC 3+. Hasil resmi tetap dari IARC saat kamu submit.

### 3b. Data safety
**Halaman 1**
- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes** (SDK iklan memakai TLS)
- Do you provide a way for users to request that their data is deleted? **No** (tidak ada akun; data game hanya di perangkat, data iklan dikelola lewat pengaturan iklan Google)

**Data yang dipilih** (dasar: panduan resmi AdMob, *developers.google.com/admob/android/play-data-disclosure*: SDK iklan otomatis mengumpulkan IP, interaksi produk, informasi diagnostik, dan ID perangkat untuk iklan, analitik, dan pencegahan penipuan)
| Kategori → Tipe | Collected | Shared | Wajib? | Tujuan |
|---|---|---|---|---|
| Location → **Approximate location** (dari IP) | Ya | Ya | Required | Advertising or marketing; Fraud prevention, security, compliance |
| App activity → **App interactions** | Ya | Ya | Required | Advertising or marketing; Analytics; Fraud prevention |
| App info and performance → **Diagnostics** | Ya | Ya | Required | Analytics; Fraud prevention |
| Device or other IDs → **Device or other IDs** (advertising ID) | Ya | Ya | Required | Advertising or marketing; Fraud prevention |
Untuk semua baris: **Processed ephemerally = No**. Pihak yang menerima: Google (AdMob).

**Tidak dikumpulkan sama sekali (biarkan tidak dicentang):** info pribadi (nama, email, alamat, telepon), info keuangan (pembelian diproses Google Play, bukan oleh kita), kesehatan, pesan, foto/video, audio, file, kalender, kontak, riwayat web, lokasi tepat.

**Halaman terakhir:** simpan, lalu cek pratinjau "How this will appear on Google Play". Isinya harus sama dengan kebijakan privasi bagian 3.

## 4. Monetize → In-app products
Buat **one-time product** (atau "Managed product" di menu lama):
| Kolom | Isi |
|---|---|
| Product ID | `calm_pass` (persis, huruf kecil; tidak bisa diubah) |
| Name | Calm Pass |
| Description | No ads, ever. All calm sounds. The Private Garden theme. 1,000 coins to start. |
| Harga | Saran: US$3.99 (Play mengonversi ke mata uang lokal; bisa diubah per negara). **Keputusan harga ada di kamu.** |
| Status | Active |
Pembelian tidak bisa dites dengan benar sebelum app ada di track pengujian dan akunmu terdaftar sebagai license tester (Setup → License testing).

## 5. Rilis (Release)
1. **Testing → Closed testing** dulu. Akun personal baru biasanya wajib closed test dengan minimal 12 tester selama 14 hari berturut-turut sebelum boleh ke produksi; cek angka terbarunya di Dashboard Play Console.
2. Upload `app-release.aab` (bukan APK). `versionCode` harus naik setiap upload (sekarang 1).
3. Countries/regions: semua (atau pilih sendiri). Release name bebas, mis. `1.0 (1)`.
4. Isi release notes dari bagian 2, lalu **Send for review**. Review pertama bisa makan beberapa hari.

## 6. Catatan lisensi dan kepatuhan
- **Musik:** `tingklik` berlisensi CC BY 4.0 (RTB45) dan **wajib** dikreditkan; kredit sudah ada di Settings → Music credits. Lagu Pixabay boleh dipakai di app, tapi tidak boleh dijual atau dibagikan sebagai file lagu terpisah. Sebagian lagu punya Content ID: kalau nanti membuat trailer YouTube, pakai rekaman layar dengan musik dimatikan atau musik lain.
- **Lagu berlabel AI** (3 dari 15) sudah dibatasi supaya tidak mendominasi.
- **Iklan:** semua batas (rewarded 5/hari, interstitial dari level 8 tiap menang ke-3, jeda 150 detik, maks 6/hari, banner hanya di Home dan Journey) sudah sesuai deskripsi listing. Jangan ubah tanpa mengubah deskripsi.
- **Consent (UMP):** muncul untuk EEA/UK; aktifkan pesan consent di akun AdMob (Privacy & messaging) supaya formulirnya benar-benar tampil.

## 7. Yang belum bisa saya pastikan dari sini
- Isi AdMob, Play Console, dan pembayaran hanya bisa kamu lakukan di akunmu.
- Hasil resmi rating IARC, review kebijakan Play, dan manifest akhir setelah build (cek poin 0.5).
- APK belum diuji di HP sungguhan: iklan asli, pembelian, backup, TalkBack, dan performa di HP 2 GB RAM.

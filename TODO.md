# TODO — DIAGA

Hal yang belum bisa diselesaikan tanpa informasi atau izin dari luar.

## Sebelum submit (batas pendaftaran 1 Oktober)

- [x] **Tim** — sudah terisi (3 anggota, Universitas Bengkulu · Teknik Informatika) di `src/data/tim.json`. Pembimbing belum ada; isi field `pembimbing` bila ada.
- [ ] **Sumber dan izin foto Batik Sungai Lemau (4 foto)** — isi `KREDIT_FOTO` di `src/pages/batik.js` setelah sumbernya pasti. Catatan: foto ke-2 adalah gabungan dua foto dan resolusinya rendah; foto ke-4 memuat spanduk "Batik Panca Mukti" dan logo Kemnaker, jadi pastikan itu foto milik/izin tim atau beri kredit.
- [ ] **Angka Kaganga** — catat sumber gambar angka 1–10 (siapa yang membuat/mendokumentasikan) dan validasi dengan narasumber. Angka nol dan angka di atas 10 belum ada; kalau tim punya datanya, tambahkan ke `src/data/angka.json` (parser di `src/modules/angka.js` sekarang hanya menerima 1–10).
- [ ] **Alamat Arumbatik Roemah** — papan nama di foto tertulis "No. 04 RT 1 RW 1", sedangkan versi lama situs menulis "No. 41". Cek langsung dan konfirmasi jam buka.
- [ ] **Foto Arumbatik** — foto asli memuat banyak wajah anak sekolah. Versi yang dipakai dipotong ke papan nama dan bangunan. Pakai foto lengkap hanya kalau ada izin tertulis sekolah/orang tua.
- [ ] **Lisensi `public/assets/ambient.mp3`** (8,5 MB) — tentukan sumber dan lisensinya, atau hapus file dan tombol musiknya.
- [ ] **Deploy yang cocok untuk AI** — folder `api/` berformat Vercel Functions. Situs yang sekarang di Netlify tidak menjalankannya, jadi Pemandu AI selalu jatuh ke mode offline. Deploy ke Vercel, atau ubah `api/chat.js` ke Netlify Functions.
- [ ] **Kunci API dan batas biaya** — set `AI_API_KEY` (dan `AI_MODEL`) di dashboard hosting, jangan di repo. Pasang batas pengeluaran bulanan di penyedia AI.
- [ ] **Pindahkan pencarian konteks ke server** — sekarang klien mengirim `konteks` ke `/api/chat` dan server mempercayainya. Siapa pun bisa memakai endpoint sebagai proxy AI bebas. Server sebaiknya mencari konteks sendiri dari `knowledge.json`.

## Sebelum final (7 Oktober)

- [ ] **Validasi ejaan aksara dengan narasumber** — vokal `e` (pepet atau taleng), konsonan akhir selain ng/n/r/h (sekarang "batik" berakhir huruf KA tanpa virama), dan gugus konsonan seperti "tra" pada "sumatra".
- [ ] **Sumber sejarah yang lebih kuat** dari Blog Curup Kami (2009): jurnal, dokumen dinas, buku, atau wawancara pengelola Arumbatik.
- [ ] **Perluas `knowledge.json`** supaya pertanyaan tentang huruf dan cara menulis terjawab.
- [ ] **Lighthouse** — `npx lighthouse http://localhost:4173 --view` setelah `npm run build && npm run preview`.
- [ ] **Improvement log** — catat perubahan setelah tag `v0.1.0` di `CHANGELOG.md` (wajib untuk Tahap 2).

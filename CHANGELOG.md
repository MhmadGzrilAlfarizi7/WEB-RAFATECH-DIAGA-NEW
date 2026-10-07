# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/).

## [Belum dirilis]

### Ditambahkan
- Foto dan data tiga anggota tim di halaman Tentang (Karel Desvalyudho, Muhamad Gazril Alfarizi, Ignes Puspa Lestari). Foto dipotong persegi berpusat di wajah, bingkai lingkaran 168 px, tata letak 3 kolom yang menjadi 1 kolom di HP.
- Bagian **Angka Kaganga** (1–10) di halaman Belajar Aksara: kartu angka, tampilan besar, kolom ketik angka ("7" atau "tujuh"), dan deskripsi bentuk untuk pembaca layar. Bentuknya digambar ulang sebagai SVG dari gambar angka tim, karena Unicode tidak punya karakter angka Rejang.
- Entri angka di knowledge base Pemandu AI, chip pertanyaan "Bentuk angka Kaganga?", dan 15 tes baru (data angka, penguraian masukan, SVG, pencarian).
- Kolase empat foto Batik Sungai Lemau di halaman Batik, dengan lightbox dan keterangan yang sesuai isi foto.
- Foto asli papan nama Galery Arumbatik Roemah di halaman Sentra Kreatif (dipotong tanpa wajah anak).
- Bagian Tim di halaman Tentang, diisi dari `src/data/tim.json` (tersembunyi bila belum ada nama).
- Font Noto Sans Rejang dimuat lewat `@fontsource` supaya aksara tampil di semua perangkat.
- Konfigurasi ESLint (`eslint.config.js`) dan lima tes regresi konverter.

### Diubah
- Halaman Tentang disederhanakan menjadi info DIAGA, tiga langkah, tim, batasan, sumber, dan rencana. Catatan teknis dan tabel aset dipindah ke `docs/`.
- Alamat Arumbatik Roemah mengikuti papan nama galeri (No. 04). Perlu konfirmasi lapangan.
- Gaya halaman Sentra Kreatif menjadi responsif (spanduk foto + isi dua kolom yang menumpuk di layar kecil).
- `vercel.json`: hapus `routes` dan `rewrites` (tidak boleh dipakai bersama `headers`, dan `routes` menjadikan semua alamat 404).

### Diperbaiki
- Pemandu AI selalu menjawab "belum punya data" di situs hasil build, karena `knowledge.json` dibaca lewat `fetch('/src/data/...')` padahal folder `src/` tidak ikut ke build. Sekarang diimpor langsung sehingga ikut dibundel.
- Galeri di halaman Batik tampil kosong karena kartu dibuat setelah observer animasi berjalan.
- Konverter salah memisah suku kata: "kaganga" menjadi ka-gang-a, "bunga" menjadi bung-a, "aksara" menjadi ...sar-a. Konsonan yang diikuti vokal kini diperlakukan sebagai awal suku kata berikutnya.
- Berkas font aksara yang dirujuk CSS tidak pernah ada di `public/`.
- `npm run lint` gagal karena tidak ada konfigurasi; sisa kode mati dibersihkan.

### Dihapus
- Mini-konverter di hero beranda (konverter lengkap ada di halaman Belajar Aksara).
- Foto lama yang bermasalah (keterangan tidak cocok, sumber tidak jelas, berlabel pihak ketiga).
- Teks "TODO" dan tabel status aset dari halaman publik.

## [0.1.0] — Versi penyisihan

- Rebuild Vite multi-halaman: Beranda, Belajar Aksara, Pemandu AI, Batik Kaganga, Sentra Kreatif, Tentang.

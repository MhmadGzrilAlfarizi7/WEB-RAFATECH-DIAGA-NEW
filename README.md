# DIAGA — Digitalisasi Aksara Kaganga

> Museum digital interaktif untuk melestarikan Aksara Kaganga dan Batik Kaganga dari Bengkulu.
> **Tema RAFATECH 2026:** APEX — AI Powered Experience for the Web.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-24%2F24-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## Cara Jalan Lokal

```bash
# Clone repo
git clone https://github.com/tim-diaga/diaga.git
cd diaga

# Install dependencies
npm install

# Jalankan dev server
npm run dev
# → http://localhost:5173

# Build produksi
npm run build

# Jalankan test
npm test
```

## Deploy ke Vercel

1. Fork repo ini ke akun GitHub kamu
2. Buka [vercel.com/new](https://vercel.com/new) dan import repo
3. Tambahkan environment variables di Vercel Dashboard:

```
AI_PROVIDER=anthropic      # atau 'gemini'
AI_API_KEY=sk-ant-...      # kunci API (JANGAN commit ke repo!)
AI_MODEL=claude-3-haiku-20240307
SITE_URL=https://diaga.vercel.app
ALLOWED_ORIGIN=https://diaga.vercel.app
```

4. Deploy! Vercel akan otomatis mendeteksi `vercel.json`.

## Environment Variables

Salin `.env.example` ke `.env` dan isi:

| Variable       | Deskripsi                          | Wajib |
|----------------|------------------------------------|-------|
| AI_PROVIDER    | `anthropic` atau `gemini`          | Ya    |
| AI_API_KEY     | Kunci API dari provider            | Ya    |
| AI_MODEL       | Nama model (opsional)              | Tidak |
| SITE_URL       | URL produksi                       | Tidak |
| ALLOWED_ORIGIN | CORS origin yang diizinkan         | Tidak |

## Struktur Proyek

```
diaga/
├── index.html              # Beranda
├── pages/
│   ├── belajar.html        # Galeri Aksara + Konverter + Kuis
│   ├── pemandu-ai.html     # Chat AI berlandaskan data
│   ├── batik.html          # Sejarah + Koleksi + Generator Batik
│   ├── sentra-kreatif.html # Arumbatik Roemah
│   ├── tentang.html        # Arsitektur, Etika, Sumber
│   └── 404.html
├── src/
│   ├── modules/
│   │   ├── converter.js    # Parser Latin → Aksara (pure JS)
│   │   ├── retrieval.js    # BM25 search atas knowledge.json
│   │   ├── common.js       # Navbar, footer, tema, partikel
│   │   └── nav-footer.js   # Partial HTML
│   ├── data/
│   │   ├── aksara.json     # Data 23 huruf + tanda vokal + coda
│   │   └── knowledge.json  # Knowledge base untuk AI
│   ├── pages/              # Script per halaman
│   └── styles/
│       └── main.css        # Design system (tokens, komponen)
├── api/
│   └── chat.js             # Vercel Serverless Function
├── public/
│   └── assets/
│       ├── fonts/          # Noto Sans Rejang (self-hosted)
│       ├── images/         # Foto (lisensi di docs/ASET.md)
│       └── ambient.mp3     # Musik latar (TODO: lisensi)
├── tests/
│   └── converter.test.js   # 24 unit test konverter
├── docs/
│   ├── KRITERIA.md
│   ├── ARSITEKTUR.md
│   ├── DEMO.md
│   └── ASET.md
├── TODO.md
├── CHANGELOG.md
├── vercel.json
└── .env.example
```

## Fitur Utama

| Fitur | Halaman | Status |
|-------|---------|--------|
| Konverter Latin → Aksara Kaganga | `/pages/belajar.html` | ✅ |
| Galeri 23 huruf + panel detail | `/pages/belajar.html` | ✅ |
| Kuis adaptif (Leitner, 3 mode) | `/pages/belajar.html` | ✅ |
| Pemandu AI (retrieval + Anthropic/Gemini) | `/pages/pemandu-ai.html` | ✅ |
| Mode offline (knowledge.json lokal) | `/pages/pemandu-ai.html` | ✅ |
| Sejarah Batik Kaganga (timeline) | `/pages/batik.html` | ✅ |
| Generator Batik Canvas | `/pages/batik.html` | ✅ |
| Sentra Kreatif Arumbatik | `/pages/sentra-kreatif.html` | ✅ |
| Demo mode `?demo=1` | Semua | ✅ |
| Tema gelap/terang | Semua | ✅ |

## Diagram Arsitektur

```
Klien (Browser)
├── 6 halaman HTML (Vite MPA)
├── converter.js        ← pure JS, no network
├── retrieval.js        ← BM25 atas knowledge.json
└── common.js           ← layout, tema, partikel

           ↕ fetch /api/chat (HTTPS)

Vercel Serverless
└── api/chat.js
    ├── Validasi input
    ├── Rate limit (IP)
    ├── Retrieval BM25
    ├── Jika konteks ada → AI (Anthropic/Gemini)
    └── Jika tidak → "data tidak cukup"

Mode Offline (API tidak tersedia):
  retrieval.js lokal → jawaban + badge "📴 Mode offline"
```

## Peta Fitur → Kriteria Juri

Lihat [`docs/KRITERIA.md`](docs/KRITERIA.md).

## Keterbatasan yang Diketahui

- Font Noto Sans Rejang harus diunduh manual ke `public/assets/fonts/`
- Ejaan aksara belum divalidasi narasumber adat
- Knowledge base masih terbatas — AI mungkin sering menjawab "data tidak cukup"
- Foto aset belum semua diketahui lisensinya

---

© 2026 Tim DIAGA. Untuk pelestarian budaya Rejang Bengkulu.
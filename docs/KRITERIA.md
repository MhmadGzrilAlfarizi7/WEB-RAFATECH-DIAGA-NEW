# DIAGA — Peta Fitur vs Kriteria Juri RAFATECH 2026

## Kriteria Utama

| Kriteria | Implementasi | Skor Target |
|----------|-------------|-------------|
| Tema APEX: AI Powered | Pemandu AI (RAG), mode offline, knowledge grounding | ✅ |
| Min. 3 halaman fungsional | 6 halaman: Beranda, Belajar, AI, Batik, Sentra, Tentang | ✅ |
| Min. 3 fitur interaktif | Konverter, Angka Kaganga (pilih/ketik 1–10), Kuis Leitner, Generator Batik Canvas, Pemandu AI | ✅ |
| Lighthouse ≥ 90 | Self-hosted fonts, lazy images, no external CDN, minimal JS | Target ≥ 90 |
| Keamanan | CSP header, sanitasi XSS, rate limit API, no hardcoded key | ✅ |
| Desain estetik | Obsidian/Gold/Emerald, Cinzel+Inter, partikel, glassmorphism | ✅ |
| Konten jujur | TODO: diakui, sumber ditampilkan, fakta tidak dikarang | ✅ |
| Aksesibilitas | Skip link, ARIA, landmark, focus trap, reduced motion | ✅ |

## Fitur AI (APEX Theme)

| Sub-kriteria | Implementasi |
|-------------|-------------|
| AI tidak mengarang | Hanya jawab dari konteks knowledge base lokal |
| Sumber ditampilkan | Setiap respons AI menampilkan dasar data |
| Mode offline | Jika API gagal → retrieval lokal + badge offline |
| Keamanan kunci | Kunci AI di env var Vercel, tidak di klien |
| XSS-safe | Tidak gunakan innerHTML untuk output AI — gunakan textContent + DOM |
| Rate limit | 20 req/IP/menit di API |

## Fitur Interaktif (min. 3)

1. **Konverter Aksara** — Latin → Aksara Kaganga real-time, rincian per suku kata, salin ke clipboard
2. **Kuis Adaptif** — Sistem Leitner 3 mode (huruf→bunyi, bunyi→huruf, tulis Latin), progres localStorage
3. **Generator Batik Canvas** — Aksara namamu di motif Rafflesia prosedural, 3 palet, download PNG

## Halaman Fungsional (min. 3, ada 6)

1. `index.html` — Beranda
2. `pages/belajar.html` — Galeri + Konverter lengkap + Kuis
3. `pages/pemandu-ai.html` — Chatbot AI
4. `pages/batik.html` — Sejarah timeline + Galeri koleksi + Generator
5. `pages/sentra-kreatif.html` — Info Arumbatik Roemah
6. `pages/tentang.html` — Arsitektur, etika, sumber, changelog

## Demo Mode

Tambahkan `?demo=1` ke URL untuk memuat data demo otomatis:
- Beranda: input "rejang" → tampil aksara
- Belajar: input "Rejang Lebong" → tampil rincian suku kata
- AI: pre-fill "Apa itu Aksara Kaganga?"
- Batik: langsung generate nama "Rejang"
/**
 * DIAGA — Halaman Tentang (tentang.js)
 * Menampilkan daftar tim dari src/data/tim.json.
 * Slot tanpa nama tidak ditampilkan. Saat `npm run dev` dan semua slot kosong,
 * tampil contoh bergaris putus-putus supaya tata letaknya bisa dilihat. Contoh itu
 * tidak ikut ke versi build.
 */
import { initLayout, initParticles, initFadeObserver } from '../modules/common.js';
import tim from '../data/tim.json';

const CONTOH = [
  { nama: 'Nama Anggota 1', peran: 'Peran', kampus: 'Universitas · Program Studi', foto: '' },
  { nama: 'Nama Anggota 2', peran: 'Peran', kampus: 'Universitas · Program Studi', foto: '' },
  { nama: 'Nama Anggota 3', peran: 'Peran', kampus: 'Universitas · Program Studi', foto: '' },
];

function inisial(nama) {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(k => k[0].toUpperCase())
    .join('');
}

function buatKartu(m, contoh) {
  const card = document.createElement('article');
  card.className = 'glass tim-card' + (contoh ? ' tim-sample' : '');

  let foto;
  if (m.foto) {
    foto = document.createElement('img');
    foto.className = 'tim-photo';
    foto.src = m.foto;
    foto.alt = `Foto ${m.nama}`;
    foto.width = 168;
    foto.height = 168;
    foto.loading = 'lazy';
    foto.onerror = () => {
      const ganti = document.createElement('div');
      ganti.className = 'tim-photo';
      ganti.setAttribute('aria-hidden', 'true');
      ganti.textContent = inisial(m.nama);
      foto.replaceWith(ganti);
    };
  } else {
    foto = document.createElement('div');
    foto.className = 'tim-photo';
    foto.setAttribute('aria-hidden', 'true');
    foto.textContent = inisial(m.nama);
  }

  const nama = document.createElement('h3');
  nama.className = 'tim-name';
  nama.textContent = m.nama;
  card.append(foto, nama);

  if (m.peran) {
    const peran = document.createElement('p');
    peran.className = 'tim-role';
    peran.textContent = m.peran;
    card.appendChild(peran);
  }
  if (m.kampus) {
    const meta = document.createElement('p');
    meta.className = 'tim-meta';
    // "Universitas · Program Studi" tampil dua baris rapi, bukan terpotong di tengah
    m.kampus.split('·').map(b => b.trim()).filter(Boolean).forEach(bagian => {
      const baris = document.createElement('span');
      baris.textContent = bagian;
      meta.appendChild(baris);
    });
    card.appendChild(meta);
  }
  return card;
}

function tampilkanTim() {
  const section = document.getElementById('tim');
  const grid = document.getElementById('timGrid');
  const mentor = document.getElementById('timMentor');
  if (!section || !grid) return;

  let anggota = (tim.anggota || []).filter(m => m.nama && m.nama.trim());
  let contoh = false;

  if (!anggota.length) {
    if (import.meta.env.DEV) {
      anggota = CONTOH;
      contoh = true;
    } else {
      section.hidden = true; // belum diisi: jangan tampilkan bagian kosong ke publik
      return;
    }
  }

  anggota.forEach(m => grid.appendChild(buatKartu(m, contoh)));

  const p = tim.pembimbing;
  if (mentor && p && p.nama && p.nama.trim()) {
    mentor.textContent = `Pembimbing: ${p.nama}${p.keterangan ? ' · ' + p.keterangan : ''}`;
    mentor.hidden = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  initParticles();
  tampilkanTim();
  initFadeObserver(); // kartu tim dibuat setelah observer awal jalan
});

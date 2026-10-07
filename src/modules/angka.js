/**
 * DIAGA — Angka Kaganga (1–10)
 *
 * Unicode tidak punya karakter angka Rejang (blok U+A930–A95F hanya berisi huruf,
 * tanda vokal, tanda konsonan, virama, dan satu tanda bagian). Karena itu bentuk
 * angka disimpan sebagai goresan SVG di src/data/angka.json, bukan sebagai teks font.
 */
import data from '../data/angka.json';

export const ANGKA = data.angka;
export const VIEWBOX = data.viewBox;
export const TEBAL = data.tebal;

const SVG_NS = 'http://www.w3.org/2000/svg';

/** @param {number} n 1–10 */
export function ambilAngka(n) {
  return ANGKA.find(a => a.angka === n) || null;
}

/**
 * Terjemahkan masukan pengguna menjadi angka 1–10.
 * Menerima "7", " 10 ", atau kata "tujuh". Selain itu mengembalikan null.
 * @param {string} teks
 * @returns {number|null}
 */
export function parseAngka(teks) {
  const t = String(teks ?? '').trim().toLowerCase();
  if (!t) return null;
  if (/^[1-9]\d?$/.test(t)) {
    const n = Number(t);
    return n >= 1 && n <= 10 ? n : null;
  }
  const dariKata = ANGKA.find(a => a.nama === t);
  return dariKata ? dariKata.angka : null;
}

/** Pesan ramah saat masukan di luar jangkauan yang sudah didokumentasikan. */
export function pesanDiLuar(teks) {
  const t = String(teks ?? '').trim();
  if (!t) return '';
  if (/^\d+$/.test(t)) {
    return Number(t) === 0
      ? 'Angka nol belum kami dokumentasikan.'
      : 'Baru angka 1 sampai 10 yang kami dokumentasikan.';
  }
  return 'Ketik angka 1 sampai 10, atau namanya seperti "tujuh".';
}

/** Deskripsi singkat untuk pembaca layar. */
export function labelAngka(a) {
  return `Angka ${a.angka} (${a.nama}) dalam aksara Kaganga: ${a.bentuk}`;
}

/**
 * Buat elemen SVG untuk satu angka. Warna mengikuti `currentColor`.
 * @param {number} n
 * @param {{ kelas?: string, dekoratif?: boolean }} [opsi]
 * @returns {SVGSVGElement|null}
 */
export function buatSvgAngka(n, opsi = {}) {
  const a = ambilAngka(n);
  if (!a) return null;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', VIEWBOX);
  svg.setAttribute('class', `angka-svg ${opsi.kelas || ''}`.trim());
  svg.setAttribute('focusable', 'false');
  if (opsi.dekoratif) {
    svg.setAttribute('aria-hidden', 'true');
  } else {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', labelAngka(a));
  }

  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('fill', 'none');
  g.setAttribute('stroke', 'currentColor');
  g.setAttribute('stroke-width', String(TEBAL));
  g.setAttribute('stroke-linecap', 'round');
  g.setAttribute('stroke-linejoin', 'round');

  a.paths.forEach(d => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    g.appendChild(path);
  });

  svg.appendChild(g);
  return svg;
}

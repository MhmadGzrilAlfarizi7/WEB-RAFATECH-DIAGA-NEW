/**
 * DIAGA — Unit Test Konverter Aksara Kaganga (WP1)
 * Jalankan: npm test
 */

import { describe, it, expect } from 'vitest';
import { latinKeKaganga, konversiSederhana } from '../src/modules/converter.js';

// Helper: ekstrak kode pertama (huruf onset)
function kode0(hasil) {
  return hasil.rincian[0]?.kode[0] ?? '';
}

// Helper: cek apakah token ke-n punya kode tertentu
function kodePada(hasil, tokenIdx, kodeIdx) {
  return hasil.rincian[tokenIdx]?.kode[kodeIdx] ?? '';
}

describe('Huruf dasar', () => {
  it('ka → U+A930', () => {
    const h = latinKeKaganga('ka');
    expect(kode0(h)).toBe('U+A930');
  });

  it('nga → U+A932', () => {
    const h = latinKeKaganga('nga');
    expect(kode0(h)).toBe('U+A932');
  });

  it('ngga → U+A943', () => {
    const h = latinKeKaganga('ngga');
    expect(kode0(h)).toBe('U+A943');
  });

  it('mba → U+A942', () => {
    const h = latinKeKaganga('mba');
    expect(kode0(h)).toBe('U+A942');
  });

  it('nda → U+A944', () => {
    const h = latinKeKaganga('nda');
    expect(kode0(h)).toBe('U+A944');
  });

  it('nya → U+A93B', () => {
    const h = latinKeKaganga('nya');
    expect(kode0(h)).toBe('U+A93B');
  });

  it('a → U+A946 (huruf A murni)', () => {
    const h = latinKeKaganga('a');
    expect(kode0(h)).toBe('U+A946');
  });
});

describe('Vokal non-inheren', () => {
  it('ki → ka(A930) + vokal i(A947)', () => {
    const h = latinKeKaganga('ki');
    expect(kode0(h)).toBe('U+A930');
    expect(kodePada(h, 0, 1)).toBe('U+A947');
  });

  it('ku → ka(A930) + vokal u(A948)', () => {
    const h = latinKeKaganga('ku');
    expect(kode0(h)).toBe('U+A930');
    expect(kodePada(h, 0, 1)).toBe('U+A948');
  });

  it('kai → ka(A930) + vokal ai(A94A)', () => {
    const h = latinKeKaganga('kai');
    expect(kode0(h)).toBe('U+A930');
    expect(kodePada(h, 0, 1)).toBe('U+A94A');
  });

  it('ko → ka(A930) + vokal o(A94B)', () => {
    const h = latinKeKaganga('ko');
    expect(kode0(h)).toBe('U+A930');
    expect(kodePada(h, 0, 1)).toBe('U+A94B');
  });

  it('kau → ka(A930) + vokal au(A94C)', () => {
    const h = latinKeKaganga('kau');
    expect(kode0(h)).toBe('U+A930');
    expect(kodePada(h, 0, 1)).toBe('U+A94C');
  });
});

describe('Tanda konsonan akhir', () => {
  it('kang → ka(A930) + coda ng(A94F)', () => {
    const h = latinKeKaganga('kang');
    expect(kode0(h)).toBe('U+A930');
    // Vokal 'a' inheren, kode[1] adalah coda
    const lastKode = h.rincian[0].kode.at(-1);
    expect(lastKode).toBe('U+A94F');
  });

  it('kan → ka(A930) + coda n(A950)', () => {
    const h = latinKeKaganga('kan');
    const lastKode = h.rincian[0].kode.at(-1);
    expect(lastKode).toBe('U+A950');
  });

  it('kar → ka(A930) + coda r(A951)', () => {
    const h = latinKeKaganga('kar');
    const lastKode = h.rincian[0].kode.at(-1);
    expect(lastKode).toBe('U+A951');
  });

  it('kah → ka(A930) + coda h(A952)', () => {
    const h = latinKeKaganga('kah');
    const lastKode = h.rincian[0].kode.at(-1);
    expect(lastKode).toBe('U+A952');
  });
});

describe('Kata utuh', () => {
  it('bengkulu → menghasilkan glyph tanpa karakter Latin', () => {
    const h = latinKeKaganga('bengkulu');
    // Semua token harus memiliki glyph Rejang (bukan karakter ASCII biasa)
    const glyph = h.teks;
    // Tidak boleh ada karakter Latin a-z yang tidak terpetakan
    const sisaLatin = [...glyph].filter(c => /[a-z]/i.test(c));
    expect(sisaLatin.length).toBe(0);
  });

  it('rejang → menghasilkan glyph', () => {
    const h = latinKeKaganga('rejang');
    expect(h.teks.length).toBeGreaterThan(0);
    const sisaLatin = [...h.teks].filter(c => /[a-z]/i.test(c));
    expect(sisaLatin.length).toBe(0);
  });

  it('curup → menghasilkan glyph', () => {
    const h = latinKeKaganga('curup');
    expect(h.teks.length).toBeGreaterThan(0);
  });

  it('batik → menghasilkan glyph', () => {
    const h = latinKeKaganga('batik');
    expect(h.teks.length).toBeGreaterThan(0);
  });
});

describe('Kasus khusus', () => {
  it('e — pepet vs taleng perlu validasi narasumber', () => {
    // e (A949) dipakai untuk pepet — catatan ini adalah pengingat
    const h = latinKeKaganga('ke');
    // Harus ada vokal e
    expect(h.rincian[0].kode).toContain('U+A949');
    // TODO: perlu validasi narasumber apakah U+A949 adalah e pepet atau e taleng
  });

  it('karakter tanpa padanan (f, v, z) tidak dicampur diam-diam', () => {
    const h = latinKeKaganga('fisi');
    expect(h.adaTanpaPadanan).toBe(true);
    // Token 'f' harus punya flag tanpaPadanan
    expect(h.rincian[0].tanpaPadanan).toBe(true);
    expect(h.rincian[0].pesan).toBeTruthy();
  });

  it('spasi dipertahankan', () => {
    const h = latinKeKaganga('ka ba');
    expect(h.teks).toContain(' ');
  });

  it('angka dipertahankan', () => {
    const h = latinKeKaganga('2026');
    expect(h.teks).toBe('2026');
  });
});
// ── Regresi: konsonan yang diikuti vokal adalah onset, bukan coda ─────────────
describe('Pemisahan onset dan coda', () => {
  const kode = (s) => [...s].map((c) => c.codePointAt(0).toString(16).toUpperCase());

  it('"kaganga" -> KA GA NGA (nama aksaranya sendiri)', () => {
    expect(kode(latinKeKaganga('kaganga').teks)).toEqual(['A930', 'A931', 'A932']);
  });

  it('"bunga" -> BA+U, NGA', () => {
    expect(kode(latinKeKaganga('bunga').teks)).toEqual(['A937', 'A948', 'A932']);
  });

  it('"aksara": R diikuti vokal menjadi onset RA, bukan coda', () => {
    const hasil = kode(latinKeKaganga('aksara').teks);
    expect(hasil[hasil.length - 1]).toBe('A93D'); // RA di akhir
    expect(hasil).not.toContain('A951'); // tidak ada tanda coda R
  });

  it('"bengkulu" tetap memakai coda NG sebelum konsonan', () => {
    expect(kode(latinKeKaganga('bengkulu').teks)).toEqual(
      ['A937', 'A949', 'A94F', 'A930', 'A948', 'A93E', 'A948'],
    );
  });

  it('"rejang" tetap memakai coda NG di akhir kata', () => {
    expect(kode(latinKeKaganga('rejang').teks)).toEqual(['A93D', 'A949', 'A93A', 'A94F']);
  });
});

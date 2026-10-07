/**
 * DIAGA — Tes data dan logika Angka Kaganga (1–10)
 */
import { describe, it, expect } from 'vitest';
import { ANGKA, VIEWBOX, ambilAngka, parseAngka, pesanDiLuar, labelAngka } from '../src/modules/angka.js';
import { cariEntri } from '../src/modules/retrieval.js';

describe('Data angka', () => {
  it('berisi tepat angka 1 sampai 10 berurutan', () => {
    expect(ANGKA.map(a => a.angka)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('tiap angka punya nama, deskripsi bentuk, dan minimal satu goresan', () => {
    ANGKA.forEach(a => {
      expect(a.nama.length).toBeGreaterThan(2);
      expect(a.bentuk.length).toBeGreaterThan(10);
      expect(a.paths.length).toBeGreaterThan(0);
    });
  });

  it('semua koordinat jalur berada di dalam viewBox', () => {
    const [, , lebar, tinggi] = VIEWBOX.split(' ').map(Number);
    ANGKA.forEach(a => {
      a.paths.forEach(d => {
        const angka = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
        for (let i = 0; i < angka.length; i += 2) {
          expect(angka[i], `x angka ${a.angka}`).toBeGreaterThanOrEqual(0);
          expect(angka[i], `x angka ${a.angka}`).toBeLessThanOrEqual(lebar);
          expect(angka[i + 1], `y angka ${a.angka}`).toBeGreaterThanOrEqual(0);
          expect(angka[i + 1], `y angka ${a.angka}`).toBeLessThanOrEqual(tinggi);
        }
        expect(d.startsWith('M')).toBe(true);
      });
    });
  });

  it('jumlah goresan sesuai gambar: 1-3 tegak, 4 empat, 5 dua, 6 tiga, 7 empat, 8 lima, 9 enam, 10 dua', () => {
    expect(ANGKA.map(a => a.paths.length)).toEqual([1, 2, 3, 4, 2, 3, 4, 5, 6, 2]);
  });

  it('ambilAngka mengembalikan null di luar 1–10', () => {
    expect(ambilAngka(5).nama).toBe('lima');
    expect(ambilAngka(0)).toBeNull();
    expect(ambilAngka(11)).toBeNull();
  });
});

describe('parseAngka', () => {
  it('menerima angka dan kata', () => {
    expect(parseAngka('7')).toBe(7);
    expect(parseAngka(' 10 ')).toBe(10);
    expect(parseAngka('tujuh')).toBe(7);
    expect(parseAngka('SEPULUH')).toBe(10);
  });

  it('menolak yang belum didokumentasikan atau tidak valid', () => {
    ['', '0', '11', '05', '25', 'abc', '1.5', '-3'].forEach(s => {
      expect(parseAngka(s), s).toBeNull();
    });
    expect(parseAngka(undefined)).toBeNull();
  });
});

describe('pesanDiLuar', () => {
  it('memberi pesan yang jujur', () => {
    expect(pesanDiLuar('0')).toMatch(/nol/);
    expect(pesanDiLuar('25')).toMatch(/1 sampai 10/);
    expect(pesanDiLuar('abc')).toMatch(/tujuh/);
    expect(pesanDiLuar('')).toBe('');
  });
});

describe('labelAngka', () => {
  it('memuat angka, nama, dan bentuk untuk pembaca layar', () => {
    const l = labelAngka(ambilAngka(5));
    expect(l).toContain('Angka 5');
    expect(l).toContain('lima');
    expect(l).toContain('huruf T');
  });
});

describe('Pemandu AI menemukan data angka', () => {
  it('pertanyaan tentang bentuk angka menemukan entri angka', async () => {
    const hasil = await cariEntri('bagaimana bentuk angka kaganga');
    expect(hasil.some(e => e.id === 'angka-kaganga-1-10')).toBe(true);
  });

  it('knowledge base termuat (tidak kosong)', async () => {
    const hasil = await cariEntri('aksara kaganga');
    expect(hasil.length).toBeGreaterThan(0);
  });
});

// @vitest-environment jsdom
/**
 * DIAGA — Tes pembuatan SVG angka (butuh DOM)
 */
import { describe, it, expect } from 'vitest';
import { buatSvgAngka } from '../src/modules/angka.js';

describe('buatSvgAngka', () => {
  it('membuat SVG beraksesibilitas penuh untuk tampilan besar', () => {
    const svg = buatSvgAngka(5, { kelas: 'angka-svg-besar' });
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toContain('Angka 5');
    expect(svg.getAttribute('viewBox')).toBe('0 0 160 150');
    expect(svg.classList.contains('angka-svg-besar')).toBe(true);
    expect(svg.querySelectorAll('path')).toHaveLength(2);
    expect(svg.querySelector('g').getAttribute('stroke')).toBe('currentColor');
  });

  it('menyembunyikan SVG dekoratif dari pembaca layar', () => {
    const svg = buatSvgAngka(3, { dekoratif: true });
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.querySelectorAll('path')).toHaveLength(3);
  });

  it('mengembalikan null untuk angka yang belum didokumentasikan', () => {
    expect(buatSvgAngka(11)).toBeNull();
    expect(buatSvgAngka(0)).toBeNull();
  });

  it('angka 10 terdiri dari lengkung dan satu goresan tegak', () => {
    const svg = buatSvgAngka(10);
    const paths = [...svg.querySelectorAll('path')].map(p => p.getAttribute('d'));
    expect(paths).toHaveLength(2);
    expect(paths.some(d => d.includes('C'))).toBe(true);
  });
});

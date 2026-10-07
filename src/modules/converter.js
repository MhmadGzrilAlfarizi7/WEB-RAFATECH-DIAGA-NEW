/**
 * DIAGA — Konverter Latin → Aksara Kaganga (WP1, refactored)
 *
 * Algoritma:
 *   1. Untuk setiap posisi, cari onset konsonan terpanjang (greedy)
 *   2. Setelah onset, cari vokal terpanjang (default inheren 'a')
 *   3. Setelah vokal, cari coda
 *   4. Glyph = huruf_onset + tanda_vokal? + tanda_coda?
 *   5. Suku kata bervokal awal: huruf A (A946) + tanda_vokal?
 *
 * PENTING: onset TIDAK mengandung vokal inheren 'a'.
 * Huruf Unicode sudah encode vokal inheren 'a' secara implisit.
 */

// ── Onset konsonan (TANPA vokal) → char Unicode ───────────────────────────────
const ONSET = Object.freeze({
  // Terpanjang dulu (greedy)
  'nyj': '\uA945',
  'ngg': '\uA943',
  'nd':  '\uA944',
  'mb':  '\uA942',
  'ny':  '\uA93B',
  'ng':  '\uA932',
  'k':   '\uA930',
  'g':   '\uA931',
  't':   '\uA933',
  'd':   '\uA934',
  'n':   '\uA935',
  'p':   '\uA936',
  'b':   '\uA937',
  'm':   '\uA938',
  'c':   '\uA939',
  'j':   '\uA93A',
  's':   '\uA93C',
  'r':   '\uA93D',
  'l':   '\uA93E',
  'y':   '\uA93F',
  'w':   '\uA940',
  'h':   '\uA941',
});

const ONSET_KEYS = Object.keys(ONSET); // sudah terpanjang dulu karena Object.freeze urutan insert

// ── Tanda vokal ───────────────────────────────────────────────────────────────
const VOKAL = Object.freeze({
  'au': '\uA94C',
  'ai': '\uA94A',
  'eu': '\uA94D',
  'ea': '\uA94E',
  'i':  '\uA947',
  'u':  '\uA948',
  'e':  '\uA949', // pepet — perlu validasi narasumber
  'o':  '\uA94B',
  // 'a' = inheren, tidak perlu tanda
});

const VOKAL_KEYS = Object.keys(VOKAL);

// ── Tanda konsonan akhir ──────────────────────────────────────────────────────
const CODA = Object.freeze({
  'ng': '\uA94F',
  'n':  '\uA950',
  'r':  '\uA951',
  'h':  '\uA952',
});

const CODA_KEYS = Object.keys(CODA);

const HURUF_A      = '\uA946'; // Carrier vokal awal kata
// eslint-disable-next-line no-unused-vars
const VIRAMA       = '\uA953'; // Mematikan vokal inheren (untuk coda yang tidak punya tanda)
const TANPA_PADANAN = new Set(['f', 'v', 'z', 'x', 'q']);
const PENGGANTI     = { f: 'p', v: 'b', z: 's', x: 'k', q: 'k' };

// ── Helper: kode Unicode hex ──────────────────────────────────────────────────
function hexKode(char) {
  return 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
}

// ── Helper: cari onset di posisi i ───────────────────────────────────────────
function ambilOnset(str, i) {
  for (const key of ONSET_KEYS) {
    if (str.startsWith(key, i)) return key;
  }
  return null;
}

// ── Helper: cari vokal di posisi i ───────────────────────────────────────────
function ambilVokal(str, i) {
  for (const key of VOKAL_KEYS) {
    if (str.startsWith(key, i)) return key;
  }
  return null;
}

// ── Helper: cari coda di posisi i ────────────────────────────────────────────
// Konsonan yang diikuti vokal adalah awal suku kata berikutnya (onset), bukan coda.
// Contoh: "kaganga" -> ka-ga-nga (bukan ka-gang-a), "aksara" -> ...sa-ra (bukan sar-a).
function ambilCoda(str, i) {
  for (const key of CODA_KEYS) {
    if (!str.startsWith(key, i)) continue;
    const setelah = str.slice(i + key.length);
    const diikutVokal = /^[aiueo]/.test(setelah);

    if (diikutVokal) continue; // ini onset suku kata berikutnya

    if (key === 'ng') {
      // 'ngg' ditangani sebagai onset (huruf NGGA)
      if (setelah.startsWith('g')) continue;
      return key;
    }
    if (key === 'n') {
      // 'n' + g/y/d/j membentuk onset rangkap (ngg, ny, nd, nj), bukan coda
      if (/^[gydj]/.test(setelah)) continue;
      return key;
    }
    return key; // 'r' atau 'h' di akhir kata atau sebelum konsonan
  }
  return null;
}

/**
 * @typedef {Object} TokenRincian
 * @property {string}   latin
 * @property {string}   glyph
 * @property {string[]} kode
 * @property {string}   [pesan]
 * @property {boolean}  [tanpaPadanan]
 */

/**
 * @typedef {Object} HasilKonversi
 * @property {string}          teks
 * @property {TokenRincian[]}  rincian
 * @property {boolean}         adaTanpaPadanan
 */

/**
 * Konversi teks Latin ke Aksara Kaganga dengan rincian per suku kata.
 * @param {string} teks
 * @returns {HasilKonversi}
 */
export function latinKeKaganga(teks) {
  const str = teks.toLowerCase();
  /** @type {TokenRincian[]} */
  const rincian = [];
  let i = 0;

  while (i < str.length) {
    const ch = str[i];

    // ── Spasi ────────────────────────────────────────────────────────────────
    if (ch === ' ') {
      rincian.push({ latin: ' ', glyph: ' ', kode: [] });
      i++;
      continue;
    }

    // ── Tanda baca & angka ───────────────────────────────────────────────────
    if (/[\d.,!?;:()\-'"/\\@#%&*_+=<>[\]{}|~`^]/u.test(ch)) {
      rincian.push({ latin: ch, glyph: ch, kode: [] });
      i++;
      continue;
    }

    // ── Karakter tanpa padanan ───────────────────────────────────────────────
    if (TANPA_PADANAN.has(ch)) {
      rincian.push({
        latin: ch,
        glyph: ch,
        kode: [],
        pesan: `Belum ada padanan Aksara Kaganga untuk "${ch}". Padanan lazim: ${PENGGANTI[ch]}`,
        tanpaPadanan: true,
      });
      i++;
      continue;
    }

    // ── Coba vokal awal kata (tidak didahului konsonan) ──────────────────────
    const vokalAwal = ambilVokal(str, i);
    const onsetAwal = ambilOnset(str, i);

    if (vokalAwal && !onsetAwal) {
      // Vokal murni (bukan didahului konsonan yg bisa di-parse dulu)
      const vokalChar = VOKAL[vokalAwal];
      const glyph = HURUF_A + (vokalChar || '');
      const kode = [hexKode(HURUF_A)];
      if (vokalChar) kode.push(hexKode(vokalChar));

      // Cek coda setelah vokal
      i += vokalAwal.length;
      const codaStr = ambilCoda(str, i);
      let codaChar = '';
      if (codaStr) {
        codaChar = CODA[codaStr];
        i += codaStr.length;
        kode.push(hexKode(codaChar));
      }

      rincian.push({
        latin: vokalAwal + (codaStr || ''),
        glyph: glyph + (vokalAwal === 'a' ? '' : '') + codaChar,
        kode,
      });
      continue;
    }

    // ── Vokal 'a' murni di awal (tidak ada onset, tidak ada VOKAL key) ───────
    if (ch === 'a' && !onsetAwal) {
      // Ambil 'a' + coda
      i++;
      const codaStr = ambilCoda(str, i);
      const kode = [hexKode(HURUF_A)];
      let codaGlyph = '';
      if (codaStr) {
        codaGlyph = CODA[codaStr];
        i += codaStr.length;
        kode.push(hexKode(codaGlyph));
      }
      rincian.push({
        latin: 'a' + (codaStr || ''),
        glyph: HURUF_A + codaGlyph,
        kode,
      });
      continue;
    }

    // ── Onset konsonan ────────────────────────────────────────────────────────
    const onsetStr = ambilOnset(str, i);

    if (onsetStr) {
      const hurufChar = ONSET[onsetStr];
      i += onsetStr.length;

      // Cari vokal setelah onset
      const vokalStr = ambilVokal(str, i);
      let vokalChar = '';
      let vokalLen = 0;

      if (vokalStr) {
        vokalChar = VOKAL[vokalStr] || '';
        vokalLen = vokalStr.length;
        i += vokalLen;
      } else if (str[i] === 'a') {
        // Vokal inheren 'a' — consume tapi tidak tambah tanda
        vokalLen = 1;
        i++;
      }
      // Jika tidak ada vokal sama sekali: konsonan akhir kata → tambahkan virama
      // (akan di-handle di coda)

      // Cari coda
      const codaStr = ambilCoda(str, i);
      let codaChar = '';
      if (codaStr) {
        codaChar = CODA[codaStr];
        i += codaStr.length;
      }

      // Susun glyph dan kode
      const kode = [hexKode(hurufChar)];
      let glyph = hurufChar;

      if (vokalChar) {
        glyph += vokalChar;
        kode.push(hexKode(vokalChar));
      }
      // Jika tidak ada vokal DAN ada konsonan berikutnya → virama
      else if (!vokalStr && str[i] && str[i] !== ' ' && !TANPA_PADANAN.has(str[i]) && !/[\d.,!?]/.test(str[i])) {
        // Konsonan akhir kata (tanpa vokal) → virama
        // Hanya tambahkan virama jika ini akhir kata atau diikuti konsonan
        const berikutnya = str[i];
        if (berikutnya && ambilOnset(str, i)) {
          // Ada onset berikutnya → konsonan ini mati → virama
          // (tapi ini bisa jadi kasus cluster, biarkan dulu)
        }
      }

      if (codaChar) {
        glyph += codaChar;
        kode.push(hexKode(codaChar));
      }

      // Buat latin tampil yang akurat
      const latinDisplay = onsetStr + (vokalStr || 'a') + (codaStr || '');

      rincian.push({ latin: latinDisplay, glyph, kode });
      continue;
    }

    // ── Karakter tidak dikenal ────────────────────────────────────────────────
    rincian.push({ latin: ch, glyph: ch, kode: [] });
    i++;
  }

  const adaTanpaPadanan = rincian.some(r => r.tanpaPadanan);
  const teksHasil = rincian.map(r => r.glyph).join('');

  return { teks: teksHasil, rincian, adaTanpaPadanan };
}

/**
 * Versi sederhana: hanya kembalikan string glyph.
 * @param {string} teks
 * @returns {string}
 */
export function konversiSederhana(teks) {
  return latinKeKaganga(teks).teks;
}

export default latinKeKaganga;
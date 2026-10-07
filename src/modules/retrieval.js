/**
 * DIAGA — Retrieval lokal (offline search) dari knowledge.json
 * Menggunakan pencarian BM25-sederhana (TF-IDF simplified)
 */

// Diimpor langsung supaya ikut dibundel Vite. Sebelumnya dibaca lewat fetch('/src/data/...'),
// padahal folder src/ tidak ada di hasil build, sehingga pencarian selalu kosong di situs live.
import knowledgeData from '../data/knowledge.json';

const _knowledge = knowledgeData.entri || [];

async function loadKnowledge() {
  return _knowledge;
}

// Stopword Bahasa Indonesia
const STOPWORDS = new Set([
  'dan','di','ke','dari','yang','adalah','ini','itu','dengan','untuk',
  'pada','oleh','dalam','juga','tidak','atau','ya','satu','dua','tiga',
  'bisa','dapat','ada','saya','anda','kamu','kami','kita','mereka','ia',
  'akan','sudah','telah','baru','lebih','seperti','jika','bila','jadi',
  'cara','bagaimana','apa','siapa','kapan','mana',
]);

function tokenize(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Cari 3-5 entri paling relevan dari knowledge base
 * @param {string} query
 * @param {number} top
 * @returns {Promise<Array>}
 */
export async function cariEntri(query, top = 5) {
  const kb = await loadKnowledge();
  if (!kb.length) return [];

  const qTokens = tokenize(query);
  if (!qTokens.length) return [];

  const scored = kb.map(entri => {
    const haystack = tokenize(`${entri.judul} ${entri.isi} ${entri.kategori}`);
    let score = 0;
    qTokens.forEach(qt => {
      // Exact match di judul → bobot lebih tinggi
      if (entri.judul.toLowerCase().includes(qt)) score += 3;
      // Match di isi
      const count = haystack.filter(t => t === qt || t.startsWith(qt)).length;
      score += count;
    });
    return { entri, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, top)
    .map(s => s.entri);
}

/**
 * Format entri menjadi teks konteks untuk AI
 */
export function formatKonteks(entri) {
  return entri.map((e, i) =>
    `[${i + 1}] ${e.judul}\n${e.isi}${e.terverifikasi === false ? ' (belum terverifikasi)' : ''}`
  ).join('\n\n');
}

/**
 * Format sumber untuk ditampilkan di UI
 */
export function formatSumber(entri) {
  return entri.flatMap(e =>
    (e.sumber || []).map(s => ({ label: s.label, url: s.url, terverifikasi: e.terverifikasi }))
  );
}
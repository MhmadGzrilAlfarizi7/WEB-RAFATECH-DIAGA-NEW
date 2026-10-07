/**
 * DIAGA — API Serverless: /api/chat
 * Vercel Functions (Node.js)
 *
 * Alur:
 * 1. Validasi input (maks 500 karakter)
 * 2. Rate limit sederhana per IP (via header)
 * 3. Cek konteks dari knowledge base
 * 4. Jika ada konteks → panggil AI (Anthropic / Gemini via adapter)
 * 5. Jika tidak ada → balas "data tidak cukup"
 *
 * Env vars:
 *   AI_PROVIDER: 'anthropic' | 'gemini' (default: anthropic)
 *   AI_API_KEY: kunci API
 *   AI_MODEL: nama model (default: claude-3-haiku-20240307 / gemini-1.5-flash)
 *
 * Tidak menyimpan log percakapan.
 */

// Rate limit sederhana in-memory (reset saat cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 20;     // maks 20 request per IP per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 menit

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW };

  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + RATE_LIMIT_WINDOW;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);

  return entry.count <= RATE_LIMIT_MAX;
}

// System prompt — bahasa Indonesia, berbasis konteks
const SYSTEM_PROMPT = `Kamu adalah Pemandu Kaganga, asisten untuk DIAGA (Digitalisasi Aksara Kaganga).

Aturan WAJIB:
1. Bersikaplah ramah, sopan, dan luwes. Kamu boleh merespon basa-basi pengguna secara natural sebelum masuk ke topik utama.
2. UTAMAKAN menjawab menggunakan informasi dari [KONTEKS]. Tandai sumber dengan [1], [2], dst. jika menggunakan data konteks.
3. Jika pertanyaan pengguna berada di luar konteks atau konteks kurang lengkap, kamu diperbolehkan melengkapinya menggunakan pengetahuan umum yang relevan seputar kebudayaan, sejarah, dan masyarakat Bengkulu secara akurat.
4. JANGAN menebak tahun, nama, atau makna yang secara eksplisit bertentangan dengan konteks.
5. JANGAN menghasilkan karakter aksara secara mandiri – hanya jelaskan informasi tentang aksara.
6. Arahkan percakapan kembali ke topik aksara, batik, atau budaya Rejang/Bengkulu secara halus dan bersahabat.
7. Jika konteks menandai "belum terverifikasi", sampaikan itu kepada pengguna dengan bahasa yang santai.
8. Jawab dengan gaya percakapan yang alami (maks 200 kata) dalam Bahasa Indonesia.;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.' });
  }

  // Validasi input
  const { pesan, konteks } = req.body || {};

  if (!pesan || typeof pesan !== 'string') {
    return res.status(400).json({ error: 'Pesan tidak valid.' });
  }

  if (pesan.length > 500) {
    return res.status(400).json({ error: 'Pesan terlalu panjang (maks 500 karakter).' });
  }

  if (!konteks || typeof konteks !== 'string' || konteks.trim().length < 10) {
    return res.status(200).json({
      jawaban: 'Saya belum punya data yang cukup tentang itu. Untuk informasi lebih lanjut, ' +
        'coba tanya langsung ke pengrajin di Arumbatik Roemah atau lembaga budaya setempat.',
    });
  }

  // Escape input
  const pesanAman = pesan.replace(/[<>]/g, '');

  // Panggil AI
  const provider = process.env.AI_PROVIDER || 'anthropic';
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!apiKey) {
    return res.status(500).json({ error: 'Konfigurasi server tidak lengkap.' });
  }

  try {
    let jawaban;

    if (provider === 'anthropic') {
      jawaban = await panggilAnthropic(pesanAman, konteks, apiKey, model);
    } else if (provider === 'gemini') {
      jawaban = await panggilGemini(pesanAman, konteks, apiKey, model);
    } else {
      return res.status(500).json({ error: 'Provider AI tidak dikenali.' });
    }

    return res.status(200).json({ jawaban });

  } catch (err) {
    console.error('[DIAGA API] Error:', err.message);
    return res.status(500).json({ error: 'Layanan AI sementara tidak tersedia.' });
  }
}

async function panggilAnthropic(pesan, konteks, apiKey, model) {
  const modelName = model || 'claude-3-haiku-20240307';
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `[KONTEKS]\n${konteks}\n\n[PERTANYAAN]\n${pesan}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || 'Tidak ada respons dari AI.';
}

async function panggilGemini(pesan, konteks, apiKey, model) {
  const modelName = model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: `[KONTEKS]\n${konteks}\n\n[PERTANYAAN]\n${pesan}` }],
        },
      ],
      generationConfig: { maxOutputTokens: 512 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada respons dari AI.';
}
/**
 * DIAGA — API Serverless: /api/chat
 * Vercel Functions (Node.js)
 */

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

// System prompt — ramah, luwes, dan berbasis konteks
const SYSTEM_PROMPT = `Kamu adalah Pemandu Kaganga, asisten ramah untuk DIAGA (Digitalisasi Aksara Kaganga).

Aturan WAJIB:
1. Bersikaplah ramah, sopan, dan luwes. Kamu boleh merespon basa-basi atau sapaan pengguna secara natural.
2. UTAMAKAN menjawab menggunakan informasi dari [KONTEKS] jika tersedia. Tandai sumber dengan [1], [2], dst.
3. Jika [KONTEKS] kosong, kurang lengkap, atau pertanyaan berada di luar konteks, kamu diperbolehkan melengkapinya menggunakan pengetahuan umum yang relevan seputar kebudayaan, sejarah, dan masyarakat Bengkulu secara akurat.
4. JANGAN menebak tahun, nama, atau makna yang secara eksplisit bertentangan dengan konteks.
5. JANGAN menghasilkan karakter aksara secara mandiri – hanya jelaskan informasi tentang aksara.
6. Arahkan percakapan kembali ke topik aksara, batik, atau budaya Rejang/Bengkulu secara halus dan bersahabat.
7. Jawab dengan gaya percakapan yang alami (maks 200 kata) dalam Bahasa Indonesia.`;

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

  // Siapkan konteks teks (jika kosong, beritahu AI bahwa konteks lokal tidak ada)
  const konteksBersih = (konteks && typeof konteks === 'string' && konteks.trim().length >= 10)
    ? konteks.trim()
    : 'Tidak ada konteks khusus dari database lokal.';

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
      jawaban = await panggilAnthropic(pesanAman, konteksBersih, apiKey, model);
    } else if (provider === 'gemini') {
      jawaban = await panggilGemini(pesanAman, konteksBersih, apiKey, model);
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
/**
 * DIAGA — Halaman Belajar Aksara (belajar.js)
 * Galeri, Konverter, Kuis Adaptif
 */
import { initLayout, initParticles, escHtml, copyText, checkDemoMode } from '../modules/common.js';
import { latinKeKaganga } from '../modules/converter.js';
import { ANGKA, ambilAngka, buatSvgAngka, parseAngka, pesanDiLuar, labelAngka } from '../modules/angka.js';

// ── Data aksara ─────────────────────────────────────────────────────────────
const HURUF_DATA = [
  { kode:'A930', char:'\uA930', latin:'ka', bunyi:'Ka seperti kata "kala"' },
  { kode:'A931', char:'\uA931', latin:'ga', bunyi:'Ga seperti kata "gajah"' },
  { kode:'A932', char:'\uA932', latin:'nga', bunyi:'Nga seperti kata "nganga"' },
  { kode:'A933', char:'\uA933', latin:'ta', bunyi:'Ta seperti kata "tala"' },
  { kode:'A934', char:'\uA934', latin:'da', bunyi:'Da seperti kata "dara"' },
  { kode:'A935', char:'\uA935', latin:'na', bunyi:'Na seperti kata "naga"' },
  { kode:'A936', char:'\uA936', latin:'pa', bunyi:'Pa seperti kata "padi"' },
  { kode:'A937', char:'\uA937', latin:'ba', bunyi:'Ba seperti kata "batu"' },
  { kode:'A938', char:'\uA938', latin:'ma', bunyi:'Ma seperti kata "madu"' },
  { kode:'A939', char:'\uA939', latin:'ca', bunyi:'Ca seperti kata "cakra"' },
  { kode:'A93A', char:'\uA93A', latin:'ja', bunyi:'Ja seperti kata "jala"' },
  { kode:'A93B', char:'\uA93B', latin:'nya', bunyi:'Nya seperti kata "nyala"' },
  { kode:'A93C', char:'\uA93C', latin:'sa', bunyi:'Sa seperti kata "satu"' },
  { kode:'A93D', char:'\uA93D', latin:'ra', bunyi:'Ra seperti kata "raja"' },
  { kode:'A93E', char:'\uA93E', latin:'la', bunyi:'La seperti kata "laut"' },
  { kode:'A93F', char:'\uA93F', latin:'ya', bunyi:'Ya seperti kata "yakin"' },
  { kode:'A940', char:'\uA940', latin:'wa', bunyi:'Wa seperti kata "waja"' },
  { kode:'A941', char:'\uA941', latin:'ha', bunyi:'Ha seperti kata "hari"' },
  { kode:'A942', char:'\uA942', latin:'mba', bunyi:'Mba — onset konsonan rangkap mb' },
  { kode:'A943', char:'\uA943', latin:'ngga', bunyi:'Ngga — onset konsonan rangkap ngg' },
  { kode:'A944', char:'\uA944', latin:'nda', bunyi:'Nda — onset konsonan rangkap nd' },
  { kode:'A945', char:'\uA945', latin:'nyja', bunyi:'Nyja — onset konsonan rangkap nyj' },
  { kode:'A946', char:'\uA946', latin:'a', bunyi:'A murni, untuk kata berawalan vokal' },
];

const VOKAL_DATA = [
  { kode:'A947', char:'\uA947', latin:'i', bunyi:'Vokal i' },
  { kode:'A948', char:'\uA948', latin:'u', bunyi:'Vokal u' },
  { kode:'A949', char:'\uA949', latin:'e', bunyi:'Vokal e (pepet — perlu validasi narasumber)' },
  { kode:'A94A', char:'\uA94A', latin:'ai', bunyi:'Diftong ai' },
  { kode:'A94B', char:'\uA94B', latin:'o', bunyi:'Vokal o' },
  { kode:'A94C', char:'\uA94C', latin:'au', bunyi:'Diftong au' },
  { kode:'A94D', char:'\uA94D', latin:'eu', bunyi:'Vokal eu' },
  { kode:'A94E', char:'\uA94E', latin:'ea', bunyi:'Diftong ea' },
];

const CODA_DATA = [
  { kode:'A94F', char:'\uA94F', latin:'ng', bunyi:'Konsonan akhir ng' },
  { kode:'A950', char:'\uA950', latin:'n', bunyi:'Konsonan akhir n' },
  { kode:'A951', char:'\uA951', latin:'r', bunyi:'Konsonan akhir r' },
  { kode:'A952', char:'\uA952', latin:'h', bunyi:'Konsonan akhir h' },
];

// ── State detail aksara ──────────────────────────────────────────────────────
let currentDetailIdx = 0;

// ── Main ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  initParticles();
  checkFont();
  buildGallery();
  buildVokalGrid();
  buildCodaGrid();
  initDetail();
  initConverter();
  initAngka();
  initQuiz();

  if (checkDemoMode()) {
    const inp = document.getElementById('latinInput');
    if (inp) { inp.value = 'Rejang Lebong'; inp.dispatchEvent(new Event('input')); }
  }
});

// ── Font check ────────────────────────────────────────────────────────────────
async function checkFont() {
  const status = document.getElementById('fontStatus');
  if (!status) return;
  try {
    await document.fonts.load('1rem "Noto Sans Rejang"');
    const loaded = document.fonts.check('1rem "Noto Sans Rejang"');
    if (loaded) {
      status.textContent = '✓ Font Aksara Rejang termuat.';
      status.style.color = 'var(--c-emerald)';
    } else {
      status.textContent = '⚠ Font aksara belum termuat — huruf mungkin tampil sebagai kotak.';
      status.style.color = 'rgba(255,200,50,.8)';
    }
  } catch {
    status.textContent = '⚠ Tidak bisa mengecek status font.';
  }
}

// ── Galeri huruf ──────────────────────────────────────────────────────────────
function buildGallery() {
  const grid = document.getElementById('aksaraGrid');
  if (!grid) return;
  grid.innerHTML = '';

  HURUF_DATA.forEach((aksara, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'aksara-cell-wrap';
    wrap.style.animationDelay = `${(idx % 5) * .4}s`;

    const cell = document.createElement('div');
    cell.className = 'aksara-cell';
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `${aksara.latin}: ${aksara.bunyi}`);
    cell.dataset.idx = idx;

    const charEl = document.createElement('span');
    charEl.className = 'aksara-char';
    charEl.textContent = aksara.char;
    charEl.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'aksara-label';
    label.textContent = aksara.latin;

    cell.appendChild(charEl);
    cell.appendChild(label);
    wrap.appendChild(cell);
    grid.appendChild(wrap);

    cell.addEventListener('click', () => openDetail(idx));
    cell.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(idx); }
    });
  });
}

function buildVokalGrid() {
  const grid = document.getElementById('vokalGrid');
  if (!grid) return;
  VOKAL_DATA.forEach(v => {
    const chip = document.createElement('div');
    chip.className = 'syllable-chip';
    chip.setAttribute('title', v.bunyi);
    chip.innerHTML = `<span class="glyph">${escHtml(v.char)}</span><span class="latin">${escHtml(v.latin)}</span><span class="kode">U+${v.kode}</span>`;
    grid.appendChild(chip);
  });
}

function buildCodaGrid() {
  const grid = document.getElementById('codaGrid');
  if (!grid) return;
  CODA_DATA.forEach(c => {
    const chip = document.createElement('div');
    chip.className = 'syllable-chip';
    chip.setAttribute('title', c.bunyi);
    chip.innerHTML = `<span class="glyph">${escHtml(c.char)}</span><span class="latin">-${escHtml(c.latin)}</span><span class="kode">U+${c.kode}</span>`;
    grid.appendChild(chip);
  });
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function initDetail() {
  const panel = document.getElementById('aksaraDetail');
  const closeBtn = document.getElementById('closeDetail');
  const prevBtn = document.getElementById('detailPrev');
  const nextBtn = document.getElementById('detailNext');
  const speechBtn = document.getElementById('detailSpeech');
  const copyBtn = document.getElementById('detailCopy');
  if (!panel) return;

  closeBtn?.addEventListener('click', closeDetail);
  panel.addEventListener('click', e => { if (e.target === panel) closeDetail(); });
  document.addEventListener('keydown', e => {
    if (!panel.classList.contains('open')) return;
    if (e.key === 'Escape') closeDetail();
    if (e.key === 'ArrowLeft') { currentDetailIdx = (currentDetailIdx - 1 + HURUF_DATA.length) % HURUF_DATA.length; renderDetail(); }
    if (e.key === 'ArrowRight') { currentDetailIdx = (currentDetailIdx + 1) % HURUF_DATA.length; renderDetail(); }
  });

  prevBtn?.addEventListener('click', () => {
    currentDetailIdx = (currentDetailIdx - 1 + HURUF_DATA.length) % HURUF_DATA.length;
    renderDetail();
  });

  nextBtn?.addEventListener('click', () => {
    currentDetailIdx = (currentDetailIdx + 1) % HURUF_DATA.length;
    renderDetail();
  });

  speechBtn?.addEventListener('click', () => {
    const aksara = HURUF_DATA[currentDetailIdx];
    if (!aksara) return;
    const utt = new SpeechSynthesisUtterance(aksara.latin);
    utt.lang = 'id-ID';
    speechSynthesis.speak(utt);
  });

  copyBtn?.addEventListener('click', () => {
    const aksara = HURUF_DATA[currentDetailIdx];
    if (aksara) copyText(aksara.char, copyBtn);
  });
}

function openDetail(idx) {
  currentDetailIdx = idx;
  renderDetail();
  const panel = document.getElementById('aksaraDetail');
  panel?.classList.add('open');
  panel?.setAttribute('aria-hidden', 'false');
  document.getElementById('closeDetail')?.focus();
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  const panel = document.getElementById('aksaraDetail');
  panel?.classList.remove('open');
  panel?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderDetail() {
  const aksara = HURUF_DATA[currentDetailIdx];
  if (!aksara) return;
  const glyphEl = document.getElementById('detailGlyph');
  const titleEl = document.getElementById('detailTitle');
  const bunyiEl = document.getElementById('detailBunyi');
  const kodeEl = document.getElementById('detailKode');
  const catEl = document.getElementById('detailCatatan');

  if (glyphEl) glyphEl.textContent = aksara.char;
  if (titleEl) titleEl.textContent = aksara.latin.charAt(0).toUpperCase() + aksara.latin.slice(1);
  if (bunyiEl) bunyiEl.textContent = aksara.bunyi;
  if (kodeEl) kodeEl.textContent = 'U+' + aksara.kode;
  if (catEl) catEl.textContent = aksara.kode === 'A949' ? '⚠ Vokal e — perlu validasi: pepet vs taleng' : '';
}

// ── Konverter ─────────────────────────────────────────────────────────────────
function initConverter() {
  const input = document.getElementById('latinInput');
  const output = document.getElementById('kagangaOutput');
  const syllDiv = document.getElementById('syllableDetail');
  const copyBtn = document.getElementById('copyOutput');

  if (!input || !output) return;

  function doConvert() {
    const val = input.value.trim();
    if (!val) {
      output.innerHTML = '<span style="color:var(--c-text-dim);font-size:1rem;font-family:var(--font-body);">Hasil akan muncul di sini…</span>';
      output.classList.remove('has-content');
      if (syllDiv) syllDiv.innerHTML = '';
      return;
    }

    const hasil = latinKeKaganga(val);
    output.textContent = hasil.teks;
    output.classList.add('has-content');

    // Render rincian per suku kata
    if (syllDiv) {
      syllDiv.innerHTML = '';
      hasil.rincian.forEach(r => {
        if (r.latin === ' ') return;
        const chip = document.createElement('div');
        chip.className = 'syllable-chip' + (r.tanpaPadanan ? ' no-match' : '');
        const kodeStr = r.kode.join(' ');
        chip.innerHTML = `<span class="glyph">${escHtml(r.glyph)}</span><span class="latin">${escHtml(r.latin)}</span><span class="kode">${escHtml(kodeStr)}</span>`;
        if (r.pesan) {
          chip.setAttribute('title', r.pesan);
        }
        syllDiv.appendChild(chip);
      });
    }
  }

  input.addEventListener('input', doConvert);
  input.addEventListener('paste', () => requestAnimationFrame(doConvert));

  copyBtn?.addEventListener('click', () => {
    const val = output.textContent.trim();
    if (val) copyText(val, copyBtn);
  });

  // Contoh cepat
  document.querySelectorAll('.example-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.val || '';
      doConvert();
      input.focus();
    });
  });
}

// ── Kuis Adaptif (Leitner) ────────────────────────────────────────────────────
const TOTAL_SOAL = 10;
let quizMode = 'huruf-bunyi';
let quizActive = false;
let soalIdx = 0;
let skor = 0;
let streak = 0;
let currentSoal = null;

// Leitner box — sederhana: index huruf → berapa kali salah
function loadLeitner() {
  try {
    const raw = localStorage.getItem('diaga-leitner');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLeitner(data) {
  try { localStorage.setItem('diaga-leitner', JSON.stringify(data)); } catch (_) {}
}

function pilihSoal(leitner) {
  // Bobot: huruf yang lebih sering salah muncul lebih sering
  const weights = HURUF_DATA.map((_, i) => 1 + (leitner[i] || 0) * 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return Math.floor(Math.random() * HURUF_DATA.length);
}

function buatPilihan(benarIdx, mode) {
  const salahIdxArr = [];
  while (salahIdxArr.length < 3) {
    const r = Math.floor(Math.random() * HURUF_DATA.length);
    if (r !== benarIdx && !salahIdxArr.includes(r)) salahIdxArr.push(r);
  }
  const semua = [benarIdx, ...salahIdxArr].sort(() => Math.random() - .5);
  return semua.map(idx => {
    const h = HURUF_DATA[idx];
    return {
      idx,
      label: mode === 'huruf-bunyi' ? h.bunyi : h.char,
      isChar: mode !== 'huruf-bunyi',
    };
  });
}

function initQuiz() {
  const startBtn = document.getElementById('quizStart');
  const nextBtn = document.getElementById('quizNext');
  const skipBtn = document.getElementById('quizSkip');
  const resetBtn = document.getElementById('quizReset');
  const writeSubmit = document.getElementById('quizWriteSubmit');

  document.querySelectorAll('.quiz-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quiz-mode-btn').forEach(b => b.classList.remove('active-mode'));
      btn.classList.add('active-mode');
      quizMode = btn.dataset.mode;
      if (quizActive) { soalIdx = 0; skor = 0; streak = 0; tampilSoal(); }
    });
  });

  startBtn?.addEventListener('click', () => {
    quizActive = true;
    soalIdx = 0; skor = 0; streak = 0;
    updateStats();
    tampilSoal();
    startBtn.style.display = 'none';
    nextBtn.style.display = '';
    skipBtn.style.display = '';
  });

  nextBtn?.addEventListener('click', tampilSoal);
  skipBtn?.addEventListener('click', () => {
    const leitner = loadLeitner();
    if (currentSoal !== null) { leitner[currentSoal] = (leitner[currentSoal] || 0) + 1; saveLeitner(leitner); }
    streak = 0;
    soalIdx++;
    tampilSoal();
  });

  resetBtn?.addEventListener('click', () => {
    saveLeitner({});
    quizActive = false;
    soalIdx = 0; skor = 0; streak = 0;
    updateStats();
    document.getElementById('quizOptions').innerHTML = '';
    document.getElementById('quizGlyph').textContent = '';
    document.getElementById('quizPrompt').textContent = '';
    document.getElementById('quizFeedback').textContent = '';
    startBtn.style.display = '';
    nextBtn.disabled = true;
  });

  writeSubmit?.addEventListener('click', cekJawabanTulis);
  document.getElementById('quizWriteInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') cekJawabanTulis();
  });
}

function tampilSoal() {
  if (soalIdx >= TOTAL_SOAL) {
    selesaiKuis();
    return;
  }

  const nextBtn = document.getElementById('quizNext');
  const writeArea = document.getElementById('quizWriteArea');
  const optionsEl = document.getElementById('quizOptions');
  const feedback = document.getElementById('quizFeedback');
  const glyphEl = document.getElementById('quizGlyph');
  const promptEl = document.getElementById('quizPrompt');

  const leitner = loadLeitner();
  const benarIdx = pilihSoal(leitner);
  currentSoal = benarIdx;
  const aksara = HURUF_DATA[benarIdx];

  feedback.textContent = '';
  if (nextBtn) nextBtn.disabled = true;

  // Progress bar
  const bar = document.getElementById('quizProgress');
  if (bar) bar.style.width = `${(soalIdx / TOTAL_SOAL) * 100}%`;

  if (quizMode === 'tulis') {
    // Mode tulis: tampilkan aksara, minta tulis Latin
    if (glyphEl) glyphEl.textContent = aksara.char;
    if (promptEl) promptEl.textContent = 'Apa transliterasi Latin dari aksara ini?';
    if (optionsEl) optionsEl.innerHTML = '';
    if (writeArea) writeArea.style.display = '';
    const writeInp = document.getElementById('quizWriteInput');
    if (writeInp) { writeInp.value = ''; writeInp.focus(); }
  } else {
    if (writeArea) writeArea.style.display = 'none';

    if (quizMode === 'huruf-bunyi') {
      // Tampilkan huruf, pilih bunyi
      if (glyphEl) glyphEl.textContent = aksara.char;
      if (promptEl) promptEl.textContent = 'Aksara ini dibaca…';
    } else {
      // Tampilkan bunyi (teks), pilih huruf
      if (glyphEl) { glyphEl.style.fontFamily = 'var(--font-body)'; glyphEl.style.fontSize = '1.8rem'; glyphEl.textContent = aksara.latin; }
      if (promptEl) promptEl.textContent = 'Pilih aksara yang sesuai:';
    }

    const pilihan = buatPilihan(benarIdx, quizMode);
    if (optionsEl) {
      optionsEl.innerHTML = '';
      pilihan.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.style.fontFamily = p.isChar ? 'var(--font-rejang),serif' : 'var(--font-body)';
        btn.style.fontSize = p.isChar ? '2rem' : '.9rem';
        btn.textContent = p.label;
        btn.addEventListener('click', () => cekJawaban(p.idx === benarIdx, btn, optionsEl, benarIdx, pilihan));
        optionsEl.appendChild(btn);
      });
    }
  }

  updateStats();
}

function cekJawaban(benar, clickedBtn, optionsEl, benarIdx, pilihan) {
  const feedback = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNext');

  // Disable semua tombol
  optionsEl.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);

  if (benar) {
    clickedBtn.classList.add('correct');
    skor++;
    streak++;
    if (feedback) { feedback.textContent = `✓ Benar! ${HURUF_DATA[benarIdx].bunyi}`; feedback.style.color = 'var(--c-emerald)'; }
  } else {
    clickedBtn.classList.add('wrong');
    streak = 0;
    const leitner = loadLeitner();
    leitner[benarIdx] = (leitner[benarIdx] || 0) + 1;
    saveLeitner(leitner);
    // Tandai jawaban benar
    pilihan.forEach(p => {
      if (p.idx === benarIdx) {
        optionsEl.querySelectorAll('.quiz-option').forEach(b => {
          if (b.textContent === p.label) b.classList.add('correct');
        });
      }
    });
    if (feedback) {
      const aksara = HURUF_DATA[benarIdx];
      feedback.textContent = `✗ Jawaban: ${aksara.latin} — ${aksara.bunyi}`;
      feedback.style.color = 'rgba(255,120,120,.9)';
    }
  }

  soalIdx++;
  if (nextBtn) nextBtn.disabled = false;
  updateStats();
}

function cekJawabanTulis() {
  const inp = document.getElementById('quizWriteInput');
  const feedback = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNext');
  if (!inp || currentSoal === null) return;

  const jawaban = inp.value.trim().toLowerCase();
  const aksara = HURUF_DATA[currentSoal];
  const benar = jawaban === aksara.latin.toLowerCase();

  if (benar) {
    skor++;
    streak++;
    if (feedback) { feedback.textContent = `✓ Benar!`; feedback.style.color = 'var(--c-emerald)'; }
  } else {
    streak = 0;
    const leitner = loadLeitner();
    leitner[currentSoal] = (leitner[currentSoal] || 0) + 1;
    saveLeitner(leitner);
    if (feedback) {
      feedback.textContent = `✗ Jawaban: ${aksara.latin}`;
      feedback.style.color = 'rgba(255,120,120,.9)';
    }
  }

  inp.disabled = true;
  soalIdx++;
  if (nextBtn) nextBtn.disabled = false;
  updateStats();
}

function updateStats() {
  const scoreEl = document.getElementById('quizScore');
  const streakEl = document.getElementById('quizStreak');
  const countEl = document.getElementById('quizCount');
  if (scoreEl) scoreEl.textContent = skor;
  if (streakEl) streakEl.textContent = streak;
  if (countEl) countEl.textContent = `${Math.min(soalIdx, TOTAL_SOAL)}/${TOTAL_SOAL}`;
}

function selesaiKuis() {
  const feedback = document.getElementById('quizFeedback');
  const glyphEl = document.getElementById('quizGlyph');
  const promptEl = document.getElementById('quizPrompt');
  const nextBtn = document.getElementById('quizNext');
  const startBtn = document.getElementById('quizStart');
  const optionsEl = document.getElementById('quizOptions');
  const writeArea = document.getElementById('quizWriteArea');

  if (glyphEl) { glyphEl.style.fontSize = '3rem'; glyphEl.textContent = skor >= 7 ? '🏆' : '📚'; }
  if (promptEl) promptEl.textContent = `Selesai! Skor: ${skor}/${TOTAL_SOAL}`;
  if (feedback) {
    feedback.textContent = skor >= 7 ? 'Hebat! Kamu menguasai aksara dengan baik.' : 'Terus berlatih — progres tersimpan otomatis.';
    feedback.style.color = skor >= 7 ? 'var(--c-emerald)' : 'var(--c-text-muted)';
  }
  if (optionsEl) optionsEl.innerHTML = '';
  if (writeArea) writeArea.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';
  if (startBtn) { startBtn.style.display = ''; startBtn.textContent = 'Main Lagi'; }
  quizActive = false;

  const bar = document.getElementById('quizProgress');
  if (bar) bar.style.width = '100%';
}

// ── Angka Kaganga ─────────────────────────────────────────────────────────────
function initAngka() {
  const grid = document.getElementById('angkaGrid');
  const preview = document.getElementById('angkaPreview');
  const input = document.getElementById('angkaInput');
  const namaEl = document.getElementById('angkaNama');
  const bentukEl = document.getElementById('angkaBentuk');
  const pesanEl = document.getElementById('angkaPesan');
  if (!grid || !preview || !input) return;

  const kartu = new Map();

  function pilih(n) {
    const a = ambilAngka(n);
    if (!a) return;

    preview.replaceChildren();
    const svg = buatSvgAngka(n, { kelas: 'angka-svg-besar' });
    if (svg) preview.appendChild(svg);
    preview.setAttribute('aria-label', labelAngka(a));

    if (namaEl) namaEl.textContent = `${a.angka} · ${a.nama}`;
    if (bentukEl) bentukEl.textContent = a.bentuk;
    if (pesanEl) pesanEl.textContent = '';

    kartu.forEach((btn, key) => {
      const aktif = key === n;
      btn.classList.toggle('active', aktif);
      btn.setAttribute('aria-pressed', String(aktif));
    });
  }

  ANGKA.forEach(a => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'glass angka-card';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `Angka ${a.angka}, ${a.nama}`);

    const svg = buatSvgAngka(a.angka, { dekoratif: true });
    const label = document.createElement('span');
    label.className = 'angka-card-label';
    label.textContent = `${a.angka} · ${a.nama}`;
    btn.append(svg, label);

    btn.addEventListener('click', () => { input.value = String(a.angka); pilih(a.angka); });
    grid.appendChild(btn);
    kartu.set(a.angka, btn);
  });

  input.addEventListener('input', () => {
    const teks = input.value;
    if (!teks.trim()) { if (pesanEl) pesanEl.textContent = ''; return; }
    const n = parseAngka(teks);
    if (n) pilih(n);
    else if (pesanEl) pesanEl.textContent = pesanDiLuar(teks);
  });

  pilih(1);
}

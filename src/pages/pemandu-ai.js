/**
 * DIAGA — Pemandu AI (pemandu-ai.js)
 * Mode online: fetch ke /api/chat
 * Mode offline: cari dari knowledge.json lokal
 */
import { initLayout, initParticles, escHtml, checkDemoMode } from '../modules/common.js';
import { cariEntri, formatKonteks, formatSumber } from '../modules/retrieval.js';

// ── Riwayat percakapan (hanya pesan user, tidak percaya pesan assistant dari klien) ──
let riwayat = [];
let sedangKirim = false;

document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  initParticles();
  initChat();

  if (checkDemoMode()) {
    const inp = document.getElementById('chatInput');
    if (inp) { inp.value = 'Apa itu Aksara Kaganga?'; }
  }
});

function initChat() {
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatReset = document.getElementById('chatReset');

  chatSend?.addEventListener('click', kirim);
  chatInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirim(); }
  });

  chatReset?.addEventListener('click', () => {
    riwayat = [];
    const area = document.getElementById('chatMessages');
    if (area) area.innerHTML = tampilWelcome();
  });

  document.querySelectorAll('.quick-q').forEach(btn => {
    btn.addEventListener('click', () => {
      if (chatInput) chatInput.value = btn.dataset.q || '';
      kirim();
    });
  });
}

function tampilWelcome() {
  return `<div class="chat-msg">
    <div class="chat-avatar ai" aria-hidden="true">AI</div>
    <div class="chat-bubble ai">
      <p>Halo! Saya Pemandu Kaganga. 👋</p>
      <p style="margin-top:.5rem;color:var(--c-text-muted);font-size:.85rem;">
        Tanyakan tentang Aksara Kaganga, Batik Kaganga, atau budaya Rejang Bengkulu.
      </p>
    </div>
  </div>`;
}

async function kirim() {
  if (sedangKirim) return;
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const status = document.getElementById('chatStatus');

  const pesan = chatInput?.value.trim();
  if (!pesan || !chatInput) return;

  // Batasi panjang input
  if (pesan.length > 500) {
    tampilPesan('ai', 'Pertanyaan terlalu panjang (maks 500 karakter). Coba lebih singkat.');
    return;
  }

  chatInput.value = '';
  tampilPesanUser(pesan);

  sedangKirim = true;
  if (chatSend) chatSend.disabled = true;
  if (chatInput) chatInput.disabled = true;

  const typingId = tampilTyping();

  try {
    // Cari konteks lokal dulu
    const entri = await cariEntri(pesan, 5);
    const konteks = formatKonteks(entri);
    const sumber = formatSumber(entri);

    let respons;

    if (!konteks) {
      // Tidak ada konteks → tidak panggil AI
      hapusTyping(typingId);
      tampilPesanAI(
        'Saya belum punya data yang cukup tentang itu. Untuk informasi lebih lanjut, ' +
        'coba tanya langsung ke perajin di Arumbatik Roemah atau lembaga budaya setempat.',
        [],
        false
      );
    } else {
      // Coba online dulu
      try {
        respons = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pesan,
            konteks,
            riwayat: riwayat.slice(-6), // kirim maks 6 pesan terakhir
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!respons.ok) throw new Error(`HTTP ${respons.status}`);

        const data = await respons.json();
        hapusTyping(typingId);

        if (data.jawaban) {
          riwayat.push({ pesan, jawaban: data.jawaban });
          tampilPesanAI(data.jawaban, sumber, false);
          if (status) status.textContent = '';
        } else {
          throw new Error('Respons kosong');
        }
      } catch (err) {
        // Mode offline
        hapusTyping(typingId);
        const jawabanOffline = jawabanLokal(pesan, entri);
        tampilPesanAI(jawabanOffline, sumber, true);
        if (status) {
          status.textContent = '📴 Mode offline — dijawab dari data lokal. Server tidak terjangkau.';
        }
      }
    }
  } catch (err) {
    hapusTyping(typingId);
    tampilPesanAI('Terjadi kesalahan. Coba lagi dalam beberapa saat.', [], false);
  } finally {
    sedangKirim = false;
    if (chatSend) chatSend.disabled = false;
    if (chatInput) { chatInput.disabled = false; chatInput.focus(); }
  }
}

function jawabanLokal(pesan, entri) {
  if (!entri.length) {
    return 'Saya belum punya data yang cukup tentang itu. ' +
      'Coba tanya hal lain tentang Aksara Kaganga, Batik Kaganga, atau Arumbatik Roemah.';
  }
  const top = entri[0];
  return `${top.judul}\n\n${top.isi}${top.terverifikasi === false ? '\n\n(Catatan: informasi ini belum sepenuhnya terverifikasi.)' : ''}`;
}

function tampilPesanUser(pesan) {
  const area = document.getElementById('chatMessages');
  if (!area) return;
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML = `
    <div class="chat-avatar user-av" aria-hidden="true">U</div>
    <div class="chat-bubble user-b">${escHtml(pesan)}</div>
  `;
  area.appendChild(div);
  animasiMasuk(div);
  area.scrollTop = area.scrollHeight;
}

function tampilTyping() {
  const area = document.getElementById('chatMessages');
  if (!area) return null;
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.id = id;
  div.innerHTML = `
    <div class="chat-avatar ai" aria-hidden="true">AI</div>
    <div class="chat-bubble ai"><div class="typing-dots"><span></span><span></span><span></span></div></div>
  `;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  return id;
}

function hapusTyping(id) {
  if (!id) return;
  document.getElementById(id)?.remove();
}

function tampilPesanAI(teks, sumber, isOffline) {
  const area = document.getElementById('chatMessages');
  if (!area) return;

  const div = document.createElement('div');
  div.className = 'chat-msg';

  // Render teks aman: gunakan textContent, hanya bold
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble ai';

  // Render per baris
  const paragraf = teks.split('\n').filter(l => l.trim());
  paragraf.forEach(line => {
    const p = document.createElement('p');
    p.style.marginBottom = '.4rem';
    // Bold: **text** → <strong>text</strong> — di-escape dulu
    const safe = escHtml(line);
    p.innerHTML = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    bubble.appendChild(p);
  });

  // Sumber
  if (sumber && sumber.length) {
    const srcDiv = document.createElement('div');
    srcDiv.className = 'chat-sources';
    srcDiv.appendChild(document.createTextNode('Dasar jawaban: '));
    sumber.slice(0, 3).forEach((s, i) => {
      if (i) srcDiv.appendChild(document.createTextNode(' · '));
      if (s.url) {
        const a = document.createElement('a');
        a.href = escHtml(s.url);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = s.label;
        srcDiv.appendChild(a);
      } else {
        srcDiv.appendChild(document.createTextNode(s.label));
      }
      if (s.terverifikasi === false) {
        const badge = document.createElement('span');
        badge.className = 'badge-unverified';
        badge.textContent = '⚠ belum terverifikasi';
        srcDiv.appendChild(badge);
      }
    });
    bubble.appendChild(srcDiv);
  }

  // Mode offline badge
  if (isOffline) {
    const badge = document.createElement('span');
    badge.className = 'badge-offline';
    badge.style.display = 'block';
    badge.style.marginTop = '.5rem';
    badge.textContent = '📴 Mode offline';
    bubble.appendChild(badge);
  }

  div.innerHTML = `<div class="chat-avatar ai" aria-hidden="true">AI</div>`;
  div.appendChild(bubble);
  area.appendChild(div);
  animasiMasuk(div);
  area.scrollTop = area.scrollHeight;
}

function tampilPesan(sender, teks) {
  if (sender === 'ai') tampilPesanAI(teks, [], false);
  else tampilPesanUser(teks);
}

function animasiMasuk(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(10px)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity .35s ease, transform .35s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
}
/**
 * DIAGA — Partial HTML untuk header dan footer
 * Di-inject via JS ke semua halaman
 */

export const NAV_HTML = `
<a class="skip-link" href="#main-content">Langsung ke konten utama</a>
<nav id="navbar" role="navigation" aria-label="Navigasi utama">
  <div class="nav-inner">
    <a href="/" class="nav-logo" aria-label="DIAGA beranda">DIAGA</a>
    <ul class="nav-links" role="list">
      <li><a href="/" class="nav-link">Beranda</a></li>
      <li><a href="/pages/belajar.html" class="nav-link">Belajar Aksara</a></li>
      <li><a href="/pages/pemandu-ai.html" class="nav-link">Pemandu AI</a></li>
      <li><a href="/pages/batik.html" class="nav-link">Batik Kaganga</a></li>
      <li><a href="/pages/sentra-kreatif.html" class="nav-link">Sentra Kreatif</a></li>
      <li><a href="/pages/tentang.html" class="nav-link">Tentang</a></li>
    </ul>
    <div class="nav-actions">
      <button class="theme-toggle" id="themeToggle" aria-label="Ganti tema terang/gelap" title="Ganti tema">☾</button>
      <button id="menuBtn" aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="mobileMenu">
        <span aria-hidden="true">☰</span>
      </button>
    </div>
  </div>
  <div id="mobileMenu" role="list" aria-label="Menu navigasi mobile">
    <a href="/" class="nav-link" role="listitem">Beranda</a>
    <a href="/pages/belajar.html" class="nav-link" role="listitem">Belajar Aksara</a>
    <a href="/pages/pemandu-ai.html" class="nav-link" role="listitem">Pemandu AI</a>
    <a href="/pages/batik.html" class="nav-link" role="listitem">Batik Kaganga</a>
    <a href="/pages/sentra-kreatif.html" class="nav-link" role="listitem">Sentra Kreatif</a>
    <a href="/pages/tentang.html" class="nav-link" role="listitem">Tentang</a>
  </div>
</nav>
`;

export const FOOTER_HTML = `
<footer role="contentinfo">
  <div class="container">
    <p class="footer-logo">DIAGA</p>
    <p style="color:var(--c-text-muted);font-size:.88rem;">Digitalisasi Aksara Kaganga — Melestarikan Budaya Rejang Bengkulu</p>
    <ul class="footer-links">
      <li><a href="/">Beranda</a></li>
      <li><a href="/pages/belajar.html">Belajar Aksara</a></li>
      <li><a href="/pages/pemandu-ai.html">Pemandu AI</a></li>
      <li><a href="/pages/batik.html">Batik Kaganga</a></li>
      <li><a href="/pages/sentra-kreatif.html">Sentra Kreatif</a></li>
      <li><a href="/pages/tentang.html">Tentang</a></li>
    </ul>
    <p class="footer-copy">© 2026 DIAGA Project. Dibuat untuk pelestarian budaya Bengkulu.<br>
    Transliterasi aksara dalam proses validasi bersama narasumber. Sumber dan batasan kami ada di <a href="/pages/tentang.html#sumber" style="color:var(--c-gold)">halaman Tentang</a>.</p>
  </div>
</footer>
<button class="music-btn" id="musicBtn" aria-label="Putar atau hentikan musik latar">
  <span id="musicIcon" aria-hidden="true">🎵</span>
  <span class="music-text">Musik</span>
</button>
<audio id="ambientAudio" loop preload="none">
  <source src="/assets/ambient.mp3" type="audio/mpeg">
</audio>
`;

export function injectNav() {
  const container = document.getElementById('nav-container');
  if (container) container.innerHTML = NAV_HTML;
  else document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
}

export function injectFooter() {
  const container = document.getElementById('footer-container');
  if (container) container.innerHTML = FOOTER_HTML;
  else document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
}
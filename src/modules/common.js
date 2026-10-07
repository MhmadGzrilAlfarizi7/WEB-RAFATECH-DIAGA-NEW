/**
 * DIAGA — Modul bersama untuk semua halaman
 * Handles: navbar, footer, theme, music, particles, IntersectionObserver
 */

import { injectNav, injectFooter } from './nav-footer.js';

// ── Init navbar dan footer ────────────────────────────────────────────────
export function initLayout() {
  injectNav();
  injectFooter();

  // Tandai link aktif
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (path.endsWith(href) && href !== '/')) {
      link.setAttribute('aria-current', 'page');
    }
  });

  initNavbar();
  initTheme();
  initMusic();
  initFadeObserver();
}

// ── Navbar scroll + mobile menu ───────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('span[aria-hidden]').textContent = open ? '✕' : '☰';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.querySelector('span[aria-hidden]').textContent = '☰';
    });
  });
}

// ── Tema terang/gelap ─────────────────────────────────────────────────────
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  let saved = null;
  try { saved = localStorage.getItem('diaga-theme'); } catch (_) {}

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDark = saved ? saved === 'dark' : prefersDark;

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    btn.textContent = dark ? '☾' : '☀';
    btn.setAttribute('aria-label', dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
  }

  applyTheme(isDark);

  btn.addEventListener('click', () => {
    isDark = !isDark;
    applyTheme(isDark);
    try { localStorage.setItem('diaga-theme', isDark ? 'dark' : 'light'); } catch (_) {}
  });
}

// ── Musik latar ───────────────────────────────────────────────────────────
function initMusic() {
  const btn = document.getElementById('musicBtn');
  const audio = document.getElementById('ambientAudio');
  const icon = document.getElementById('musicIcon');
  if (!btn || !audio) return;

  // Jeda saat tab tidak aktif
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audio.paused) audio.pause();
  });

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.volume = 0.35;
      audio.play()
        .then(() => {
          btn.classList.add('playing');
          if (icon) icon.textContent = '🎶';
          btn.querySelector('.music-text').textContent = 'Berhenti';
        })
        .catch(err => console.warn('[DIAGA] Audio gagal:', err));
    } else {
      audio.pause();
      btn.classList.remove('playing');
      if (icon) icon.textContent = '🎵';
      btn.querySelector('.music-text').textContent = 'Musik';
    }
  });
}

// ── IntersectionObserver untuk animasi fade-up ────────────────────────────
// Diekspor supaya elemen yang dibuat lewat JS (mis. galeri foto) juga bisa didaftarkan.
// Memanggilnya lagi aman: elemen yang sudah terdaftar atau sudah tampil dilewati.
let fadeObserver = null;

export function initFadeObserver() {
  const els = document.querySelectorAll('.fade-up:not(.visible)');
  if (!els.length) return;

  // Jika reduced motion, langsung tampilkan semua
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  if (!fadeObserver) {
    fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          fadeObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
  }

  els.forEach(el => fadeObserver.observe(el));
}

// ── Partikel aksara di background ─────────────────────────────────────────
export function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  // Nonaktif jika reduced motion atau perangkat lemah
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
  ) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  const CHARS = [
    '\uA930','\uA931','\uA932','\uA933','\uA934','\uA935','\uA936','\uA937',
    '\uA938','\uA939','\uA93A','\uA93B','\uA93C','\uA93D','\uA93E','\uA93F',
    '\uA940','\uA941','\uA942','\uA943','\uA944','\uA945','\uA946',
  ];
  const MAX = 40;
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function mkParticle(bottom) {
    return {
      x: Math.random() * w,
      y: bottom ? h + 30 : Math.random() * h,
      ch: CHARS[Math.floor(Math.random() * CHARS.length)],
      sz: 14 + Math.random() * 12,
      vx: (Math.random() - .5) * .22,
      vy: -(Math.random() * .4 + .1),
      alpha: Math.random() * .35 + .06,
      aDir: Math.random() > .5 ? 1 : -1,
      aSpd: .008 + Math.random() * .008,
    };
  }

  function seed() {
    particles = Array.from({ length: MAX }, () => mkParticle(false));
  }

  function draw() {
    if (document.hidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, w, h);
    ctx.font = '';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.font = `${p.sz}px 'Noto Sans Rejang', serif`;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = 'rgba(212,168,67,1)';
      ctx.fillText(p.ch, p.x, p.y);

      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.aDir * p.aSpd;
      if (p.alpha >= .45) { p.alpha = .45; p.aDir = -1; }
      if (p.alpha <= .06) { p.alpha = .06; p.aDir = 1; }
      if (p.y < -30) particles[i] = mkParticle(true);
      if (p.x < -30) p.x = w + 20;
      if (p.x > w + 30) p.x = -20;
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  seed();
  draw();
}

// ── Safe HTML escape ──────────────────────────────────────────────────────
export function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Salin ke clipboard ────────────────────────────────────────────────────
export async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = '✓ Tersalin';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  } catch (_) {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

// ── Demo mode ─────────────────────────────────────────────────────────────
export function checkDemoMode() {
  return new URLSearchParams(window.location.search).get('demo') === '1';
}
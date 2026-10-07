import { initLayout, initParticles } from '../modules/common.js';
document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  initParticles();
  // Responsif: stack layout di mobile
  const grid = document.getElementById('sentraGrid');
  if (grid && window.innerWidth < 768) {
    grid.style.gridTemplateColumns = '1fr';
  }
});
// ==========================================
//   useful.js — вкладки та пошук відео
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // --- TABS ---
  const tabs     = document.querySelectorAll('.useful-tab');
  const contents = document.querySelectorAll('.useful-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.classList.add('active');

      // Скрол до вкладок на мобільному
      if (window.innerWidth < 768) {
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // --- VIDEO SEARCH ---
  const searchInput  = document.getElementById('videoSearch');
  const videoCards   = document.querySelectorAll('.video-card');
  const noResults    = document.getElementById('videoNoResults');

  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;

    videoCards.forEach(card => {
      const title = card.querySelector('.video-title')?.textContent.toLowerCase() || '';
      const desc  = card.querySelector('.video-desc')?.textContent.toLowerCase() || '';
      const match = !q || title.includes(q) || desc.includes(q);
      card.classList.toggle('hidden', !match);
      if (match) visible++;
    });

    if (noResults) {
      noResults.style.display = visible === 0 ? 'flex' : 'none';
    }
  });

});

// ==========================================
//   gallery.js — слайдер + фільтрація + лайтбокс
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  //   SLIDER
  // ==========================================
  const track      = document.getElementById('sliderTrack');
  const slides     = track ? [...track.querySelectorAll('.slide')] : [];
  const prevBtn    = document.getElementById('sliderPrev');
  const nextBtn    = document.getElementById('sliderNext');
  const dotsWrap   = document.getElementById('sliderDots');

  let current   = 0;
  let autoTimer = null;

  if (slides.length) {

    // Створюємо точки
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap?.appendChild(dot);
    });

    function goTo(idx) {
      slides[current].classList.remove('active');
      dotsWrap?.querySelectorAll('.slider-dot')[current]?.classList.remove('active');

      current = (idx + slides.length) % slides.length;

      slides[current].classList.add('active');
      dotsWrap?.querySelectorAll('.slider-dot')[current]?.classList.add('active');
      track.style.transform = `translateX(-${current * 100}%)`;

      // Prev/Next disabled на крайніх (необов'язково — є нескінченний цикл)
    }

    // Ініціалізація першого слайду
    slides[0].classList.add('active');

    prevBtn?.addEventListener('click', () => { resetAuto(); goTo(current - 1); });
    nextBtn?.addEventListener('click', () => { resetAuto(); goTo(current + 1); });

    // Автоматична прокрутка кожні 5 секунд
    function startAuto() {
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }
    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }
    startAuto();

    // Свайп на мобільному
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        resetAuto();
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
      }
    });

    // Пауза при hover
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', () => startAuto());

    // Клавіатура
    document.addEventListener('keydown', e => {
      if (document.getElementById('lightbox')?.classList.contains('open')) return;
      if (e.key === 'ArrowLeft')  { resetAuto(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { resetAuto(); goTo(current + 1); }
    });
  }

  // ==========================================
  //   ФІЛЬТРАЦІЯ ГАЛЕРЕЇ
  // ==========================================
  const grid       = document.getElementById('galleryGrid');
  const cells      = grid ? [...grid.querySelectorAll('.gallery-cell')] : [];
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
  const noResults  = document.getElementById('noResults');

  let visibleCells = [...cells];

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      visibleCells = [];

      cells.forEach(cell => {
        const match = filter === 'all' || cell.dataset.category === filter;
        cell.classList.toggle('hidden', !match);
        if (match) visibleCells.push(cell);
      });

      if (noResults) {
        noResults.style.display = visibleCells.length === 0 ? 'flex' : 'none';
      }
    });
  });

  // ==========================================
  //   LIGHTBOX
  // ==========================================
  const lightbox   = document.getElementById('lightbox');
  const lbImgWrap  = document.getElementById('lightboxImgWrap');
  const lbCaption  = document.getElementById('lightboxCaption');
  const lbCounter  = document.getElementById('lightboxCounter');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');

  let lbIndex = 0;

  function openLightbox(idx) {
    lbIndex = idx;
    const cell    = visibleCells[idx];
    if (!cell) return;

    const img     = cell.querySelector('img');
    const title   = cell.querySelector('.gallery-zoom-btn')?.dataset.title
                 || cell.querySelector('.gallery-caption')?.textContent
                 || '';

    lbImgWrap.innerHTML = '';

    if (img) {
      const bigImg = document.createElement('img');
      bigImg.src = img.src;
      bigImg.alt = title;
      lbImgWrap.appendChild(bigImg);
    } else {
      lbImgWrap.innerHTML = `
        <div class="lightbox-placeholder">
          <i class="fa-solid fa-image fa-3x"></i>
          <span>${title}</span>
        </div>`;
    }

    lbCaption.textContent = title;
    lbCounter.textContent = `${idx + 1} / ${visibleCells.length}`;
    lbPrev.style.display  = visibleCells.length > 1 ? 'flex' : 'none';
    lbNext.style.display  = visibleCells.length > 1 ? 'flex' : 'none';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function lbShowPrev() {
    lbIndex = (lbIndex - 1 + visibleCells.length) % visibleCells.length;
    openLightbox(lbIndex);
  }
  function lbShowNext() {
    lbIndex = (lbIndex + 1) % visibleCells.length;
    openLightbox(lbIndex);
  }

  // Клік по клітинці або кнопці zoom
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = visibleCells.indexOf(cell);
      if (idx !== -1) openLightbox(idx);
    });
    cell.querySelector('.gallery-zoom-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      const idx = visibleCells.indexOf(cell);
      if (idx !== -1) openLightbox(idx);
    });
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', lbShowPrev);
  lbNext?.addEventListener('click', lbShowNext);

  // Клік на фон
  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Клавіатура для лайтбоксу
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbShowPrev();
    if (e.key === 'ArrowRight') lbShowNext();
  });

  // Свайп у лайтбоксі
  let lbTouchX = 0;
  lightbox?.addEventListener('touchstart', e => {
    lbTouchX = e.touches[0].clientX;
  }, { passive: true });
  lightbox?.addEventListener('touchend', e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? lbShowNext() : lbShowPrev();
  });

});

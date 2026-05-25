// ==========================================
//   СМА Разом — main.js
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Sticky header shadow ---
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  });

  // --- Mobile menu ---
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu-close');

  burger?.addEventListener('click', () => mobileMenu.classList.add('open'));
  mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // --- Scroll to top ---
  const scrollTopBtn = document.querySelector('.scroll-top');
  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // --- Simple AOS (Animate on Scroll) ---
  const aosEls = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  aosEls.forEach(el => observer.observe(el));

  // --- Gallery lightbox (простий) ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.85);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000; cursor: pointer; animation: fadeIn 0.3s ease;
      `;
      const bigImg = document.createElement('img');
      bigImg.src = img.src;
      bigImg.style.cssText = 'max-width: 90vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 20px 80px rgba(0,0,0,0.5);';
      overlay.appendChild(bigImg);
      overlay.addEventListener('click', () => overlay.remove());
      document.body.appendChild(overlay);
    });
  });

  // --- Contact form ---
  const form = document.querySelector('.contact-form form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const original = btn.textContent;
    btn.textContent = '✓ Повідомлення надіслано!';
    btn.style.background = '#2D6A9F';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Counter animation for hero stats ---
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = Math.ceil(target / 50);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + suffix;
          if (current >= target) clearInterval(timer);
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

});
// ==========================================
//   news.js — Фільтрація, пошук, пагінація
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  const grid      = document.getElementById('newsGrid');
  const items     = grid ? [...grid.querySelectorAll('.news-item')] : [];
  const filterBtns = document.querySelectorAll('.filter-btn');
  const noResults  = document.getElementById('noResults');
  const searchInput = document.getElementById('searchInput');

  // --- Фільтрація за категорією ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visible = 0;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
        if (match) visible++;
      });

      noResults.style.display = visible === 0 ? 'flex' : 'none';
      // Скидаємо пошук при перемиканні фільтра
      if (searchInput) searchInput.value = '';
    });
  });

  // --- Живий пошук ---
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      let visible = 0;

      // Скидаємо фільтр-кнопки
      filterBtns.forEach(b => b.classList.remove('active'));
      document.querySelector('[data-filter="all"]')?.classList.add('active');

      items.forEach(item => {
        const title = item.querySelector('.news-item-title')?.textContent.toLowerCase() || '';
        const excerpt = item.querySelector('.news-item-excerpt')?.textContent.toLowerCase() || '';
        const match = !query || title.includes(query) || excerpt.includes(query);
        item.classList.toggle('hidden', !match);
        if (match) visible++;
      });

      noResults.style.display = visible === 0 ? 'flex' : 'none';
    });
  }

  // --- Пагінація (демо — перемикає активну кнопку) ---
  const pageNums = document.querySelectorAll('.page-num');
  const prevBtn  = document.querySelector('.page-prev');
  const nextBtn  = document.querySelector('.page-next');

  let currentPage = 1;
  const totalPages = pageNums.length;

  function updatePagination() {
    pageNums.forEach((btn, i) => {
      btn.classList.toggle('active', i + 1 === currentPage);
    });
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    // Прокрутка вгору при перемиканні
    document.querySelector('.news-main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  pageNums.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      currentPage = i + 1;
      updatePagination();
    });
  });

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; updatePagination(); }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage++; updatePagination(); }
  });

  // --- Теги в сайдбарі — фільтрують за пошуком ---
  document.querySelectorAll('.sidebar-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const query = tag.textContent.trim().toLowerCase();
      if (searchInput) {
        searchInput.value = tag.textContent.trim();
        searchInput.dispatchEvent(new Event('input'));
        // Скрол до сітки
        grid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Підписка (демо) ---
  const subscribeBtn = document.querySelector('.subscribe-form .btn');
  const subscribeInput = document.querySelector('.subscribe-form input');
  subscribeBtn?.addEventListener('click', () => {
    if (!subscribeInput?.value.includes('@')) {
      subscribeInput?.focus();
      return;
    }
    subscribeBtn.textContent = '✓ Підписано!';
    subscribeBtn.style.background = '#2D6A9F';
    subscribeInput.value = '';
    setTimeout(() => {
      subscribeBtn.textContent = 'Підписатися';
      subscribeBtn.style.background = '';
    }, 3000);
  });

});
// ==========================================
//   single-post.js
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Reading progress bar ---
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  progressBar.innerHTML = '<div class="reading-progress-bar" id="progressBar"></div>';
  document.body.prepend(progressBar);

  const bar = document.getElementById('progressBar');
  const article = document.querySelector('.post-article');

  window.addEventListener('scroll', () => {
    if (!article || !bar) return;
    const articleTop    = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const scrolled      = window.scrollY - articleTop;
    const total         = articleHeight - window.innerHeight;
    const pct           = Math.min(Math.max((scrolled / total) * 100, 0), 100);
    bar.style.width = pct + '%';
  }, { passive: true });

  // --- Active TOC on scroll ---
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('.post-body h2');

  if (tocLinks.length && headings.length) {
    // Прив'язуємо посилання до заголовків
    headings.forEach((h, i) => {
      h.id = 'section-' + i;
      if (tocLinks[i]) tocLinks[i].setAttribute('href', '#section-' + i);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            link.classList.toggle('toc-active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    headings.forEach(h => observer.observe(h));
  }

  // --- Share buttons ---
  window.sharePost = (platform) => {
    const url   = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      telegram:  `https://t.me/share/url?url=${url}&text=${title}`,
      twitter:   `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    };
    if (links[platform]) window.open(links[platform], '_blank', 'width=600,height=400');
  };

  // --- Copy link ---
  window.copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.querySelector('.share-btn--copy');
      if (!btn) return;
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Скопійовано!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove('copied');
      }, 2500);
    });
  };

});
// ==========================================
//   donate.js — вибір суми, копіювання
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Impact messages per amount ---
  const impactMap = [
    { max: 99,    text: 'Ваша сума допоможе покрити частину витрат на інформаційні матеріали.' },
    { max: 100,   text: '100 грн — інформаційні матеріали для однієї родини' },
    { max: 299,   text: 'До 300 грн — друк буклетів та роздаткових матеріалів для родин' },
    { max: 300,   text: '300 грн — участь фахівця у вебінарі для батьків' },
    { max: 499,   text: 'До 500 грн — частина витрат на юридичну консультацію' },
    { max: 500,   text: '500 грн — консультація юриста для однієї родини' },
    { max: 999,   text: 'До 1 000 грн — психологічна підтримка родини протягом тижня' },
    { max: 1000,  text: '1 000 грн — психологічна підтримка родини протягом місяця' },
    { max: 1999,  text: 'До 2 000 грн — комплексна юридична допомога родині' },
    { max: 2000,  text: '2 000 грн — комплексна медико-юридична консультація' },
    { max: 4999,  text: 'До 5 000 грн — часткове фінансування генетичного аналізу' },
    { max: 5000,  text: '5 000 грн — генетичний аналіз для встановлення діагнозу' },
    { max: 9999,  text: 'До 10 000 грн — фінансування регіонального освітнього заходу' },
    { max: 10000, text: '10 000 грн — участь делегата у міжнародній конференції' },
    { max: Infinity, text: 'Ваша щедра підтримка допоможе нам зробити значний крок вперед!' },
  ];

  function getImpactText(amount) {
    const amt = parseInt(amount) || 0;
    for (const item of impactMap) {
      if (amt <= item.max) return item.text;
    }
    return impactMap[impactMap.length - 1].text;
  }

  // --- State ---
  let currentAmount = 500;

  const amountBtns   = document.querySelectorAll('.amount-btn');
  const customInput  = document.getElementById('customAmount');
  const payAmountEl  = document.getElementById('payAmount');
  const impactTextEl = document.getElementById('impactText');
  const freqBtns     = document.querySelectorAll('.freq-btn');

  function updateDisplay(amount) {
    currentAmount = parseInt(amount) || 0;
    if (payAmountEl)  payAmountEl.textContent  = currentAmount.toLocaleString('uk-UA');
    if (impactTextEl) impactTextEl.textContent = getImpactText(currentAmount);
  }

  // Preset buttons
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (customInput) customInput.value = '';
      updateDisplay(btn.dataset.amount);
    });
  });

  // Custom input
  customInput?.addEventListener('input', () => {
    amountBtns.forEach(b => b.classList.remove('active'));
    updateDisplay(customInput.value);
  });

  // Frequency buttons
  freqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      freqBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Init
  updateDisplay(currentAmount);

  // --- Copy buttons ---
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      navigator.clipboard.writeText(text).then(() => {
        const icon = btn.querySelector('i');
        const original = icon.className;
        icon.className = 'fa-solid fa-check';
        btn.classList.add('copied');
        setTimeout(() => {
          icon.className = original;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

});
// ==========================================
//   contacts.js — форма, FAQ, вкладки теми
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Topic buttons ---
  const topicBtns  = document.querySelectorAll('.topic-btn');
  const topicInput = document.getElementById('topicInput');

  topicBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      topicBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (topicInput) topicInput.value = btn.dataset.topic;
    });
  });

  // --- Form validation & submit ---
  const form        = document.getElementById('contactForm');
  const successBox  = document.getElementById('formSuccess');
  const submitBtn   = form?.querySelector('.form-submit-btn');

  const validators = {
    name:    v => v.trim().length >= 2,
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: v => v.trim().length >= 10,
    consent: (v, el) => el.checked,
  };

  function showError(id, show) {
    const el = document.getElementById(id + 'Error');
    const input = document.getElementById(id);
    if (el) el.classList.toggle('visible', show);
    if (input) input.classList.toggle('error', show);
  }

  function validateField(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const valid = validators[id] ? validators[id](el.value, el) : true;
    showError(id, !valid);
    return valid;
  }

  // Live validation on blur
  ['name', 'email', 'message'].forEach(id => {
    document.getElementById(id)?.addEventListener('blur', () => validateField(id));
    document.getElementById(id)?.addEventListener('input', () => {
      if (document.getElementById(id + 'Error')?.classList.contains('visible')) {
        validateField(id);
      }
    });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields  = ['name', 'email', 'message', 'consent'];
    const isValid = fields.map(id => validateField(id)).every(Boolean);
    if (!isValid) return;

    // Simulate sending
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Надсилаємо…';

    await new Promise(r => setTimeout(r, 1400));

    form.querySelectorAll('input, textarea, select').forEach(el => {
      if (el.type === 'checkbox') el.checked = false;
      else el.value = '';
    });
    topicBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
    if (topicInput) topicInput.value = 'support';

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Надіслати повідомлення';

    if (successBox) {
      successBox.classList.add('visible');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => successBox.classList.remove('visible'), 6000);
    }
  });

  // --- FAQ accordion ---
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

});

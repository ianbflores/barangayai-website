/* ============================================================
   BarangayAI — main.js
   ============================================================ */

/* --- Hero 2: 1M+ card count-up --- */
(function initHero1M() {
  const el = document.querySelector('.hero2-1m');
  if (!el) return;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    const dur = 2000, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const v = Math.floor(easeOut(p) * 1000000);
      el.textContent = p < 1 ? v.toLocaleString() + '+' : '1M+';
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.5 });
  obs.observe(el);
})();

/* --- Philippines Map: draw-in + hover tooltip --- */
(function initPhMap() {
  const svg = document.getElementById('phMapSvg');
  const tooltip = document.getElementById('phTooltip');
  if (!svg) return;

  const islands = Array.from(svg.querySelectorAll('.ph-island'));

  // 1. Measure path lengths and prime each path to be hidden
  islands.forEach(path => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    path.style.fillOpacity = '0';
    path.style.transition = 'none';
  });

  // 2. Double-rAF ensures layout has flushed before we start animating
  requestAnimationFrame(() => requestAnimationFrame(() => {
    islands.forEach((path, i) => {
      const drawDelay  = (i * 0.06).toFixed(3);
      const fillDelay  = (i * 0.06 + 1.7).toFixed(2);
      path.style.transition =
        `stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1) ${drawDelay}s,` +
        `fill-opacity 0.9s ease ${fillDelay}s`;
      path.style.strokeDashoffset = '0';
      path.style.fillOpacity      = '1';
    });

    // 3. After all animations finish, restore CSS class transitions for hover
    //    Last island: delay = (n-1)*60ms, stroke=2000ms, fill-delay=1700ms, fill-dur=900ms
    const lastIdx   = islands.length - 1;
    const cleanupMs = lastIdx * 60 + 2000 + 1700 + 900 + 400; // ≈ 6 s
    setTimeout(() => {
      islands.forEach(path => {
        path.style.strokeDasharray  = '';
        path.style.strokeDashoffset = '';
        path.style.transition       = '';
      });
    }, cleanupMs);
  }));

  // 4. Hover tooltip + bring-to-front (above other islands, below city dots)
  if (!tooltip) return;
  const cityDots = svg.querySelector('.city-dots');

  islands.forEach(path => {
    path.addEventListener('mouseenter', () => {
      svg.insertBefore(path, cityDots || null);
      tooltip.textContent = path.dataset.region || '';
      tooltip.classList.add('visible');
    });
    path.addEventListener('mousemove', e => {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top  = (e.clientY - 34) + 'px';
    });
    path.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });
})();

/* --- Nav: scroll shadow + active page --- */
(function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Mark active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html') ||
        (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* --- Scroll Reveal --- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* --- Animated counter for impact numbers --- */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const raw = el.dataset.count;
    const isDecimal = raw.includes('.');
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const target = parseFloat(raw);
    const duration = 2000;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const value = easeOut(elapsed) * target;
      el.textContent = prefix + (isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString()) + suffix;
      if (elapsed < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* --- FAQ accordion --- */
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* --- Philippines Map dot animation --- */
(function initMapDots() {
  const dots = document.querySelectorAll('.map-dot-animated');
  if (!dots.length) return;

  dots.forEach((dot, i) => {
    dot.style.animationDelay = `${(i * 0.4) % 3}s`;
  });
})();

/* --- Funding bars animate in --- */
(function initFundingBars() {
  const fills = document.querySelectorAll('.funding-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill = e.target;
        const width = fill.dataset.width || '0%';
        setTimeout(() => { fill.style.width = width; }, 100);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(el => {
    el.style.width = '0%';
    observer.observe(el);
  });
})();

/* --- Contact form basic validation + submission feedback --- */
(function initForms() {
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const original = btn ? btn.textContent : '';
      const feedback = form.querySelector('.form-feedback');

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }

      // Simulate async submission
      setTimeout(() => {
        if (feedback) {
          feedback.textContent = 'Thank you! We received your message and will be in touch within 2–3 business days.';
          feedback.className = 'form-feedback alert alert-success mt-2';
          feedback.style.display = 'block';
        }
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = original; }
        feedback?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1200);
    });
  });
})();

/* --- Smooth anchor scroll override (for same-page) --- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

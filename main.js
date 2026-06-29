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

/* --- Nav: scroll shadow + hamburger + active page --- */
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
    const closeMenu = () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside tap
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    }, { passive: true });
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

/* --- Smooth scroll for anchor links --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

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

// ── BarangayAI Form Handler ──────────────────────────────

function initBarangayForm(config) {
  const form = document.getElementById(config.formId);
  if (!form) return;

  const submitBtn = document.getElementById(config.submitBtnId);
  const successEl = document.getElementById(config.successId);
  const errorEl = document.getElementById(config.errorId);

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    clearAllErrors(form);

    if (!validateBarangayForm(form)) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';
    successEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        const emailField = document.getElementById(config.emailFieldId);
        const successEmailEl = document.getElementById(config.successEmailId);
        if (emailField && successEmailEl) {
          successEmailEl.textContent = emailField.value;
        }
        form.reset();
        successEl.style.display = 'block';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        console.error('Formspree error:', result);
        errorEl.style.display = 'block';
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      console.error('Network error:', err);
      errorEl.style.display = 'block';
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
    }
  });

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', function() {
      this.classList.remove('error');
      const errEl = document.getElementById(this.id + '-error');
      if (errEl) errEl.textContent = '';
    });
  });
}

function validateBarangayForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const val = field.value.trim();
    const errEl = document.getElementById(field.id + '-error');
    if (!val) {
      field.classList.add('error');
      if (errEl) errEl.textContent = 'This field is required.';
      valid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      field.classList.add('error');
      if (errEl) errEl.textContent = 'Please enter a valid email address.';
      valid = false;
    }
  });
  return valid;
}

function clearAllErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

// Initialize Partnership form
initBarangayForm({
  formId: 'partnershipForm',
  endpoint: 'https://formspree.io/f/mrewlwel',
  submitBtnId: 'partner-submit-btn',
  successId: 'partner-success',
  errorId: 'partner-error',
  emailFieldId: 'partner-email',
  successEmailId: 'partner-success-email'
});

// Initialize Support form
initBarangayForm({
  formId: 'supportForm',
  endpoint: 'https://formspree.io/f/mnjkzkjg',
  submitBtnId: 'support-submit-btn',
  successId: 'support-success',
  errorId: 'support-error',
  emailFieldId: 'support-email',
  successEmailId: 'support-success-email'
});

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

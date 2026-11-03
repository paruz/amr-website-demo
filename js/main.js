// Shared behaviour: icons, caution tapes, demo toasts, menu, smooth scroll, tape-measure progress.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const AMR = (window.AMR = { reduce, hasGsap });
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // ---- tool pictograms
  AMR.icon = (kind) => {
    const i = (window.AMR_ICONS || {})[kind];
    if (!i) return '';
    return `<svg viewBox="-30 ${i.top - 20} ${i.w + 60} ${i.h + 40}" aria-hidden="true" focusable="false"><path fill="currentColor" d="${i.d}"/></svg>`;
  };
  document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = AMR.icon(el.dataset.icon); });

  // ---- caution tapes: the same run twice, so moving by half loops seamlessly
  document.querySelectorAll('[data-tape]').forEach((t) => {
    const run = Array.from({ length: 3 }, () => t.dataset.tape.split('|').map((w) => `<span>${w}</span>`).join('')).join('');
    t.innerHTML = run + run;
  });

  // ---- demo actions (no real phone / WhatsApp in the mockup)
  const toast = document.querySelector('.toast');
  let timer;
  AMR.toast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 2800);
  };
  const DEMO = {
    whatsapp: 'באתר האמיתי כאן תיפתח שיחת וואטסאפ עם החנות',
    call: 'באתר האמיתי כאן יתחיל חיוג לחנות',
    waze: 'באתר האמיתי כאן ייפתח Waze עם ניווט לחנות',
    a11y: 'באתר האמיתי כאן תופיע הצהרת הנגישות',
    privacy: 'באתר האמיתי כאן תופיע מדיניות הפרטיות',
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-demo]');
    if (!a) return;
    e.preventDefault();
    AMR.toast(DEMO[a.dataset.demo] || 'זה אתר הדגמה');
  });

  // ---- header + mobile menu
  const head = document.querySelector('.site-head');
  const burger = document.querySelector('.burger');
  const setMenu = (open) => {
    burger?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  };
  burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('.main-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // ---- smooth scroll (off for reduced motion)
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      a.addEventListener('click', (e) => {
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -60 });
      });
    });
  }
  AMR.lenis = lenis;

  // ---- tape-measure scroll progress
  const fill = document.querySelector('.tape-fill');
  const hook = document.querySelector('.tape-hook');
  const vertical = () => !matchMedia('(max-width: 900px)').matches;
  function buildScale() {
    document.querySelectorAll('.tape-scale').forEach((s) => {
      s.innerHTML = '';
      for (let y = 59, k = 1; y < innerHeight; y += 60, k++) {
        const n = document.createElement('span');
        n.className = 'tape-num';
        n.style.top = `${y}px`;
        n.textContent = k * 10;
        s.appendChild(n);
      }
    });
  }
  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    const rest = ((1 - p) * 100).toFixed(2);
    if (fill) fill.style.clipPath = vertical() ? `inset(0 0 ${rest}% 0)` : `inset(0 0 0 ${rest}%)`;
    if (hook) hook.style.top = `${p * innerHeight}px`;
    head?.classList.toggle('is-scrolled', scrollY > 40);
  }
  buildScale();
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { buildScale(); update(); });
  lenis?.on('scroll', update);
})();

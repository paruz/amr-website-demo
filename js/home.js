// Home page: the brick wall that builds itself on load, the horizontal category reel, the steps ruler.
(() => {
  const { reduce, hasGsap } = window.AMR;
  const svg = document.querySelector('.wall-svg');
  const NS = 'http://www.w3.org/2000/svg';

  // Courses of bricks, bottom up. The top course is still being laid: it stops part-way,
  // with one white brick marking where the work is.
  function buildWall() {
    const box = svg.getBoundingClientRect();
    const W = Math.max(320, box.width);
    const H = Math.max(120, box.height);
    const small = W < 700;
    const bh = small ? 28 : 44;
    const bw = bh * 2.7;
    const j = small ? 6 : 8;
    const rows = Math.max(3, Math.floor((H + j) / (bh + j)));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const bricks = [];
    for (let r = 0; r < rows; r++) {
      const y = H - (r + 1) * bh - r * j;
      const off = r % 2 ? -(bw + j) / 2 : 0;
      const top = r === rows - 1;
      const xs = [];
      for (let x = W - bw - off; x > -bw; x -= bw + j) xs.push(x);   // right to left, the reading direction
      xs.forEach((x, k) => {
        if (top && x < W * 0.42) return;
        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', x.toFixed(1));
        rect.setAttribute('y', y.toFixed(1));
        rect.setAttribute('width', bw.toFixed(1));
        rect.setAttribute('height', bh);
        rect.setAttribute('rx', 2);
        const last = top && (k === xs.length - 1 || xs[k + 1] < W * 0.42);
        if (last) rect.classList.add('w');
        svg.appendChild(rect);
        bricks.push(rect);
      });
    }
    return bricks;
  }

  const bricks = buildWall();
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(buildWall, 150); });

  if (!hasGsap || reduce) return;

  // ---- page-load sequence: bricks drop in course by course, the headline rises, the tapes stretch across
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from(bricks, { y: -320, opacity: 0, duration: 0.6, ease: 'bounce.out', stagger: 0.012 }, 0)
    .from('.hero-title .line > span', { yPercent: 110, duration: 0.9, stagger: 0.14 }, 0.2)
    .from('.hero-sub, .hero-actions', { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.65)
    .fromTo('.caution', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.9, ease: 'power4.inOut', stagger: 0.15 }, 0.8);

  // ---- category reel: vertical scroll drives the track sideways (desktop only)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = document.querySelector('.cats-track');
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, {
      x: () => dist(),                       // RTL: later panels sit to the left, so the track moves right
      ease: 'none',
      scrollTrigger: { trigger: '.cats', pin: true, scrub: 0.6, end: () => `+=${dist()}`, invalidateOnRefresh: true },
    });
    gsap.fromTo('.panel-icon svg', { rotate: -14 }, {
      rotate: 12, ease: 'none',
      scrollTrigger: { trigger: '.cats', start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true },
    });
  });

  // ---- the steps are laid out along a ruler; it unrolls in reading direction when reached
  gsap.from('.steps', {
    clipPath: 'inset(0 0 0 100%)', duration: 1.3, ease: 'power3.inOut',
    scrollTrigger: { trigger: '.steps', start: 'top 80%' },
  });
})();

// Catalog: filter by department, search, and build a price-request list (demo — nothing is sent).
(() => {
  const AMR = window.AMR;
  const CATS = { build: 'חומרי בניין', tools: 'כלי עבודה', paint: 'צבע ושיפוץ', home: 'לבית ולגינה' };
  const PRODUCTS = [
    { id: 1, n: 'מלט אפור', u: 'שק 25 ק״ג', c: 'build', i: 'brick' },
    { id: 2, n: 'בלוק בטון 20', u: 'ליחידה', c: 'build', i: 'brick' },
    { id: 3, n: 'דבק לאריחים', u: 'שק 25 ק״ג', c: 'build', i: 'trowel' },
    { id: 4, n: 'חול מנופה', u: 'שק 40 ק״ג', c: 'build', i: 'brick' },
    { id: 5, n: 'לוח גבס 12.5 מ״מ', u: 'לוח 120×260 ס״מ', c: 'build', i: 'level' },
    { id: 6, n: 'חומר איטום לגגות', u: 'דלי 18 ק״ג', c: 'build', i: 'brush' },
    { id: 7, n: 'מברגה נטענת 18V', u: 'כולל 2 סוללות', c: 'tools', i: 'screwdriver' },
    { id: 8, n: 'סט מפתחות משולבים', u: '12 חלקים', c: 'tools', i: 'wrench_combo' },
    { id: 9, n: 'פטיש נגרים', u: '450 גרם', c: 'tools', i: 'hammer' },
    { id: 10, n: 'מסור ידני', u: '50 ס״מ', c: 'tools', i: 'saw' },
    { id: 11, n: 'פלס אלומיניום', u: '60 ס״מ', c: 'tools', i: 'level' },
    { id: 12, n: 'מסמרים 3 אינץ׳', u: 'קופסה 1 ק״ג', c: 'tools', i: 'nail' },
    { id: 13, n: 'צבע אקרילי לבן', u: 'דלי 18 ליטר', c: 'paint', i: 'roller' },
    { id: 14, n: 'רולר צבע', u: '25 ס״מ', c: 'paint', i: 'roller' },
    { id: 15, n: 'מברשת צבע', u: '3 אינץ׳', c: 'paint', i: 'brush' },
    { id: 16, n: 'מרית שפכטל', u: '10 ס״מ', c: 'paint', i: 'trowel' },
    { id: 17, n: 'סט ברגים ודיבלים', u: '200 חלקים', c: 'home', i: 'screwdriver' },
    { id: 18, n: 'עיפרון נגרים', u: 'מארז 3', c: 'home', i: 'pencil' },
    { id: 19, n: 'מפתח שוודי', u: '10 אינץ׳', c: 'home', i: 'wrench_open' },
    { id: 20, n: 'מסמרי בטון', u: 'קופסה 100 יח׳', c: 'home', i: 'nail' },
  ];

  const grid = document.getElementById('grid');
  const empty = document.querySelector('.empty');
  const chips = document.querySelector('.chips');
  const q = document.getElementById('q');
  const list = new Map();                     // product id → quantity
  const params = new URLSearchParams(location.search);
  let cat = CATS[params.get('cat')] ? params.get('cat') : 'all';

  // ---- department chips
  chips.innerHTML = [['all', 'הכל'], ...Object.entries(CATS)]
    .map(([k, v]) => `<button class="chip" type="button" data-cat="${k}" aria-pressed="${k === cat}">${v}</button>`)
    .join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    cat = b.dataset.cat;
    chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    render(true);
  });
  q.addEventListener('input', () => render(false));

  // ---- product grid
  function card(p) {
    const inList = list.has(p.id);
    return `<article class="product${inList ? ' in-list' : ''}" data-id="${p.id}">
      <div class="pic">${AMR.icon(p.i)}</div>
      <div class="body">
        <span class="cat-name">${CATS[p.c]}</span>
        <h3>${p.n}</h3>
        <span class="unit">${p.u}</span>
        <div class="add"><button class="btn btn-yellow" type="button">${inList ? 'נוסף, עוד אחד' : 'הוסיפו לבקשה'}</button></div>
      </div></article>`;
  }
  function render(animate) {
    const term = q.value.trim();
    const items = PRODUCTS.filter((p) => (cat === 'all' || p.c === cat) && (!term || p.n.includes(term) || CATS[p.c].includes(term)));
    grid.innerHTML = items.map(card).join('');
    empty.hidden = items.length > 0;
    if (animate && AMR.hasGsap && !AMR.reduce) {
      gsap.from(grid.children, { y: 30, opacity: 0, duration: 0.45, stagger: 0.03, ease: 'power3.out' });
    }
  }
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.add .btn');
    if (!b) return;
    const id = Number(b.closest('.product').dataset.id);
    list.set(id, (list.get(id) || 0) + 1);
    const p = PRODUCTS.find((x) => x.id === id);
    AMR.toast(`${p.n} נוסף לבקשת המחיר`);
    refresh();
    bump();
  });

  // ---- price-request list
  const body = document.body;
  const drawer = document.querySelector('.drawer');
  const ul = drawer.querySelector('.list');
  const emptyList = drawer.querySelector('.empty-list');
  const count = document.querySelector('.quote-btn .count');
  const openBtn = document.querySelector('.quote-btn');
  function refresh() {
    const total = [...list.values()].reduce((a, b) => a + b, 0);
    count.textContent = total;
    ul.innerHTML = [...list.entries()].map(([id, n]) => {
      const p = PRODUCTS.find((x) => x.id === id);
      return `<li data-id="${id}"><span class="nm">${p.n}<small>${p.u}</small></span>
        <span class="qty"><button type="button" data-d="1" aria-label="עוד אחד">+</button><span>${n}</span><button type="button" data-d="-1" aria-label="אחד פחות">−</button></span></li>`;
    }).join('');
    emptyList.hidden = list.size > 0;
    drawer.querySelector('.send').disabled = list.size === 0;
    grid.querySelectorAll('.product').forEach((el) => {
      const inList = list.has(Number(el.dataset.id));
      el.classList.toggle('in-list', inList);
      el.querySelector('.add .btn').textContent = inList ? 'נוסף, עוד אחד' : 'הוסיפו לבקשה';
    });
  }
  function bump() {
    if (AMR.hasGsap && !AMR.reduce) gsap.fromTo(count, { scale: 1.6 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  }
  ul.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-d]');
    if (!b) return;
    const id = Number(b.closest('li').dataset.id);
    const n = (list.get(id) || 0) + Number(b.dataset.d);
    if (n > 0) list.set(id, n); else list.delete(id);
    refresh();
  });
  const open = () => { drawer.hidden = false; requestAnimationFrame(() => body.classList.add('drawer-open')); drawer.querySelector('.close').focus(); };
  const close = () => { body.classList.remove('drawer-open'); setTimeout(() => { drawer.hidden = true; }, 300); openBtn.focus(); };
  openBtn.addEventListener('click', open);
  drawer.querySelector('.close').addEventListener('click', close);
  document.querySelector('.drawer-back').addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && body.classList.contains('drawer-open')) close(); });
  drawer.querySelector('.send').addEventListener('click', () => {
    const total = [...list.values()].reduce((a, b) => a + b, 0);
    AMR.toast(`באתר האמיתי כאן תיפתח שיחת וואטסאפ עם ${total} פריטים מהרשימה`);
  });

  render(false);
  refresh();
})();

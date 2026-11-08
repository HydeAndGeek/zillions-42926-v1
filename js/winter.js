/* winter.js — Project Planner + Gallery Lightbox (vanilla JS, no deps)
   Loaded with `defer`, so DOM is ready when this runs. */
(function () {
  'use strict';

  /* =====================================================================
     1. PROJECT PLANNER
     ===================================================================== */
  const PROJECTS = {
    patio:      { label: 'Patio & pavers',        service: 'Patio restoration (pressure wash + polymer sand)',
                  why: 'Wash, re-level, fresh polymer sand. No summer heat on new sand, ready for the first cookout.' },
    beds:       { label: 'New beds & planting',   service: 'New installation',
                  why: 'Roots establish all winter, so spring beds fill in instead of struggling.' },
    trees:      { label: 'Trees & shrubs',        service: 'Plantings',
                  why: 'Fall through late winter is the best planting window in Charlotte.' },
    prune:      { label: 'Pruning',               service: 'Yard cleanup',
                  why: 'Dormant pruning for crape myrtles, hollies, boxwoods and summer bloomers. Spring bloomers wait.' },
    cleanup:    { label: 'Cleanup & mulch',       service: 'Natural mulching',
                  why: 'Leaves out, edges cut, real hardwood mulch down before spring weeds think about it.' },
    fence:      { label: 'Fence or gate',         service: 'Fences & gates',
                  why: 'Firm ground, no growing season to work around.' },
    build:      { label: 'Treehouse / structure', service: 'Custom treehouse or build',
                  why: 'Build in the off-season, enjoy it the first warm weekend.' },
    irrigation: { label: 'Irrigation check',      service: 'Not sure — help me figure it out',
                  why: 'Find cracked lines and bad heads now, before the system comes back on in spring.' },
    wash:       { label: 'Pressure washing',      service: 'Pressure washing',
                  why: 'Walks, walls and patios cleaned before guests show up in spring.' }
  };

  const TIPS = {
    December: 'December is wide open. Planting and cleanup can start right away.',
    January:  'January is prime pruning and build time. Ground is firm and plants are asleep.',
    February: 'February planting gives roots a head start before the first hot week in May.',
    March:    'March fills up fast. Lock in a date early and we finish before everything leafs out.',
    Flexible: 'Flexible is great. We will slot it into the first good weather window.'
  };

  const state = { projects: new Set(), timing: null, budget: null };

  const $ = (id) => document.getElementById(id);
  const els = {
    projects: $('plan-projects'), timing: $('plan-timing'), budget: $('plan-budget'),
    empty: $('plan-empty'), body: $('plan-body'), list: $('plan-list'),
    meta: $('plan-meta'), tip: $('plan-tip'), send: $('plan-send')
  };

  if (els.projects) {
    // Multi-select chips
    els.projects.addEventListener('click', (e) => {
      const btn = e.target.closest('.plan-chip'); if (!btn) return;
      const key = btn.dataset.key;
      if (state.projects.has(key)) { state.projects.delete(key); btn.classList.remove('is-on'); btn.setAttribute('aria-pressed', 'false'); }
      else { state.projects.add(key); btn.classList.add('is-on'); btn.setAttribute('aria-pressed', 'true'); }
      render();
    });
    // Single-select groups
    [['timing', els.timing], ['budget', els.budget]].forEach(([field, group]) => {
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('.plan-chip'); if (!btn) return;
        group.querySelectorAll('.plan-chip').forEach(b => { b.classList.remove('is-on'); b.setAttribute('aria-checked', 'false'); });
        if (state[field] === btn.dataset.key) { state[field] = null; }
        else { state[field] = btn.dataset.key; btn.classList.add('is-on'); btn.setAttribute('aria-checked', 'true'); }
        render();
      });
    });
    els.send.addEventListener('click', sendPlan);
    els.projects.querySelectorAll('.plan-chip').forEach(b => b.setAttribute('aria-pressed', 'false'));
    [els.timing, els.budget].forEach(g => g.querySelectorAll('.plan-chip').forEach(b => { b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); }));
  }

  function render() {
    const has = state.projects.size > 0;
    els.empty.classList.toggle('hidden', has);
    els.body.classList.toggle('hidden', !has);
    if (!has) return;

    els.list.innerHTML = [...state.projects].map(k => {
      const p = PROJECTS[k];
      return `<li class="flex gap-3">
        <span class="mt-1.5 w-2 h-2 rounded-full bg-forest-500 shrink-0"></span>
        <div><p class="font-semibold text-forest-900 leading-tight">${p.label}</p>
        <p class="text-sm text-forest-900/70">${p.why}</p></div></li>`;
    }).join('');

    const meta = [];
    meta.push(`<p><span class="text-forest-900/50">Timing:</span> ${state.timing || '<em>pick a month above</em>'}</p>`);
    meta.push(`<p><span class="text-forest-900/50">Budget:</span> ${state.budget || '<em>optional</em>'}</p>`);
    els.meta.innerHTML = meta.join('');

    els.tip.textContent = TIPS[state.timing] || (state.projects.size > 1
      ? 'Bundling jobs into one visit usually saves on trip and haul-off costs.'
      : 'Add a month and we will tell you how the timing works in your favor.');
  }

  function summaryText() {
    const list = [...state.projects].map(k => PROJECTS[k].label).join(', ');
    return `Winter plan: ${list}. Timing: ${state.timing || 'not set'}. Budget: ${state.budget || 'not set'}.`;
  }

  function sendPlan() {
    const form = document.querySelector('form[name="estimate"]');
    if (!form) return;
    const select = form.querySelector('select[name="service"]');
    const msg = form.querySelector('textarea[name="message"]');
    const plan = form.querySelector('input[name="plan"]');
    const text = summaryText();

    if (select) {
      // Single project → map to its service; multiple → winter project option
      let target = 'Winter project (planned on site)';
      if (state.projects.size === 1) target = PROJECTS[[...state.projects][0]].service;
      const opt = [...select.options].find(o => o.text.trim() === target);
      if (opt) select.value = opt.value;
    }
    if (plan) plan.value = text;
    if (msg) {
      const existing = msg.value.replace(/^Winter plan:.*$/m, '').trim();
      msg.value = text + (existing ? '\n\n' + existing : '\n\nAnything else we should know? ');
    }
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => form.querySelector('input[name="name"]')?.focus({ preventScroll: true }), 700);
  }

  /* =====================================================================
     2. GALLERY LIGHTBOX  (works on gallery, plantings, fences grids)
     ===================================================================== */
  const lb = $('lightbox');
  if (!lb) return;
  const lbImg = $('lb-img'), lbCap = $('lb-cap'), lbCount = $('lb-count');
  let items = [], idx = 0, lastFocus = null;

  const GRIDS = '[data-cms="gallery-grid"], [data-cms="plantings-grid"], [data-cms="fences-grid"]';

  function collect(grid) {
    return [...grid.querySelectorAll('a[href]')]
      .filter(a => !a.classList.contains('is-hidden') && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(a.getAttribute('href')))
      .map(a => ({
        src: a.getAttribute('href'),
        cap: a.dataset.caption || a.getAttribute('title') || a.querySelector('img')?.alt || ''
      }));
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const grid = a.closest(GRIDS); if (!grid) return;
    if (!/\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(a.getAttribute('href'))) return;
    e.preventDefault();
    items = collect(grid);
    idx = Math.max(0, items.findIndex(it => it.src === a.getAttribute('href')));
    open();
  });

  function show() {
    const it = items[idx]; if (!it) return;
    lbImg.src = it.src; lbImg.alt = it.cap;
    lbCap.textContent = it.cap;
    lbCount.textContent = items.length > 1 ? `${idx + 1} / ${items.length}` : '';
    $('lb-prev').style.display = $('lb-next').style.display = items.length > 1 ? 'flex' : 'none';
    // preload neighbours
    [idx + 1, idx - 1].forEach(i => { const n = items[(i + items.length) % items.length]; if (n) { const im = new Image(); im.src = n.src; } });
  }
  function open()  { lastFocus = document.activeElement; show(); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; $('lb-close').focus(); }
  function close() { lb.classList.remove('is-open'); document.body.style.overflow = ''; lbImg.src = ''; lastFocus?.focus?.(); }
  function step(d) { idx = (idx + d + items.length) % items.length; show(); }

  $('lb-close').addEventListener('click', close);
  $('lb-prev').addEventListener('click', () => step(-1));
  $('lb-next').addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
  // Swipe on touch
  let tx = null;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* =====================================================================
     3. GALLERY "SEE ALL PHOTOS"
     ===================================================================== */
  const moreBtn = $('gallery-more-btn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      const hidden = document.querySelectorAll('[data-cms="gallery-grid"] .gallery-more.is-hidden');
      hidden.forEach(el => el.classList.remove('is-hidden'));
      moreBtn.classList.add('hidden');
    });
    // cms-loader dispatches this after it renders the gallery
    document.addEventListener('gallery:rendered', (e) => {
      const extra = e.detail?.hidden || 0;
      if (extra > 0) { moreBtn.textContent = `See all ${e.detail.total} photos`; moreBtn.classList.remove('hidden'); }
    });
  }
})();

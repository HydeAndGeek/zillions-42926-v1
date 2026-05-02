/**
 * CMS Loader — pulls dynamic content from the markdown/json files
 * that Decap CMS writes to the repo. Pure client-side, no build step.
 */

// ----- 1. Site settings (phone, hours, hero text) ---------------------------
async function loadSiteSettings() {
  try {
    const res = await fetch('/content/_data/site.json', { cache: 'no-store' });
    if (!res.ok) return;
    const s = await res.json();

    setText('[data-cms="hero_title"]',    s.hero_title);
    setText('[data-cms="hero_subtitle"]', s.hero_subtitle);
    setText('[data-cms="hero_verse"]',    s.hero_verse);
    setText('[data-cms="about_verse"]',   s.about_verse);
    setText('[data-cms="hours"]',         s.hours);
    setText('[data-cms="service_area"]',  s.service_area);
    setText('[data-cms="business_name"]', s.business_name);

    // ----- Logo image (if uploaded, swap in for the SVG fallback) -----
    if (s.logo) {
      const img = document.querySelector('[data-cms="logo"]');
      const svg = document.querySelector('[data-cms="logo-fallback"]');
      if (img) {
        img.src = s.logo;
        if (s.logo_height) img.style.height = s.logo_height + 'px';
        img.style.display = 'block';
      }
      if (svg) svg.style.display = 'none';
    }
    if (s.hide_text_logo) {
      document.querySelectorAll('[data-cms="business_name_wrap"]').forEach(el => el.style.display = 'none');
    }

    // ----- Hero background image -----
    if (s.hero_image) {
      const hero = document.querySelector('[data-cms="hero-section"]');
      if (hero) {
        hero.style.backgroundImage =
          "linear-gradient(180deg, rgba(28,51,31,0.55) 0%, rgba(28,51,31,0.65) 100%), url('" + s.hero_image + "')";
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';
      }
    }

    // ----- Brand color (CSS variable, used wherever forest-700 is) -----
    if (s.brand_color && /^#[0-9a-fA-F]{3,8}$/.test(s.brand_color)) {
      document.documentElement.style.setProperty('--brand-color', s.brand_color);
    }

    // phone / email — show only if set
    document.querySelectorAll('[data-cms="phone"]').forEach(el => {
      if (s.phone) {
        el.textContent = s.phone;
        if (el.tagName === 'A') el.setAttribute('href', 'tel:' + s.phone.replace(/\D/g,''));
        el.closest('[data-cms-wrap="phone"]')?.removeAttribute('hidden');
      } else {
        el.closest('[data-cms-wrap="phone"]')?.setAttribute('hidden', '');
      }
    });
    document.querySelectorAll('[data-cms="email"]').forEach(el => {
      if (s.email) {
        el.textContent = s.email;
        if (el.tagName === 'A') el.setAttribute('href', 'mailto:' + s.email);
        el.closest('[data-cms-wrap="email"]')?.removeAttribute('hidden');
      } else {
        el.closest('[data-cms-wrap="email"]')?.setAttribute('hidden', '');
      }
    });
  } catch (err) { console.warn('Settings load failed', err); }
}

function setText(selector, value) {
  if (!value) return;
  document.querySelectorAll(selector).forEach(el => { el.textContent = value; });
}

// ----- 2. Gallery -----------------------------------------------------------
// We can't list a folder from the browser, so we fetch a manifest the CMS keeps
// in /content/gallery/index.json. We auto-generate the manifest with a small
// Netlify build hook OR we let Decap write it. Simplest: fetch a known list.
// For now, fetch the manifest if present, else show static placeholder.

async function loadGallery() {
  const grid = document.querySelector('[data-cms="gallery-grid"]');
  if (!grid) return;

  try {
    const res = await fetch('/content/gallery/index.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('no manifest');
    const items = await res.json();
    const featured = items.filter(i => i.featured !== false).slice(0, 6);

    if (featured.length === 0) return;
    grid.innerHTML = featured.map(item => `
      <a href="${item.image}" class="aspect-square bg-cover bg-center rounded-xl block hover:opacity-90 transition"
         style="background-image:url('${item.image}')"
         title="${escapeHtml(item.title || '')}">
      </a>
    `).join('');
  } catch (err) {
    // No manifest yet — leave the static placeholders that exist in HTML
    console.info('Gallery manifest not found, using defaults');
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// ----- 3. Videos ------------------------------------------------------------
async function loadVideos() {
  const grid = document.querySelector('[data-cms="videos-grid"]');
  const section = document.querySelector('[data-cms="videos-section"]');
  if (!grid || !section) return;

  try {
    const res = await fetch('/content/videos/index.json', { cache: 'no-store' });
    if (!res.ok) return;
    const items = await res.json();
    const featured = items.filter(v => v.featured !== false);
    if (featured.length === 0) return;

    grid.innerHTML = featured.map(v => renderVideoCard(v)).join('');
    section.removeAttribute('hidden');
  } catch (err) {
    console.info('Videos manifest not found yet');
  }
}

function renderVideoCard(v) {
  const title = escapeHtml(v.title || '');
  const desc  = v.description ? `<p class="text-sm text-forest-900/70 mt-2">${escapeHtml(v.description)}</p>` : '';

  // Aspect: portrait (Shorts/TikTok) = 9:16; square; default landscape 16:9
  const orient = (v.orientation || '').toLowerCase();
  let aspectClass = 'aspect-video';     // 16:9
  let widthClass  = 'w-full';
  if (orient.includes('portrait') || orient.includes('short') || orient.includes('9:16')) {
    aspectClass = 'aspect-[9/16]';
    widthClass  = 'w-full max-w-[360px] mx-auto';
  } else if (orient.includes('square') || orient.includes('1:1')) {
    aspectClass = 'aspect-square';
    widthClass  = 'w-full max-w-[480px] mx-auto';
  }

  let player = '';
  const src = (v.source || 'YouTube').toLowerCase();

  if (src.includes('youtube') && v.youtube_id) {
    player = `
      <div class="relative ${widthClass} ${aspectClass} rounded-xl overflow-hidden bg-forest-100">
        <iframe class="absolute inset-0 w-full h-full"
          src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube_id)}?rel=0"
          title="${title}" loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>`;
  } else if (src.includes('vimeo') && v.vimeo_id) {
    player = `
      <div class="relative ${widthClass} ${aspectClass} rounded-xl overflow-hidden bg-forest-100">
        <iframe class="absolute inset-0 w-full h-full"
          src="https://player.vimeo.com/video/${encodeURIComponent(v.vimeo_id)}"
          title="${title}" loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen></iframe>
      </div>`;
  } else if (v.video_file) {
    const poster = v.poster ? ` poster="${escapeHtml(v.poster)}"` : '';
    player = `
      <video class="${widthClass} ${aspectClass} rounded-xl bg-forest-100 object-cover" controls preload="metadata" playsinline${poster}>
        <source src="${escapeHtml(v.video_file)}" type="video/mp4">
        Your browser doesn't support video playback.
      </video>`;
  } else {
    return ''; // missing data, skip
  }

  return `
    <figure>
      ${player}
      <figcaption class="mt-3">
        <p class="font-display text-lg font-semibold text-forest-900">${title}</p>
        ${desc}
      </figcaption>
    </figure>`;
}

// ----- 4. Patio Maintenance — before/after carousel ------------------------
async function loadMaintenance() {
  const root = document.querySelector('[data-cms="ba-carousel"]');
  if (!root) return;

  let data;
  try {
    const res = await fetch('/content/_data/maintenance.json', { cache: 'no-store' });
    if (!res.ok) return;
    data = await res.json();
  } catch { return; }

  // Headline / subhead from JSON (overrides static HTML if set)
  setText('[data-cms="maintenance_headline"]', data.headline);
  setText('[data-cms="maintenance_subhead"]',  data.subhead);

  const pairs = (data.pairs || []).filter(p => p.before && p.after);
  if (!pairs.length) return;

  const track = root.querySelector('.ba-track');
  const dots  = root.querySelector('.ba-dots');

  // Render slides
  track.innerHTML = pairs.map((p, i) => `
    <figure class="ba-slide ${i === 0 ? 'active' : ''}" data-idx="${i}">
      <div class="ba-pair grid grid-cols-2 gap-1 md:gap-2">
        <div class="relative aspect-[4/5] md:aspect-[4/3] overflow-hidden">
          <img src="${p.before}" alt="Before — ${escapeHtml(p.title || '')}" loading="lazy" class="absolute inset-0 w-full h-full object-cover">
          <span class="absolute top-3 left-3 bg-forest-900/85 text-cream-50 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full">Before</span>
        </div>
        <div class="relative aspect-[4/5] md:aspect-[4/3] overflow-hidden">
          <img src="${p.after}" alt="After — ${escapeHtml(p.title || '')}" loading="lazy" class="absolute inset-0 w-full h-full object-cover">
          <span class="absolute top-3 right-3 bg-cream-50 text-forest-900 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full">After</span>
        </div>
      </div>
      <figcaption class="px-5 py-4 bg-white">
        <p class="font-display text-lg font-semibold text-forest-900">${escapeHtml(p.title || '')}</p>
        ${p.caption ? `<p class="text-sm text-forest-900/70 mt-1">${escapeHtml(p.caption)}</p>` : ''}
      </figcaption>
    </figure>
  `).join('');

  // Render dots
  dots.innerHTML = pairs.map((_, i) =>
    `<button type="button" class="ba-dot w-2.5 h-2.5 rounded-full transition" data-idx="${i}" aria-label="Slide ${i + 1}"></button>`
  ).join('');

  // Inject slide CSS once
  if (!document.getElementById('ba-style')) {
    const style = document.createElement('style');
    style.id = 'ba-style';
    style.textContent = `
      .ba-track { min-height: 320px; }
      .ba-slide { position: absolute; inset: 0; opacity: 0; transition: opacity .55s ease; pointer-events: none; }
      .ba-slide.active { position: relative; opacity: 1; pointer-events: auto; }
      .ba-dot { background: #d6d3c8; }
      .ba-dot.active { background: #2f5233; transform: scale(1.3); }
    `;
    document.head.appendChild(style);
  }

  // State + controls
  let idx = 0;
  let timer = null;
  const slides = root.querySelectorAll('.ba-slide');
  const dotEls = root.querySelectorAll('.ba-dot');

  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dotEls.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  function next() { go(idx + 1); }
  function prev() { go(idx - 1); }
  function start() { stop(); timer = setInterval(next, 5500); }
  function stop()  { if (timer) clearInterval(timer); timer = null; }

  go(0);
  start();

  root.querySelector('.ba-prev').addEventListener('click', () => { prev(); start(); });
  root.querySelector('.ba-next').addEventListener('click', () => { next(); start(); });
  dotEls.forEach(d => d.addEventListener('click', e => { go(+e.currentTarget.dataset.idx); start(); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; stop(); }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    start();
  });

  // Supervisor card overrides
  if (data.supervisor) {
    const img = document.querySelector('[data-cms="supervisor-img"]');
    if (img && data.supervisor.image) img.src = data.supervisor.image;
    setText('[data-cms="supervisor-title"]',   data.supervisor.title);
    setText('[data-cms="supervisor-caption"]', data.supervisor.caption);
  }
}

// ----- 5. Plantings grid ----------------------------------------------------
async function loadPlantings() {
  const grid = document.querySelector('[data-cms="plantings-grid"]');
  if (!grid) return;

  try {
    const res = await fetch('/content/_data/plantings.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setText('[data-cms="plantings_headline"]', data.headline);
    setText('[data-cms="plantings_subhead"]',  data.subhead);
    const items = data.items || [];
    if (!items.length) return;
    grid.innerHTML = items.map(it => `
      <a href="${it.image}" class="group relative aspect-square block rounded-xl overflow-hidden bg-forest-100">
        <img src="${it.image}" alt="${escapeHtml(it.title || '')}" loading="lazy"
             class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        ${it.caption ? `<div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-forest-900/85 to-transparent text-cream-50 text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">${escapeHtml(it.caption)}</div>` : ''}
      </a>
    `).join('');
  } catch { /* silent */ }
}

// ----- 6. Fences & Gates grid -----------------------------------------------
async function loadFences() {
  const grid = document.querySelector('[data-cms="fences-grid"]');
  if (!grid) return;
  try {
    const res = await fetch('/content/_data/fences.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setText('[data-cms="fences_headline"]', data.headline);
    setText('[data-cms="fences_subhead"]',  data.subhead);
    const items = data.items || [];
    if (!items.length) return;
    grid.innerHTML = items.map(it => `
      <a href="${it.image}" class="group relative aspect-[3/4] block rounded-xl overflow-hidden bg-forest-100">
        <img src="${it.image}" alt="${escapeHtml(it.title || '')}" loading="lazy"
             class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-forest-900/90 via-forest-900/40 to-transparent text-cream-50">
          <p class="text-sm font-semibold">${escapeHtml(it.title || '')}</p>
          ${it.caption ? `<p class="text-xs text-cream-50/80 mt-0.5">${escapeHtml(it.caption)}</p>` : ''}
        </div>
      </a>
    `).join('');
  } catch { /* silent */ }
}

// ----- 7. Run on page load --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSiteSettings();
  loadGallery();
  loadVideos();
  loadMaintenance();
  loadPlantings();
  loadFences();
});

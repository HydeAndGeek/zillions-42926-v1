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

  let player = '';
  const src = (v.source || 'YouTube').toLowerCase();

  if (src.includes('youtube') && v.youtube_id) {
    player = `
      <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-forest-100">
        <iframe class="absolute inset-0 w-full h-full"
          src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube_id)}?rel=0"
          title="${title}" loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>`;
  } else if (src.includes('vimeo') && v.vimeo_id) {
    player = `
      <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-forest-100">
        <iframe class="absolute inset-0 w-full h-full"
          src="https://player.vimeo.com/video/${encodeURIComponent(v.vimeo_id)}"
          title="${title}" loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen></iframe>
      </div>`;
  } else if (v.video_file) {
    const poster = v.poster ? ` poster="${escapeHtml(v.poster)}"` : '';
    player = `
      <video class="w-full aspect-video rounded-xl bg-forest-100" controls preload="metadata" playsinline${poster}>
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

// ----- 4. Run on page load --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSiteSettings();
  loadGallery();
  loadVideos();
});

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

// ----- 3. Run on page load --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSiteSettings();
  loadGallery();
});

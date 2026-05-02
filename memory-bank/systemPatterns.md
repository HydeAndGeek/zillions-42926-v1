# System Patterns — Zillions Landscaping Website

## Architecture: Static Site + Client-Side CMS Loader

This is a **zero-build static HTML site** with a client-side dynamic content layer. No Node.js, no build step, no framework.

```
index.html          ← single page, all sections
js/cms-loader.js    ← fetches JSON/markdown at runtime, injects into DOM
content/_data/      ← JSON config files (site settings, sections)
content/gallery/    ← markdown entries + index.json manifest
content/videos/     ← markdown entries + index.json manifest
images/             ← static images (hero, logo, favicon, og-image)
images/projects/    ← project/work photos (numbered by ID)
uploads/            ← CMS-uploaded photos (via Decap CMS)
admin/              ← Decap CMS (config.yml + index.html)
```

## Content Data Flow

```
Decap CMS (/admin)
    ↓ writes markdown + uploads images
content/gallery/index.json  (gallery manifest)
content/videos/index.json   (video manifest)
content/_data/site.json     (site settings: phone, email, hours, etc.)
content/_data/fences.json   (fences section grid)
content/_data/maintenance.json  (patio before/after carousel)
content/_data/plantings.json    (plantings grid)
    ↓ fetched by
js/cms-loader.js (fetch + DOM injection at page load)
    ↓ renders into
index.html [data-cms="..."] target elements
```

## Key DOM Conventions

All CMS-injectable elements use `data-cms="key"` attributes:
- `data-cms="hero_title"` — text content replaced
- `data-cms="gallery-grid"` — innerHTML replaced with rendered cards
- `data-cms="fences-grid"` — innerHTML replaced
- `data-cms="ba-carousel"` — before/after carousel with dot nav
- `data-cms="videos-section"` — `hidden` attribute removed when videos exist
- `data-cms-wrap="phone"` — wrapper hidden/shown based on whether value is set

## CMS: Decap CMS (Netlify CMS)
- Config: `admin/config.yml`
- Auth: Netlify Identity widget
- Publishes directly to GitHub repo via Git Gateway
- Each gallery/video entry is a markdown file with YAML frontmatter
- Section data (fences, maintenance, plantings, site) are JSON files

## Deployment
- **Host:** Netlify (free tier)
- **Trigger:** Push to `main` branch on GitHub → auto deploy
- **No build command** — static files served directly
- **Forms:** Netlify Forms (`data-netlify="true"` on `<form>`) — 100/month free
- **DNS:** Managed via Netlify or external registrar pointing to Netlify

## Styling
- **Tailwind CSS via CDN** — no build step, loaded from `cdn.tailwindcss.com`
- **Custom config** inline in `<script>` tag:
  - Colors: `forest` (greens), `cream` (off-whites), `earth` (browns)
  - Fonts: `display` = Fraunces (serif), `sans` = Inter
- Brand color: `#2f5233` (forest-700)

## Performance Notes
- Images are not lazy-loaded at the HTML level for hero; all project images use `loading="lazy"`
- No image optimization pipeline — images served as-is from `/images/projects/`
- Tailwind CDN adds ~350KB to page load — acceptable for a small business site

## Schema / SEO
- Two inline JSON-LD blocks in `<head>`:
  1. `LandscapingBusiness` with full structured data
  2. Second `LandscapingBusiness` with phone/email (currently has empty strings — bug)
- `sitemap.xml` present
- `robots.txt` present
- Open Graph + Twitter Card meta tags present
- Canonical URL set to `https://zillionslandscaping.com/`

## Known Bugs
1. `plantings.json` references `/images/projects/508.jpg` — file does not exist
2. Schema.org second JSON-LD block has empty `"telephone": ""` and `"email": ""` — not updated when site.json changes
3. Inline schema in head must be manually updated if phone/email changes (it's not data-cms driven)

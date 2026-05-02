# Active Context — Zillions Landscaping Website

## Current Status
Site is live at https://zillionslandscaping.com and deploying via Netlify from GitHub `main` branch.

## What Was Just Completed (Session: 2026-05-02)

### Commit 1: `7f5a7c7`
- Populated `content/gallery/index.json` with 12 real project photos (was 1 hero placeholder)
- Updated `js/cms-loader.js` gallery slice from 6 → 12 photos
- Replaced "Add photos in the editor" placeholder boxes in gallery HTML with animated shimmer skeletons

### Commit 2: `ff7d367`
- Added phone `1-828-623-2506` and email `zillionsLandscaping@gmail.com` to `content/_data/site.json`
- Added mobile hamburger menu (≡ toggle button + dropdown panel) to `index.html`
- Expanded contact form service dropdown: added Custom Treehouse, Fences & Gates, Patio Restoration, Plantings

## Immediate Next Steps (Priority Order)

### 1. 🔔 Enable Netlify Form Email Notifications (5 min — owner does this)
Go to: Netlify dashboard → Sites → zillions → Forms → estimate → Notifications → Add email notification → enter zillionsLandscaping@gmail.com  
This ensures every estimate request hits your inbox immediately.

### 2. 📸 Add more gallery photos via CMS (owner does this)
The gallery shows 12 photos but only uses project images that were already in the repo. Owner can log into `/admin`, go to Gallery, and add new entries with uploaded photos at any time.

### 3. 🖼️ Replace About section placeholder image (code change needed)
The about section still uses `hero.jpg` as the background. Replace with a photo of the crew/truck/owner.  
File: `index.html` line ~464: `style="background-image:url('./images/hero.jpg')"`

### 4. 🌐 Migrate from Netlify → Cloudflare Pages (when hitting limits)
Netlify free: 100GB bandwidth, 300 build minutes/month.  
Cloudflare Pages: unlimited bandwidth, 500 builds/month, same Git-push workflow.  
Steps: Create Cloudflare account → Pages → Connect GitHub repo → set build to none (static site) → update DNS.

### 5. 🤖 Deploy OpenHands AI Agent (self-hosted)
For owner to get a browser-based AI that can edit/push code:
- Repo: https://github.com/All-Hands-AI/OpenHands
- Deploy on DigitalOcean Droplet (~$6/month) or Hetzner (~$4/month)
- Connect OpenRouter API key
- Can then edit this website from any browser, push to GitHub
- See: https://docs.all-hands.dev/modules/usage/installation

### 6. 📝 Blog / SEO content (future)
The site has no blog. Adding local SEO blog posts ("Best native plants for Charlotte NC yards", etc.) would drive organic search traffic significantly.

## Known Issues / Watchlist
- The `plantings.json` references `/images/projects/508.jpg` which does NOT exist in the repo — will silently fail to load that image
- The videos section is hidden by default and only shows if `content/videos/index.json` has featured entries — currently hidden
- The schema.org structured data has empty `telephone` and `email` fields in the inline `<script>` tag in `index.html` head (separate from site.json — needs manual update)

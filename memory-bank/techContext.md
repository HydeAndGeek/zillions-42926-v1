# Tech Context — Zillions Landscaping Website

## Development Environment
- **OS:** Windows 11
- **Shell:** PowerShell 7 (`pwsh.exe`) — use `;` not `&&` for command chaining
- **Editor:** VS Code with Roo/Cline AI assistant
- **Working directory:** `C:/Users/hyden/Downloads/zillions-42926-v1`

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| HTML | Plain HTML5 | Single `index.html`, `thanks.html` |
| CSS | Tailwind CSS via CDN | `cdn.tailwindcss.com` — no build |
| JS | Vanilla JS (ES6) | `js/cms-loader.js` — no framework |
| Fonts | Google Fonts | Fraunces + Inter |
| CMS | Decap CMS (Netlify CMS) | `/admin/` — config in `admin/config.yml` |
| Auth | Netlify Identity | For CMS login |
| Forms | Netlify Forms | `data-netlify="true"` on form element |
| Hosting | Netlify (free tier) | Auto-deploy from GitHub `main` |
| Repo | GitHub | `github.com/HydeAndGeek/zillions-42926-v1` |
| Domain | zillionslandscaping.com | DNS → Netlify |

## Owner's API / Tool Stack
- **OpenRouter API** — access to multiple LLMs (GPT-4, Claude, etc.)
- **OpenAI API** — direct OpenAI access
- **Perplexity Pro** — $5/month computer credits (use for research only, not coding)
- **Netlify free** — 100GB bandwidth, 300 build minutes, 100 form submissions/month

## Git Workflow
```bash
# Make changes to files
git add <files>
git commit -m "description"
git push origin main
# → Netlify auto-detects push and deploys in ~1-2 minutes
```
**Important:** Always use `;` for PowerShell command chaining, not `&&`

## File Structure
```
/
├── index.html              # Main single-page site
├── thanks.html             # Form submission thank-you page
├── robots.txt
├── sitemap.xml
├── netlify.toml            # Netlify config (redirects, headers)
├── build.py / build.sh     # Unused build scripts (not needed)
├── admin/
│   ├── config.yml          # Decap CMS collection definitions
│   └── index.html          # CMS admin app entry point
├── content/
│   ├── _data/
│   │   ├── site.json       # Global site settings (phone, email, hours, etc.)
│   │   ├── fences.json     # Fences section images + captions
│   │   ├── maintenance.json # Patio before/after pairs + supervisor card
│   │   └── plantings.json  # Plantings grid images
│   ├── gallery/
│   │   ├── index.json      # Gallery manifest (12 entries as of 2026-05-02)
│   │   └── *.md            # Individual gallery post entries
│   └── videos/
│       ├── index.json      # Video manifest
│       └── *.md            # Individual video entries
├── images/
│   ├── hero.jpg            # Hero section background
│   ├── logo-full.png       # Full logo
│   ├── logo-mark.png       # Logo mark (used by CMS)
│   ├── og-image.jpg        # Open Graph share image
│   ├── favicon.*           # Favicons
│   └── projects/           # 33 project photos (numbered JPEGs)
├── uploads/                # CMS-uploaded images (5 files, duplicates of projects/)
└── js/
    └── cms-loader.js       # All dynamic content loading logic
```

## Hosting Limits & Migration Plan

### Current: Netlify Free
- Bandwidth: 100GB/month
- Build minutes: 300/month
- Forms: 100 submissions/month
- Suitable for now

### Future: Cloudflare Pages (when needed)
- Unlimited bandwidth
- 500 builds/month
- No form handling (need Cloudflare Workers or Formspree for forms)
- Same Git-push workflow
- Migration: Connect GitHub repo to Cloudflare Pages, update DNS

### AI Agent (Future Setup)
- **OpenHands** (https://github.com/All-Hands-AI/OpenHands)
- Deploy on DigitalOcean ($6/mo) or Hetzner ($4/mo) Droplet
- Connect with OpenRouter API key
- Provides web browser UI for AI-assisted code editing + Git push
- Alternative to using Roo/Cline locally

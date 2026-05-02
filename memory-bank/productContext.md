# Product Context — Zillions Landscaping Website

## What This Project Is
A public-facing marketing website for **Zillions Landscaping**, a family-owned, all-natural landscaping company based in Charlotte, NC.

Live URL: **https://zillionslandscaping.com**
GitHub repo: **https://github.com/HydeAndGeek/zillions-42926-v1**

## What Problem It Solves
- Gives the business a professional online presence to attract local customers
- Showcases completed project work (gallery, before/after patios, fences, builds)
- Provides a contact/estimate request form so leads can reach out
- Communicates brand values: all-natural, no chemicals, no dyes, faith-rooted, family-owned

## Who the User/Owner Is
- Owner: Hyden (HydeAndGeek on GitHub)
- Non-technical user — comfortable with Notion, not a developer
- Wants to be able to edit the site content without coding
- Uses: OpenRouter API, OpenAI API, Perplexity Pro ($5 computer credits)
- Wants to eventually self-host an AI agent (OpenHands) to manage the site

## Business Details
- **Business name:** Zillions Landscaping
- **Phone:** 1-828-623-2506
- **Email:** zillionsLandscaping@gmail.com
- **Hours:** Mon–Sat · 7am–6pm
- **Service area:** Charlotte, NC · Matthews · Mint Hill · Pineville · Ballantyne · Indian Trail · Waxhaw · Huntersville · Cornelius · Davidson · Concord
- **Brand values:** All-natural, no chemicals, no dyes, native plants, family-owned, faith-rooted (Colossians 3:23)

## Services Offered
1. New installations (beds, walkways, plantings, sod, edging)
2. Design / build
3. Custom treehouses and builds (pergolas, arbors, raised beds, fire pits)
4. Natural mulching (real shredded hardwood, no dyes)
5. Yard cleanup (spring/fall, leaf removal, brush hauling)
6. Pressure washing (driveways, walkways, decks, siding, fences)
7. Fences & gates (vinyl privacy, wood fences, custom gates)
8. Patio restoration (pressure wash + polymer sand, every 2–3 years)
9. Plantings (native plants, bed installs)

## How It Should Work
- Owner pushes changes to GitHub → Netlify auto-deploys to zillionslandscaping.com
- Content can be edited via the Decap CMS at `/admin` (Netlify Identity required)
- Dynamic content (gallery, videos, fences, plantings, patio carousel) is loaded client-side from JSON/markdown files by `js/cms-loader.js`
- Contact form submissions go to Netlify Forms dashboard (100/month free)

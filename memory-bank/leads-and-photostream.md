# Lead alerts + Google Photos auto-gallery (added Nov 2026)

## Instant phone alert on every estimate request
Netlify Forms → `netlify/functions/notify-lead.mjs` (event `formSubmitted`) → ntfy push → phone.
Setup (one time, ~5 min):
1. Install **ntfy** (open source): Play Store / F-Droid "ntfy". Open it → "+" → subscribe to a topic.
   Topic = password. Use something long, e.g. `zillions-leads-7Hq2Vx9pLm`.
2. Netlify → Site configuration → Environment variables → Add: `NTFY_TOPIC` = that topic. Redeploy.
3. In ntfy app: topic settings → notification priority "max"; optional: allow override Do Not Disturb.
Each lead arrives with name, phone, service, winter plan + buttons: Call now / Text back / Email.
Backup: Netlify → Forms → Submission notifications → Email → zillionsLandscaping@gmail.com.

## Auto-synced "Fresh from the field" gallery
GitHub Action `.github/workflows/photostream.yml` runs every 3h (or tap "Run workflow"):
reads the shared Google Photos album → `content/_data/photostream.json` → Netlify redeploys.
Setup:
1. Google Photos → New album "Zillions Website" → Share → Create link (turn off collaborate/comments).
2. Paste link into /admin → Site Settings → "Fresh From The Field" → album link (or edit the JSON).
3. Add photos to that album from your phone; site updates within 3 hours.
Section stays hidden until the album has photos. Remove a photo from the album → gone next sync.

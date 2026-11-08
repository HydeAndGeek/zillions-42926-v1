// Pulls image URLs from a *shared* Google Photos album (link sharing on) and
// writes them to content/_data/photostream.json. Runs on a schedule via
// .github/workflows/photostream.yml; Netlify redeploys when the file changes.
// No Google API keys needed: it reads the public album page.
import { readFileSync, writeFileSync } from 'node:fs';
import { fetchImageUrls } from 'google-photos-album-image-url-fetch';

const FILE = 'content/_data/photostream.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const url = (process.env.ALBUM_URL || data.album_url || '').trim();

if (!url) { console.log('photostream: no album_url set, nothing to do'); process.exit(0); }

const raw = await fetchImageUrls(url);
if (!Array.isArray(raw) || raw.length === 0) {
  console.error('photostream: album returned 0 items — is link sharing on? keeping previous list');
  process.exit(0);
}

const max = Number(data.max_items) || 18;
const items = raw
  .filter(i => i.url && i.width && i.height)
  .sort((a, b) => (b.albumAddDate || b.imageUpdateDate || 0) - (a.albumAddDate || a.imageUpdateDate || 0))
  .slice(0, max)
  .map(i => ({
    id: i.uid,
    // Google serves any size on demand: =w1600 (full), =w600 (grid thumb)
    full:  `${i.url}=w1600`,
    thumb: `${i.url}=w600-h600-c`,
    width: i.width,
    height: i.height,
    added: i.albumAddDate ? new Date(i.albumAddDate).toISOString() : null,
  }));

const before = JSON.stringify(data.items);
if (before === JSON.stringify(items)) { console.log(`photostream: no change (${items.length} items)`); process.exit(0); }

data.items = items;
data.updated = new Date().toISOString();
writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
console.log(`photostream: wrote ${items.length} items from ${raw.length} in album`);

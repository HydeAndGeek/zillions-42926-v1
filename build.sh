#!/usr/bin/env bash
# Build step: generate /content/gallery/index.json from the markdown files
# Runs on Netlify before deploy.
set -e

GALLERY_DIR="content/gallery"
OUT="${GALLERY_DIR}/index.json"

if [ ! -d "$GALLERY_DIR" ]; then
  echo "[]" > "$OUT"
  exit 0
fi

echo "[" > "$OUT"
first=1
for f in "$GALLERY_DIR"/*.md; do
  [ -e "$f" ] || continue
  # parse frontmatter
  title=$(awk -F': ' '/^title:/ {gsub(/^"|"$/,"",$2); print $2; exit}' "$f")
  image=$(awk -F': ' '/^image:/ {gsub(/^"|"$/,"",$2); print $2; exit}' "$f")
  date=$(awk -F': ' '/^date:/ {gsub(/^"|"$/,"",$2); print $2; exit}' "$f")
  featured=$(awk -F': ' '/^featured:/ {print $2; exit}' "$f")
  description=$(awk -F': ' '/^description:/ {gsub(/^"|"$/,"",$2); print $2; exit}' "$f")

  [ "$first" -eq 0 ] && echo "," >> "$OUT"
  first=0

  cat >> "$OUT" <<EOF
  {
    "title": $(printf '%s' "$title" | jq -Rs .),
    "image": $(printf '%s' "$image" | jq -Rs .),
    "date": $(printf '%s' "$date" | jq -Rs .),
    "featured": ${featured:-true},
    "description": $(printf '%s' "$description" | jq -Rs .)
  }
EOF
done
echo "]" >> "$OUT"

echo "Built $OUT"
cat "$OUT"

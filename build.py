#!/usr/bin/env python3
"""Generate JSON manifests for client-side rendering.

Reads markdown files in content/gallery and content/videos,
parses simple YAML frontmatter, writes index.json in each folder.
"""
import json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).parent
COLLECTIONS = ["gallery", "videos"]


def parse_frontmatter(text: str) -> dict:
    """Naive YAML frontmatter parser. Handles strings, bools, numbers."""
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    body = parts[1]
    out = {}
    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r'^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$', line)
        if not m:
            continue
        k, v = m.group(1), m.group(2).strip()
        # Strip wrapping quotes
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        # Type coerce
        if v.lower() == "true":
            v = True
        elif v.lower() == "false":
            v = False
        elif v == "":
            v = ""
        elif re.match(r'^-?\d+$', v):
            v = int(v)
        out[k] = v
    return out


def build_manifest(folder: str):
    src = ROOT / "content" / folder
    out_path = src / "index.json"
    if not src.exists():
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text("[]")
        print(f"  {folder}: empty (folder missing)")
        return
    items = []
    for md in sorted(src.glob("*.md")):
        try:
            data = parse_frontmatter(md.read_text(encoding="utf-8"))
            if data:
                items.append(data)
        except Exception as e:
            print(f"  WARN: skipping {md.name}: {e}", file=sys.stderr)
    # newest first
    items.sort(key=lambda i: str(i.get("date", "")), reverse=True)
    out_path.write_text(json.dumps(items, indent=2, ensure_ascii=False))
    print(f"  {folder}: {len(items)} items → {out_path.relative_to(ROOT)}")


def main():
    print("Building content manifests...")
    for c in COLLECTIONS:
        build_manifest(c)
    print("Done.")


if __name__ == "__main__":
    main()

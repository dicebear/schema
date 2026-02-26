#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$BASE_DIR/../src"
DIST_DIR="$BASE_DIR/../dist"

echo "Minify definition files."

mkdir -p "$DIST_DIR"

exports="{}"

for f in "$TARGET_DIR"/*.json; do

  [ -f "$f" ] || continue

  name=$(basename "$f" .json)
  echo "  Minify ${name}.json"
  jq -c . "$f" > "$DIST_DIR/${name}.min.json"

  exports=$(echo "$exports" | jq --arg key "./${name}.json" --arg val "./dist/${name}.min.json" '. + {($key): {types: $val, default: $val}}')

done

echo "Update exports in package.json."

PACKAGE_FILE="$BASE_DIR/../package.json"
jq --argjson exports "$exports" '. + {exports: $exports}' "$PACKAGE_FILE" > "$PACKAGE_FILE.tmp"
mv "$PACKAGE_FILE.tmp" "$PACKAGE_FILE"

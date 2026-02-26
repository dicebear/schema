#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$BASE_DIR/../src"
DIST_DIR="$BASE_DIR/../dist"
PACKAGE_FILE="$BASE_DIR/../package.json"

echo "Minify definition files."

mkdir -p "$DIST_DIR"

version=$(jq -r '.version' "$PACKAGE_FILE")
exports="{}"

for f in "$TARGET_DIR"/*.json; do

  [ -f "$f" ] || continue

  name=$(basename "$f" .json)
  echo "  Minify ${name}.json"

  id="https://cdn.hopjs.net/npm/@dicebear/schema@${version}/dist/${name}.min.json"
  jq -c --arg id "$id" '{"$id": $id} + .' "$f" > "$DIST_DIR/${name}.min.json"

  exports=$(echo "$exports" | jq --arg key "./${name}.json" --arg val "./dist/${name}.min.json" '. + {($key): {types: $val, default: $val}}')

done

echo "Update exports in package.json."

jq --argjson exports "$exports" '. + {exports: $exports}' "$PACKAGE_FILE" > "$PACKAGE_FILE.tmp"
mv "$PACKAGE_FILE.tmp" "$PACKAGE_FILE"

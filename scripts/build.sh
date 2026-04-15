#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$BASE_DIR/../src"
DIST_DIR="$BASE_DIR/../dist"
PACKAGE_FILE="$BASE_DIR/../package.json"

version=$(jq -r '.version' "$PACKAGE_FILE")

echo "Minify schemas (version ${version})."

mkdir -p "$DIST_DIR"

for f in "$SRC_DIR"/*.json; do

  [ -f "$f" ] || continue

  name=$(basename "$f" .json)
  echo "  Minify ${name}.json"

  id="https://cdn.hopjs.net/npm/@dicebear/schema@${version}/dist/${name}.min.json"
  jq -c --arg id "$id" '{"$id": $id} + .' "$f" > "$DIST_DIR/${name}.min.json"

done

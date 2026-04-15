#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_FILE="$BASE_DIR/../package.json"
README_FILE="$BASE_DIR/../README.md"

version=$(jq -r '.version' "$PACKAGE_FILE")

echo "Sync README CDN URLs to version ${version}."

sed -i.bak "s|cdn.hopjs.net/npm/@dicebear/schema@[^/]*/dist/|cdn.hopjs.net/npm/@dicebear/schema@${version}/dist/|g" "$README_FILE"
rm "${README_FILE}.bak"

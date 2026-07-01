#!/usr/bin/env bash
# Build static exports for gogogo.social and biig.works.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

bash "$ROOT/scripts/build-gogogo-social.sh"
bash "$ROOT/scripts/build-biig-works.sh"

echo "==> All brand exports built"

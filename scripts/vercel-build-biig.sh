#!/usr/bin/env bash
# Vercel build entrypoint for biig.works (second Vercel project on this repo).
# See docs/biig-works-vercel-migration.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export BIIG_OUT="${BIIG_OUT:-$ROOT/biig-export}"

bash "$ROOT/scripts/build-biig-works.sh"

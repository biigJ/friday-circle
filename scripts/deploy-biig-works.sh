#!/usr/bin/env bash
# Build biig.works export and push to github.com/biigJ/biig-works (biig.works).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIIG_OUT="${BIIG_OUT:-$HOME/biig-works}"
BIIG_REMOTE="${BIIG_REMOTE:-https://github.com/biigJ/biig-works.git}"
MSG="${1:-Sync biig.works from friday-circle}"

if [[ ! -d "$BIIG_OUT/.git" ]]; then
  echo "==> Cloning biig-works into $BIIG_OUT"
  mkdir -p "$(dirname "$BIIG_OUT")"
  git clone "$BIIG_REMOTE" "$BIIG_OUT"
fi

export BIIG_OUT
bash "$ROOT/scripts/build-biig-works.sh"

cd "$BIIG_OUT"
git add -A

if git diff --staged --quiet; then
  echo "==> biig.works already up to date — nothing to push"
  exit 0
fi

git commit -m "$MSG"
git push origin HEAD

echo "==> biig.works deployed ($(git rev-parse --short HEAD))"

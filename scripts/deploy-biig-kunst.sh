#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KUNST_OUT="${KUNST_OUT:-$HOME/biig-kunst}"
KUNST_REMOTE="${KUNST_REMOTE:-https://github.com/biigJ/biig-kunst.git}"
MSG="${1:-Sync kunst.biig.works from friday-circle}"

if [[ ! -d "$KUNST_OUT/.git" ]]; then
  echo "==> Cloning biig-kunst into $KUNST_OUT"
  mkdir -p "$(dirname "$KUNST_OUT")"
  git clone "$KUNST_REMOTE" "$KUNST_OUT" 2>/dev/null || {
    mkdir -p "$KUNST_OUT"
    cd "$KUNST_OUT"
    git init
    git remote add origin "$KUNST_REMOTE"
    git fetch origin 2>/dev/null || true
    if git show-ref --verify --quiet refs/remotes/origin/main; then
      git checkout -b main origin/main
    else
      git checkout -b main
    fi
  }
fi

export KUNST_OUT
bash "$ROOT/scripts/build-biig-kunst.sh"

cd "$KUNST_OUT"
git add -A
if git diff --staged --quiet; then
  echo "==> kunst.biig.works already up to date"
  exit 0
fi
git commit -m "$MSG"
git push -u origin HEAD 2>/dev/null || git push origin HEAD
echo "==> kunst.biig.works deployed ($(git rev-parse --short HEAD))"

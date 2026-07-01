#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GOGOGO_OUT="${GOGOGO_OUT:-$HOME/gogogo-social}"
GOGOGO_REMOTE="${GOGOGO_REMOTE:-https://github.com/biigJ/gogogo-social.git}"
MSG="${1:-Sync gogogo.social from friday-circle}"

if [[ ! -d "$GOGOGO_OUT/.git" ]]; then
  echo "==> Cloning gogogo-social into $GOGOGO_OUT"
  mkdir -p "$(dirname "$GOGOGO_OUT")"
  git clone "$GOGOGO_REMOTE" "$GOGOGO_OUT"
fi

export GOGOGO_OUT
bash "$ROOT/scripts/build-gogogo-social.sh"

cd "$GOGOGO_OUT"
git add -A
if git diff --staged --quiet; then
  echo "==> gogogo.social already up to date"
  exit 0
fi
git commit -m "$MSG"
git push origin HEAD
echo "==> gogogo.social deployed ($(git rev-parse --short HEAD))"

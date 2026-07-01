#!/usr/bin/env bash
# Build static export for gogogo.social from friday-circle sources.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/sed-inplace.sh
source "$ROOT/scripts/lib/sed-inplace.sh"

GOGOGO_OUT="${GOGOGO_OUT:-$HOME/gogogo-social}"

echo "==> Building gogogo.social export at $GOGOGO_OUT"

GOGOGO_GIT_BACKUP=""
GOGOGO_CNAME_BACKUP=""
if [[ -d "$GOGOGO_OUT/.git" ]]; then
  GOGOGO_GIT_BACKUP="$(mktemp -d)"
  cp -a "$GOGOGO_OUT/.git" "$GOGOGO_GIT_BACKUP/"
fi
if [[ -f "$GOGOGO_OUT/CNAME" ]]; then
  GOGOGO_CNAME_BACKUP="$(cat "$GOGOGO_OUT/CNAME")"
fi

rm -rf "$GOGOGO_OUT"
mkdir -p "$GOGOGO_OUT/assets/gogogo" "$GOGOGO_OUT/assets/biigJ"

if [[ -n "$GOGOGO_GIT_BACKUP" ]]; then
  cp -a "$GOGOGO_GIT_BACKUP/.git" "$GOGOGO_OUT/"
  rm -rf "$GOGOGO_GIT_BACKUP"
fi
if [[ -n "$GOGOGO_CNAME_BACKUP" ]]; then
  printf '%s\n' "$GOGOGO_CNAME_BACKUP" > "$GOGOGO_OUT/CNAME"
else
  printf 'gogogo.social\n' > "$GOGOGO_OUT/CNAME"
fi

cp "$ROOT/gogogo-landing.html" "$GOGOGO_OUT/index.html"
cp "$ROOT/styles.css" "$GOGOGO_OUT/"
cp "$ROOT/fc-swipe-slider.js" "$GOGOGO_OUT/"
cp "$ROOT/fc-lang.js" "$GOGOGO_OUT/"
cp "$ROOT/fc-i18n.js" "$GOGOGO_OUT/"
cp "$ROOT/gogogo-joscha-grow.js" "$GOGOGO_OUT/"
cp "$ROOT/gogogo-program-slider.js" "$GOGOGO_OUT/"
cp "$ROOT/gogogo-i18n-entries.js" "$GOGOGO_OUT/"

rsync -a "$ROOT/assets/gogogo/" "$GOGOGO_OUT/assets/gogogo/"
cp "$ROOT/assets/biigJ/biigJ01.jpg" "$GOGOGO_OUT/assets/biigJ/"
cp "$ROOT/assets/biigJ/accountability.png" "$GOGOGO_OUT/assets/biigJ/"

sed_inplace \
  -e 's/gogogo-landing\.html#member-popup/#member-popup/g' \
  -e 's/gogogo-landing\.html/index.html/g' \
  "$GOGOGO_OUT/index.html"

cat > "$GOGOGO_OUT/README.md" <<'EOF'
# gogogo.social

Static export of gogogo from [friday-circle](https://github.com/biigJ/friday-circle).
Do not edit by hand — run `scripts/deploy-gogogo-social.sh` from friday-circle instead.
EOF

echo "==> gogogo.social export ready ($(find "$GOGOGO_OUT" -type f | wc -l | tr -d ' ') files)"

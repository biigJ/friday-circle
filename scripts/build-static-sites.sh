#!/usr/bin/env bash
# Build static exports for gogogo.social and biig.works.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/sed-inplace.sh
source "$ROOT/scripts/lib/sed-inplace.sh"

GOGOGO_OUT="${GOGOGO_OUT:-$HOME/gogogo-social}"

echo "==> Building gogogo-social at $GOGOGO_OUT"
rm -rf "$GOGOGO_OUT"
mkdir -p "$GOGOGO_OUT/assets/gogogo" "$GOGOGO_OUT/assets/biigJ"

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

Static export of the gogogo landing page from Friday Circle.
EOF

bash "$ROOT/scripts/build-biig-works.sh"

echo "==> Done"
echo "gogogo-social files: $(find "$GOGOGO_OUT" -type f | wc -l | tr -d ' ')"
echo "biig-works files: $(find "${BIIG_OUT:-$HOME/biig-works}" -type f | wc -l | tr -d ' ')"

#!/usr/bin/env bash
# Build static export for biig.works from friday-circle sources.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/sed-inplace.sh
source "$ROOT/scripts/lib/sed-inplace.sh"

BIIG_OUT="${BIIG_OUT:-$HOME/biig-works}"
BIIG_SHOP_URL="${BIIG_SHOP_URL:-https://www.fridaycircle.club/kaufen/kunst.html}"

echo "==> Building biig.works export at $BIIG_OUT"

BIIG_GIT_BACKUP=""
BIIG_CNAME_BACKUP=""
if [[ -d "$BIIG_OUT/.git" ]]; then
  BIIG_GIT_BACKUP="$(mktemp -d)"
  cp -a "$BIIG_OUT/.git" "$BIIG_GIT_BACKUP/"
fi
if [[ -f "$BIIG_OUT/CNAME" ]]; then
  BIIG_CNAME_BACKUP="$(cat "$BIIG_OUT/CNAME")"
fi

rm -rf "$BIIG_OUT"
mkdir -p "$BIIG_OUT/biig-interior" "$BIIG_OUT/assets/interior" "$BIIG_OUT/assets/hochbau" \
  "$BIIG_OUT/assets/audio" "$BIIG_OUT/assets/biigJ" "$BIIG_OUT/assets/wolfgang-grope" "$BIIG_OUT/data"
for BIIG_PAGE in joscha kunst impressum datenschutz kontakt; do
  mkdir -p "$BIIG_OUT/$BIIG_PAGE"
done

if [[ -n "$BIIG_GIT_BACKUP" ]]; then
  cp -a "$BIIG_GIT_BACKUP/.git" "$BIIG_OUT/"
  rm -rf "$BIIG_GIT_BACKUP"
fi
if [[ -n "$BIIG_CNAME_BACKUP" ]]; then
  printf '%s\n' "$BIIG_CNAME_BACKUP" > "$BIIG_OUT/CNAME"
else
  printf 'biig.works\n' > "$BIIG_OUT/CNAME"
fi

cp "$ROOT/biig-interior/index.html" "$BIIG_OUT/index.html"
cp "$ROOT/biig-interior/biig-konfigurator.css" "$BIIG_OUT/biig-interior/"
cp "$ROOT/biig-interior/biig-konfigurator.js" "$BIIG_OUT/biig-interior/"
cp "$ROOT/biig-interior/bk-i18n.js" "$BIIG_OUT/biig-interior/"
cp "$ROOT/biig-interior/biig-shared.css" "$BIIG_OUT/biig-interior/"
cp "$ROOT/styles.css" "$BIIG_OUT/"
cp "$ROOT/fc-swipe-slider.js" "$BIIG_OUT/"
cp "$ROOT/fc-lang.js" "$BIIG_OUT/"
cp "$ROOT/fc-image-url.js" "$BIIG_OUT/"
cp "$ROOT/wolfganggrope.css" "$BIIG_OUT/"
cp "$ROOT/wolfganggrope.js" "$BIIG_OUT/"
cp "$ROOT/data/wga-catalog.js" "$ROOT/data/wga-bio.js" "$ROOT/data/wga-catalog.json" "$BIIG_OUT/data/"

for BIIG_PAGE in joscha kunst impressum datenschutz kontakt; do
  cp "$ROOT/biig-interior/$BIIG_PAGE/index.html" "$BIIG_OUT/$BIIG_PAGE/index.html"
done

for BIIG_PAGE in joscha kunst impressum datenschutz kontakt; do
  sed_inplace \
    -e 's|href="/styles.css"|href="../styles.css"|g' \
    -e 's|href="/wolfganggrope.css"|href="../wolfganggrope.css"|g' \
    -e 's|href="/biig-interior/biig-shared.css"|href="../biig-interior/biig-shared.css"|g' \
    -e 's|src="/fc-image-url.js"|src="../fc-image-url.js"|g' \
    -e 's|src="/fc-lang.js"|src="../fc-lang.js"|g' \
    -e 's|src="/fc-swipe-slider.js"|src="../fc-swipe-slider.js"|g' \
    -e 's|src="/data/|src="../data/|g' \
    -e 's|src="/wolfganggrope.js"|src="../wolfganggrope.js"|g' \
    -e "s|href=\"/kaufen/kunst.html\"|href=\"$BIIG_SHOP_URL\"|g" \
    "$BIIG_OUT/$BIIG_PAGE/index.html"
done

rsync -a "$ROOT/assets/interior/" "$BIIG_OUT/assets/interior/"
rsync -a "$ROOT/assets/hochbau/" "$BIIG_OUT/assets/hochbau/"
rsync -a "$ROOT/assets/biigJ/" "$BIIG_OUT/assets/biigJ/"
rsync -a "$ROOT/assets/wolfgang-grope/" "$BIIG_OUT/assets/wolfgang-grope/"
cp "$ROOT/assets/audio/dramatic-motion-watermarked.mp3" "$BIIG_OUT/assets/audio/"

sed_inplace \
  -e 's|href="../styles.css"|href="styles.css"|g' \
  -e 's|src="../fc-swipe-slider.js"|src="fc-swipe-slider.js"|g' \
  -e 's|src="../fc-lang.js"|src="fc-lang.js"|g' \
  -e 's|href="biig-konfigurator.css"|href="biig-interior/biig-konfigurator.css"|g' \
  -e 's|src="bk-i18n.js"|src="biig-interior/bk-i18n.js"|g' \
  -e 's|src="biig-konfigurator.js"|src="biig-interior/biig-konfigurator.js"|g' \
  -e 's|\.\./assets/|assets/|g' \
  "$BIIG_OUT/index.html"

sed_inplace 's|\.\./assets/|assets/|g' "$BIIG_OUT/biig-interior/biig-konfigurator.js"

cat > "$BIIG_OUT/README.md" <<'EOF'
# biig.works

Static export of biig Interior from [friday-circle](https://github.com/biigJ/friday-circle).
Do not edit by hand — run `scripts/deploy-biig-works.sh` from friday-circle instead.

## Deploy

GitHub Pages serves this repository (`CNAME`: biig.works).
EOF

echo "==> biig.works export ready ($(find "$BIIG_OUT" -type f | wc -l | tr -d ' ') files)"

#!/usr/bin/env bash
# Build static export for biig.works from friday-circle sources.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/sed-inplace.sh
source "$ROOT/scripts/lib/sed-inplace.sh"

BIIG_OUT="${BIIG_OUT:-$HOME/biig-works}"
FC_SHOP_BASE="${FC_SHOP_BASE:-https://www.fridaycircle.club/kaufen}"
FC_SITE="${FC_SITE:-https://www.fridaycircle.club}"
BIIG_SHOP_URL="${BIIG_SHOP_URL:-${FC_SHOP_BASE}/kunst.html}"

# Vercel sets VERCEL=1 during builds. Slim export keeps deploy artifacts under platform limits.
BIIG_VERCEL_SLIM="${BIIG_VERCEL_SLIM:-${VERCEL:-}}"

has_webp_variant() {
  local base="$1"
  local w
  for w in 800 1000 1200 1400 1600; do
    if [[ -f "${base}-${w}.webp" ]]; then
      return 0
    fi
  done
  return 1
}

is_design_source() {
  local lower
  lower="$(printf '%s' "${1##*.}" | tr '[:upper:]' '[:lower:]')"
  case "$lower" in
    psd | tif | tiff | ai | pdf) return 0 ;;
    *) return 1 ;;
  esac
}

copy_biig_assets() {
  local src="$1"
  local dest="$2"
  find "$src" -type f ! -name '.DS_Store' -print0 | while IFS= read -r -d '' file; do
    if is_design_source "$file"; then
      continue
    fi
    local rel="${file#$src/}"
    local lower_ext
    lower_ext="$(printf '%s' "${file##*.}" | tr '[:upper:]' '[:lower:]')"
    if [[ -n "$BIIG_VERCEL_SLIM" ]]; then
      case "$lower_ext" in
        jpg | jpeg | png)
          if has_webp_variant "${file%.*}"; then
            continue
          fi
          ;;
      esac
    fi
    mkdir -p "$dest/$(dirname "$rel")"
    cp -a "$file" "$dest/$rel"
  done
}

echo "==> Building biig.works export at $BIIG_OUT"
if [[ -n "$BIIG_VERCEL_SLIM" ]]; then
  echo "==> Vercel slim asset export (WebP-first, no design sources)"
fi

BIIG_GIT_BACKUP=""
if [[ -d "$BIIG_OUT/.git" ]]; then
  BIIG_GIT_BACKUP="$(mktemp -d)"
  cp -a "$BIIG_OUT/.git" "$BIIG_GIT_BACKUP/"
fi

rm -rf "$BIIG_OUT"
mkdir -p "$BIIG_OUT/biig-interior" "$BIIG_OUT/assets/interior" "$BIIG_OUT/assets/hochbau" \
  "$BIIG_OUT/assets/interior-rocketscience" "$BIIG_OUT/assets/audio" "$BIIG_OUT/assets/biigJ" "$BIIG_OUT/assets/wolfgang-grope" "$BIIG_OUT/data" "$BIIG_OUT/kaufen"
for BIIG_PAGE in joscha kunst impressum datenschutz kontakt; do
  mkdir -p "$BIIG_OUT/$BIIG_PAGE"
done

if [[ -n "$BIIG_GIT_BACKUP" ]]; then
  cp -a "$BIIG_GIT_BACKUP/.git" "$BIIG_OUT/"
  rm -rf "$BIIG_GIT_BACKUP"
fi

cp "$ROOT/biig-interior/index.html" "$BIIG_OUT/index.html"
cp "$ROOT/biig-interior/biig-konfigurator.css" "$BIIG_OUT/biig-interior/"
cp "$ROOT/biig-interior/biig-konfigurator.js" "$BIIG_OUT/biig-interior/"
cp "$ROOT/biig-interior/bk-i18n.js" "$BIIG_OUT/biig-interior/"
cp "$ROOT/biig-interior/biig-shared.css" "$BIIG_OUT/biig-interior/"
cp "$ROOT/styles.css" "$BIIG_OUT/"
cp "$ROOT/fc-swipe-slider.js" "$BIIG_OUT/"
cp "$ROOT/fc-lang.js" "$BIIG_OUT/"
cp "$ROOT/fc-i18n.js" "$BIIG_OUT/"
cp "$ROOT/fc-image-url.js" "$BIIG_OUT/"
cp "$ROOT/wolfganggrope.css" "$BIIG_OUT/"
cp "$ROOT/wolfganggrope.js" "$BIIG_OUT/"
cp "$ROOT/data/wga-catalog.js" "$ROOT/data/wga-bio.js" "$ROOT/data/wga-catalog.json" "$BIIG_OUT/data/"
cp "$ROOT/biig-kunst-link-fix.js" "$BIIG_OUT/"
# Favicons (Doppel-I in Gold)
cp "$ROOT/favicon-biig.svg" "$BIIG_OUT/favicon.svg"
cp "$ROOT/favicon-biig.ico" "$BIIG_OUT/favicon.ico"
cp "$ROOT/apple-touch-icon-biig.png" "$BIIG_OUT/apple-touch-icon.png"
cp "$ROOT/favicon-biig-32.png" "$BIIG_OUT/favicon-32.png"
cp "$ROOT/favicon-biig-192.png" "$BIIG_OUT/icon-192.png"
cp "$ROOT/favicon-biig-512.png" "$BIIG_OUT/icon-512.png"
touch "$BIIG_OUT/.nojekyll"

BUILD_STAMP="$(date -u +"%Y-%m-%dT%H:%MZ")"

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
    -e 's|src="/fc-i18n.js"|src="../fc-i18n.js"|g' \
    -e 's|href="../index.html"|href="/"|g' \
    -e 's|href="../impressum/index.html"|href="/impressum/"|g' \
    -e 's|href="../datenschutz/index.html"|href="/datenschutz/"|g' \
    -e 's|href="../kontakt/index.html"|href="/kontakt/"|g' \
    -e 's|href="../joscha/index.html"|href="/joscha/"|g' \
    -e 's|src="/fc-swipe-slider.js"|src="../fc-swipe-slider.js"|g' \
    -e 's|src="/data/|src="../data/|g' \
    -e 's|src="/wolfganggrope.js"|src="../wolfganggrope.js"|g' \
    -e '/fc-canonical-redirect/d' \
    -e '/noindex, nofollow/d' \
    -e "s|href=\"/kaufen/kunst.html\"|href=\"$BIIG_SHOP_URL\"|g" \
    -e "s|href=\"../kunst/index.html\"|href=\"https://biig.works/kunst/\"|g" \
    -e "s|href=\"kunst/index.html\"|href=\"https://biig.works/kunst/\"|g" \
    -e "s|href=\"https://biig.works/kunst/index.html\"|href=\"https://biig.works/kunst/\"|g" \
    "$BIIG_OUT/$BIIG_PAGE/index.html"
done

copy_biig_assets "$ROOT/assets/interior" "$BIIG_OUT/assets/interior"
copy_biig_assets "$ROOT/assets/hochbau" "$BIIG_OUT/assets/hochbau"
copy_biig_assets "$ROOT/assets/interior-rocketscience" "$BIIG_OUT/assets/interior-rocketscience"
copy_biig_assets "$ROOT/assets/biigJ" "$BIIG_OUT/assets/biigJ"
copy_biig_assets "$ROOT/assets/wolfgang-grope" "$BIIG_OUT/assets/wolfgang-grope"
cp "$ROOT/assets/audio/dramatic-motion-watermarked.mp3" "$BIIG_OUT/assets/audio/"
cp "$ROOT/kaufen/tisch.html" "$ROOT/kaufen/kaufen.css" "$ROOT/kaufen/kaufen.js" "$BIIG_OUT/kaufen/"

sed_inplace \
  -e "s|href=\"../index.html\"|href=\"${FC_SITE}/\"|g" \
  -e 's|href="../berlinarchtour.html"|href="https://biig.works/"|g' \
  -e 's|href="index.html#moebel"|href="tisch.html"|g' \
  -e "s|href=\"index.html#textilien\"|href=\"${FC_SHOP_BASE}/index.html#textilien\"|g" \
  -e "s|href=\"index.html#kunst\"|href=\"${FC_SHOP_BASE}/index.html#kunst\"|g" \
  -e "s|href=\"index.html#buch\"|href=\"${FC_SHOP_BASE}/index.html#buch\"|g" \
  -e "s|href=\"index.html\"|href=\"${FC_SHOP_BASE}/index.html\"|g" \
  -e 's|src="../nav.js" defer></script>|src="../fc-image-url.js" defer></script><script src="../fc-lang.js" defer></script>|g' \
  "$BIIG_OUT/kaufen/tisch.html"

sed_inplace \
  -e 's|href="../styles.css"|href="styles.css"|g' \
  -e 's|src="../fc-swipe-slider.js"|src="fc-swipe-slider.js"|g' \
  -e 's|src="../fc-image-url.js"|src="fc-image-url.js"|g' \
  -e 's|src="../fc-lang.js"|src="fc-lang.js"|g' \
  -e 's|href="biig-konfigurator.css"|href="biig-interior/biig-konfigurator.css"|g' \
  -e 's|src="bk-i18n.js"|src="biig-interior/bk-i18n.js"|g' \
  -e 's|src="biig-konfigurator.js"|src="biig-interior/biig-konfigurator.js"|g' \
  -e 's|\.\./assets/|assets/|g' \
  -e 's|href="../kaufen/tisch.html"|href="kaufen/tisch.html"|g' \
  -e 's|href="../kunst/index.html"|href="https://biig.works/kunst/"|g' \
  -e 's|href="kunst/index.html"|href="https://biig.works/kunst/"|g' \
  -e 's|href="https://biig.works/kunst/index.html"|href="https://biig.works/kunst/"|g' \
  -e 's|href="/favicon-biig\.svg"|href="/favicon.svg"|g' \
  -e 's|href="/favicon-biig\.ico"|href="/favicon.ico"|g' \
  -e 's|href="/apple-touch-icon-biig\.png"|href="/apple-touch-icon.png"|g' \
  "$BIIG_OUT/index.html"

for BIIG_PAGE in joscha kunst impressum datenschutz kontakt; do
  sed_inplace \
    -e 's|href="/favicon-biig\.svg"|href="/favicon.svg"|g' \
    -e 's|href="/favicon-biig\.ico"|href="/favicon.ico"|g' \
    -e 's|href="/apple-touch-icon-biig\.png"|href="/apple-touch-icon.png"|g' \
    "$BIIG_OUT/$BIIG_PAGE/index.html"
done

sed_inplace 's|\.\./assets/|assets/|g' "$BIIG_OUT/biig-interior/biig-konfigurator.js"

for BIIG_HTML in "$BIIG_OUT/index.html" "$BIIG_OUT"/*/index.html; do
  [[ -f "$BIIG_HTML" ]] || continue
  if [[ "$BIIG_HTML" == "$BIIG_OUT/index.html" ]]; then
  FIX_SRC="biig-kunst-link-fix.js"
  else
  FIX_SRC="../biig-kunst-link-fix.js"
  fi
  sed_inplace \
    -e "s|</body>|<!-- biig-export ${BUILD_STAMP} --><script src=\"${FIX_SRC}\"></script></body>|" \
    "$BIIG_HTML"
done

cat > "$BIIG_OUT/README.md" <<'EOF'
# biig.works

Static export of biig Interior from [friday-circle](https://github.com/biigJ/friday-circle).
Do not edit by hand — Vercel builds from friday-circle (`scripts/vercel-build-biig.sh`).

WGA/Kunst: `/kunst/`

Deploy: Vercel project **biig-works** (domain biig.works). GitHub Pages is disabled.
EOF

echo "==> biig.works export ready ($(find "$BIIG_OUT" -type f | wc -l | tr -d ' ') files)"

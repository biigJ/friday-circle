#!/usr/bin/env bash
# Build static export for kunst.biig.works (Wolfgang Grope Kunstwerke) from friday-circle.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/sed-inplace.sh
source "$ROOT/scripts/lib/sed-inplace.sh"

KUNST_OUT="${KUNST_OUT:-$HOME/biig-kunst}"
BIIG_URL="${BIIG_URL:-https://biig.works}"
FC_SHOP_URL="${FC_SHOP_URL:-https://www.fridaycircle.club/kaufen/kunst.html}"

echo "==> Building kunst.biig.works export at $KUNST_OUT"

KUNST_GIT_BACKUP=""
KUNST_CNAME_BACKUP=""
if [[ -d "$KUNST_OUT/.git" ]]; then
  KUNST_GIT_BACKUP="$(mktemp -d)"
  cp -a "$KUNST_OUT/.git" "$KUNST_GIT_BACKUP/"
fi
if [[ -f "$KUNST_OUT/CNAME" ]]; then
  KUNST_CNAME_BACKUP="$(cat "$KUNST_OUT/CNAME")"
fi

rm -rf "$KUNST_OUT"
mkdir -p "$KUNST_OUT/biig-interior" "$KUNST_OUT/assets/wolfgang-grope" "$KUNST_OUT/data"

if [[ -n "$KUNST_GIT_BACKUP" ]]; then
  cp -a "$KUNST_GIT_BACKUP/.git" "$KUNST_OUT/"
  rm -rf "$KUNST_GIT_BACKUP"
fi
if [[ -n "$KUNST_CNAME_BACKUP" ]]; then
  printf '%s\n' "$KUNST_CNAME_BACKUP" > "$KUNST_OUT/CNAME"
else
  printf 'kunst.biig.works\n' > "$KUNST_OUT/CNAME"
fi

cp "$ROOT/biig-interior/kunst/index.html" "$KUNST_OUT/index.html"
cp "$ROOT/biig-interior/biig-shared.css" "$KUNST_OUT/biig-interior/"
cp "$ROOT/styles.css" "$KUNST_OUT/"
cp "$ROOT/wolfganggrope.css" "$KUNST_OUT/"
cp "$ROOT/wolfganggrope.js" "$KUNST_OUT/"
cp "$ROOT/fc-lang.js" "$KUNST_OUT/"
cp "$ROOT/data/wga-catalog.js" "$ROOT/data/wga-bio.js" "$ROOT/data/wga-catalog.json" "$KUNST_OUT/data/"

rsync -a "$ROOT/assets/wolfgang-grope/" "$KUNST_OUT/assets/wolfgang-grope/"

sed_inplace \
  -e '/fc-canonical-redirect/d' \
  -e '/noindex, nofollow/d' \
  -e 's|href="/styles.css"|href="styles.css"|g' \
  -e 's|href="/wolfganggrope.css"|href="wolfganggrope.css"|g' \
  -e 's|href="/biig-interior/biig-shared.css"|href="biig-interior/biig-shared.css"|g' \
  -e 's|src="/fc-lang.js"|src="fc-lang.js"|g' \
  -e 's|src="/wolfganggrope.js"|src="wolfganggrope.js"|g' \
  -e 's|src="/data/|src="data/|g' \
  -e "s|href=\"../index.html\"|href=\"${BIIG_URL}/\"|g" \
  -e "s|href=\"/kaufen/kunst.html\"|href=\"${FC_SHOP_URL}\"|g" \
  -e 's|href="../kunst/index.html"|href="index.html"|g' \
  "$KUNST_OUT/index.html"

cat > "$KUNST_OUT/README.md" <<'EOF'
# kunst.biig.works

Static export of Wolfgang Grope Kunstwerke from [friday-circle](https://github.com/biigJ/friday-circle).
Do not edit by hand — run `scripts/deploy-biig-kunst.sh` from friday-circle instead.
EOF

echo "==> kunst.biig.works export ready ($(find "$KUNST_OUT" -type f | wc -l | tr -d ' ') files)"

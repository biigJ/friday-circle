#!/usr/bin/env bash
# Build static export for gogogo.social from friday-circle sources.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/sed-inplace.sh
source "$ROOT/scripts/lib/sed-inplace.sh"

GOGOGO_OUT="${GOGOGO_OUT:-$HOME/gogogo-social}"
FC_URL="${FC_URL:-https://www.fridaycircle.club}"
KUNST_URL="${KUNST_URL:-https://biig.works/kunst/}"

gogogo_rewrite_fc_links() {
  local f="$1"
  sed_inplace \
    -e "s|href=\"../index.html\"|href=\"${FC_URL}/\"|g" \
    -e "s|href=\"index.html\" class=\"footer__logo\"|href=\"${FC_URL}/\" class=\"footer__logo\"|g" \
    -e "s|href=\"../impressum/index.html\"|href=\"${FC_URL}/impressum/\"|g" \
    -e "s|href=\"impressum/index.html\"|href=\"${FC_URL}/impressum/\"|g" \
    -e "s|href=\"../datenschutz/index.html\"|href=\"${FC_URL}/datenschutz/\"|g" \
    -e "s|href=\"datenschutz/index.html\"|href=\"${FC_URL}/datenschutz/\"|g" \
    -e "s|href=\"../kontakt/index.html\"|href=\"${FC_URL}/kontakt/\"|g" \
    -e "s|href=\"kontakt/index.html\"|href=\"${FC_URL}/kontakt/\"|g" \
    -e "s|href=\"../triff-joscha.html|href=\"${FC_URL}/triff-joscha.html|g" \
    -e "s|href=\"triff-joscha.html|href=\"${FC_URL}/triff-joscha.html|g" \
    -e "s|href=\"../kaufen/index.html\"|href=\"${FC_URL}/kaufen/\"|g" \
    -e "s|href=\"kaufen/index.html\"|href=\"${FC_URL}/kaufen/\"|g" \
    -e "s|href=\"kaufen/handtuch.html\"|href=\"${FC_URL}/kaufen/handtuch.html\"|g" \
    -e "s|href=\"kaufen/sportoberteil.html\"|href=\"${FC_URL}/kaufen/sportoberteil.html\"|g" \
    -e 's|gogogo-landing\.html#member-popup|#member-popup|g' \
    -e 's|gogogo-landing\.html|index.html|g' \
    -e 's|https://www\.bjgrope\.de/register-accountability/index\.html|register-accountability/|g' \
    "$f"
}

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
mkdir -p "$GOGOGO_OUT/assets/gogogo" "$GOGOGO_OUT/assets/biigJ" \
  "$GOGOGO_OUT/register-accountability" "$GOGOGO_OUT/register-training" "$GOGOGO_OUT/start"

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
cp "$ROOT/register-accountability/index.html" "$GOGOGO_OUT/register-accountability/index.html"
cp "$ROOT/register-training/index.html" "$GOGOGO_OUT/register-training/index.html"
cp "$ROOT/start/index.html" "$GOGOGO_OUT/start/index.html"
cp "$ROOT/cycle-training.html" "$GOGOGO_OUT/"
cp "$ROOT/cycle-table.html" "$GOGOGO_OUT/"
cp "$ROOT/cycle-table-mobile.html" "$GOGOGO_OUT/"
cp "$ROOT/gogogo-quiz.html" "$GOGOGO_OUT/"
cp "$ROOT/joschaalstrainer.html" "$GOGOGO_OUT/"
cp "$ROOT/joschaalscoach.html" "$GOGOGO_OUT/"
cp "$ROOT/register.html" "$GOGOGO_OUT/"
cp "$ROOT/gogogo.html" "$GOGOGO_OUT/"

cp "$ROOT/styles.css" "$GOGOGO_OUT/"
cp "$ROOT/program-landing.css" "$GOGOGO_OUT/"
cp "$ROOT/cycle-table-mobile.css" "$GOGOGO_OUT/"
cp "$ROOT/fc-swipe-slider.js" "$GOGOGO_OUT/"
cp "$ROOT/fc-lang.js" "$GOGOGO_OUT/"
cp "$ROOT/fc-i18n.js" "$GOGOGO_OUT/"
cp "$ROOT/fc-image-url.js" "$GOGOGO_OUT/"
cp "$ROOT/gogogo-joscha-grow.js" "$GOGOGO_OUT/"
cp "$ROOT/gogogo-program-slider.js" "$GOGOGO_OUT/"
cp "$ROOT/gogogo-i18n-entries.js" "$GOGOGO_OUT/"
cp "$ROOT/register-i18n-entries.js" "$GOGOGO_OUT/"
cp "$ROOT/cycle-cards.js" "$GOGOGO_OUT/"
cp "$ROOT/cycle-table.js" "$GOGOGO_OUT/"
cp "$ROOT/cycle-table-mobile.js" "$GOGOGO_OUT/"
cp "$ROOT/fc-cycle-supabase.js" "$GOGOGO_OUT/"
cp "$ROOT/fc-cycle-supabase-config.js" "$GOGOGO_OUT/"

rsync -a "$ROOT/assets/gogogo/" "$GOGOGO_OUT/assets/gogogo/"
rsync -a "$ROOT/assets/biigJ/" "$GOGOGO_OUT/assets/biigJ/"

for html in \
  "$GOGOGO_OUT/index.html" \
  "$GOGOGO_OUT/register-accountability/index.html" \
  "$GOGOGO_OUT/register-training/index.html" \
  "$GOGOGO_OUT/start/index.html" \
  "$GOGOGO_OUT/cycle-training.html" \
  "$GOGOGO_OUT/cycle-table.html" \
  "$GOGOGO_OUT/cycle-table-mobile.html" \
  "$GOGOGO_OUT/gogogo-quiz.html" \
  "$GOGOGO_OUT/joschaalstrainer.html"; do
  gogogo_rewrite_fc_links "$html"
done

sed_inplace \
  -e 's|href="../register-accountability/index.html"|href="../register-accountability/"|g' \
  -e 's|href="../register-training/index.html"|href="../register-training/"|g' \
  "$GOGOGO_OUT/start/index.html"

sed_inplace \
  -e 's|url=joschaalstrainer\.html|url=joschaalstrainer.html|g' \
  -e 's|href="joschaalstrainer\.html"|href="joschaalstrainer.html"|g' \
  "$GOGOGO_OUT/joschaalscoach.html"

cat > "$GOGOGO_OUT/README.md" <<'EOF'
# gogogo.social

Static export of gogogo from [friday-circle](https://github.com/biigJ/friday-circle).
Do not edit by hand — run `scripts/deploy-gogogo-social.sh` from friday-circle instead.
EOF

echo "==> gogogo.social export ready ($(find "$GOGOGO_OUT" -type f | wc -l | tr -d ' ') files)"

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GOGOGO_OUT="$HOME/gogogo-social"
BIIG_OUT="$HOME/biig-works"

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

sed -i '' \
  -e 's/gogogo-landing\.html#member-popup/#member-popup/g' \
  -e 's/gogogo-landing\.html/index.html/g' \
  "$GOGOGO_OUT/index.html"

cat > "$GOGOGO_OUT/README.md" <<'EOF'
# gogogo.social

Static export of the gogogo landing page from Friday Circle.

## Deploy

Serve the repository root as static files (`index.html` at `/`).

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080
EOF

echo "==> Building biig-works at $BIIG_OUT"
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
mkdir -p "$BIIG_OUT/biig-interior" "$BIIG_OUT/assets/interior" "$BIIG_OUT/assets/hochbau" "$BIIG_OUT/assets/audio"
if [[ -n "$BIIG_GIT_BACKUP" ]]; then
  cp -a "$BIIG_GIT_BACKUP/.git" "$BIIG_OUT/"
  rm -rf "$BIIG_GIT_BACKUP"
fi
if [[ -n "$BIIG_CNAME_BACKUP" ]]; then
  printf '%s\n' "$BIIG_CNAME_BACKUP" > "$BIIG_OUT/CNAME"
fi

cp "$ROOT/biig-interior/index.html" "$BIIG_OUT/index.html"
cp "$ROOT/biig-interior/biig-konfigurator.css" "$BIIG_OUT/biig-interior/"
cp "$ROOT/biig-interior/biig-konfigurator.js" "$BIIG_OUT/biig-interior/"
cp "$ROOT/biig-interior/bk-i18n.js" "$BIIG_OUT/biig-interior/"
cp "$ROOT/styles.css" "$BIIG_OUT/"
cp "$ROOT/fc-swipe-slider.js" "$BIIG_OUT/"
cp "$ROOT/fc-lang.js" "$BIIG_OUT/"

rsync -a "$ROOT/assets/interior/" "$BIIG_OUT/assets/interior/"
rsync -a "$ROOT/assets/hochbau/" "$BIIG_OUT/assets/hochbau/"
cp "$ROOT/assets/audio/dramatic-motion-watermarked.mp3" "$BIIG_OUT/assets/audio/"

sed -i '' \
  -e 's|href="../styles.css"|href="styles.css"|g' \
  -e 's|src="../fc-swipe-slider.js"|src="fc-swipe-slider.js"|g' \
  -e 's|src="../fc-lang.js"|src="fc-lang.js"|g' \
  -e 's|href="biig-konfigurator.css"|href="biig-interior/biig-konfigurator.css"|g' \
  -e 's|src="bk-i18n.js"|src="biig-interior/bk-i18n.js"|g' \
  -e 's|src="biig-konfigurator.js"|src="biig-interior/biig-konfigurator.js"|g' \
  -e 's|\.\./assets/|assets/|g' \
  -e 's|href="../kontakt/index.html"|href="#"|g' \
  "$BIIG_OUT/index.html"

sed -i '' 's|\.\./assets/|assets/|g' "$BIIG_OUT/biig-interior/biig-konfigurator.js"

cat > "$BIIG_OUT/README.md" <<'EOF'
# biig.works

Static export of the biig Interior page from Friday Circle.

## Deploy

Serve the repository root as static files (`index.html` at `/`).

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080
EOF

echo "==> Done"
echo "gogogo-social files: $(find "$GOGOGO_OUT" -type f | wc -l | tr -d ' ')"
echo "biig-works files: $(find "$BIIG_OUT" -type f | wc -l | tr -d ' ')"

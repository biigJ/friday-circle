# Friday Circle

Statische Website für **FRIDAY CIRCLE**. Das Repo ist auf die aktiven Programme reduziert:

- `gogogo`
- `cycle training`
- `gogogo App`
- `biig Interior`
- `Geschichte` (`programmierung.html`, Programmierung unter `programmierung/geschichte.html`)
- `Berlin Architecture Tour` (`berlinarchtour.html`, Spec in `docs/berlin-arch-tour-spec.md`)

Ausgelagerte Projekte wie Balko, Holyprop und Fitness First Social Club liegen nicht mehr in diesem Repo.

## Lokal öffnen

Kein Build (außer Berlin Architecture Tour). `index.html` im Browser öffnen oder:

```bash
cd friday-circle
python3 -m http.server 5173
# → http://localhost:5173
# → http://localhost:5173/berlinarchtour.html
```

Berlin Architecture Tour neu generieren (nach Änderungen an `scripts/build-berlin-arch-tour.mjs`):

```bash
node scripts/build-berlin-arch-tour.mjs
node scripts/build-partial-js.mjs   # wenn site-header.html geändert wurde
```

## Vercel Deployment

Friday Circle ist ein statisches Vercel-Projekt.

- Framework Preset: `Other`
- Root Directory: `.`
- Build Command: leer lassen
- Output Directory: leer lassen
- Install Command: leer lassen

Vercel serviert die HTML-Dateien direkt aus dem Repository-Root.

## Domains & Deployments

| Domain | Quelle | Deploy |
|--------|--------|--------|
| [fridaycircle.club](https://www.fridaycircle.club) | dieses Repo (`main`) | automatisch via Vercel bei `git push` |
| [fridaycircle.club/biig-interior/…](https://www.fridaycircle.club/biig-interior/index.html) | dieselbe Deployment | automatisch |
| [biig.works](https://biig.works) | Repo [`biigJ/biig-works`](https://github.com/biigJ/biig-works) | Export aus diesem Repo |

**biig Interior + Kunst (WGA)** müssen auf beiden Domains gleich sein. Dafür:

1. Hier ändern und `git push` → fridaycircle.club ist aktuell.
2. **biig.works** wird bei Push auf `main` per GitHub Action synchronisiert (sobald Secret gesetzt, siehe unten).
3. Lokal sofort deployen: `bash scripts/deploy-biig-works.sh`

### GitHub Secret für Auto-Sync (einmalig)

In **friday-circle** → Settings → Secrets → Actions → `BIIG_WORKS_DEPLOY_TOKEN`:

- Personal Access Token (classic) mit Scope `repo` für Zugriff auf `biigJ/biig-works`
- Danach pusht jede relevante Änderung an `main` automatisch den Export nach biig.works

Ohne Secret: nach biig-Änderungen manuell `bash scripts/deploy-biig-works.sh` ausführen.

## Medien

- **Hero-Video:** `assets/hero.mp4` — empfohlen H.264, stumm, Loop, z. B. 1920×1080.
- **Poster:** `assets/hero-poster.png` (oder `.jpg`) im `<video poster="…">`.
- **gogogo auf Ziele:** `assets/gogogo.mp4`.
- **Lösungen:** `assets/loesungen.MOV`.
- **biig Interior:** `assets/biigJ-33-kitchen.jpeg`.
- **Triff Joscha:** `assets/triff-joscha-hero.mp4` und `assets/triff-joscha-hero-poster.png`, falls vorhanden.

## Schriften

- **Inter** (Google Fonts) — Logo, Navigation, Überschriften, UI.
- **Georgia** (System) — Fließtext in Hero, Landing-Bridge, Lösungen-Fortsetzung.

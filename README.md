# Friday Circle

Statische Website für **FRIDAY CIRCLE**. Das Repo ist auf die aktiven Programme reduziert:

- `gogogo`
- `cycle training`
- `gogogo App`
- `biig Interior`
- `intellektuell`

Ausgelagerte Projekte wie Balko, Holyprop und Fitness First Social Club liegen nicht mehr in diesem Repo.

## Lokal öffnen

Kein Build. `index.html` im Browser öffnen oder:

```bash
cd friday-circle
python3 -m http.server 5173
# → http://localhost:5173
```

## Vercel Deployment

Friday Circle ist ein statisches Vercel-Projekt.

- Framework Preset: `Other`
- Root Directory: `.`
- Build Command: leer lassen
- Output Directory: leer lassen
- Install Command: leer lassen

Vercel serviert die HTML-Dateien direkt aus dem Repository-Root.

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

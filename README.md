# Friday Circle – Website

Statische Seiten für **FRIDAY CIRCLE** (Hintergrund `#EDECE4`, Text `#000000`,
Akzent Mint `#99F0DD`, Fläche `#18594E`).

```
friday-circle/
├─ index.html
├─ ziele.html
├─ loesungen.html
├─ projekte.html
├─ community.html
├─ gogogo.html
├─ styles.css
├─ assets/
│  ├─ hero.mp4
│  ├─ hero-poster.png        ← optional, vor dem Abspielen
│  ├─ gogogo.mp4             ← z.B. Ziele-Seite
│  ├─ loesungen.MOV          ← Hauptquelle Lösungen (optional: loesungen.mp4)
│  ├─ steps.jpg              ← 3-Schritte-Bereich auf der Startseite
│  ├─ haimo.mp4 + haimo-poster.jpg   ← Projekte
│  └─ werkhaim.mp4 + werkhaim-poster.jpg
└─ README.md
```

## Lokal öffnen

Kein Build. `index.html` im Browser öffnen oder:

```bash
cd friday-circle
python3 -m http.server 5173
# → http://localhost:5173
```

## Medien

- **Hero-Video:** `assets/hero.mp4` — empfohlen H.264, stumm, Loop, z. B. 1920×1080.
- **Poster:** `assets/hero-poster.png` (oder `.jpg`) im `<video poster="…">`.
- **gogogo auf Ziele:** `assets/gogogo.mp4`.
- **Lösungen:** `assets/loesungen.MOV`; optional `assets/loesungen.mp4` als zweite `<source>` für Browser ohne QuickTime.
- **Schritte-Bild:** `assets/steps.jpg` — fehlt es, zeigt der Bereich einen leeren Platzhalter.
- **Projekte:** Videos/Poster für haimo und werkhaim wie oben; fehlende Dateien führen zu leerem Video — bitte nachlegen.

## Schriften

- **Inter** (Google Fonts) — Logo, Navigation, Überschriften, UI.
- **Georgia** (System) — Fließtext in Hero, Landing-Bridge, Lösungen-Fortsetzung.

## Backup

Der Ordner war zuvor nicht in Git versioniert. Empfehlung: eigenes Repo nur für
`friday-circle/`, regelmäßig committen und Remote nutzen, damit nichts erneut
verloren geht.

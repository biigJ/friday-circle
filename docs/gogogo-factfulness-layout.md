# Factfulness-Slide — Layout-Freeze

**Freigegebener Stand (nicht ändern ohne visuellen Test):** Git-Tag `gogogo-factfulness-v1`, Commit `6a95d1d` (2026-05-22).

## Dateien

| Datei | Rolle |
|-------|--------|
| `gogogo-landing.html` | CSS: `.gogl-tile-grid` (Kommentar `LAYOUT FREEZE`) |
| `gogogo-joscha-grow.js` | Grow-Breite, Kachel-Klicks, Hintergrund-Popup-Höhe |

## Zielbild

| Element | Verhalten |
|--------|-----------|
| Kleine Kacheln | **5:3** (`aspect-ratio`), visuell **0,7×** (`scale` am Grid), Text mit Kachel-Padding |
| Raster | horizontal + vertikal mittig (`.gogl-tile-grid-stage`) |
| Läufer | Zeilen 2 + 4: `translateX(--gogl-tile-shift)` |
| Kleines Popup (`open`) | **5:3**, mittig über Kachel; Titel, Fließtext und **„Hintergrund →“** gleiche Schriftgröße (`--gogl-popup-type-size`) |
| Hintergrund-Popup (`background`) | horizontal über Kachel, Oberkante unter Slider-Dots, Höhe bis kurz vor Container-Unterrand; **nur** `.gogl-tile__bg` (kein Intro, kein Button) |
| Kein Sprung | Scaler **immer** absolut (auch geschlossen); Zeilen `auto` + `aspect-ratio` |

## Technik (kurz)

1. Grid: `scale(0.7)`, `translateX(-0.5 × Läufer-shift)`, `transform-origin: 50% 50%`.
2. Geschlossen: Scaler mit Tile-Padding-Inset, `justify-content: flex-end`.
3. Open: Scaler `aspect-ratio 5/3`, `scale(2)` via `--gogl-popup-scale`.
4. Background: `--gogl-bg-scaler-h` = (Container unten − Dots) ÷ 2; nur Wissenschaftsblock sichtbar.
5. Klick: `open` → Overlay-Klasse → andere Kacheln schließen (kein Layout-Flash).

## Commit-Historie (Factfulness-Layout)

- `6a95d1d` — Popup: Body + Hintergrund-Button = Titelgröße
- `66c72c4` — Kacheln 5:3 + Padding
- `1e10596` — Hintergrund-Popup volle Höhe, nur `.gogl-tile__bg`
- `a4f2c0f` — 5:3 Open-Popup, Hintergrund-Button sichtbar
- `366f6eb` — Layout-Freeze, kein Raster-Sprung
- `959ffd6` — Popup-Schrift, Zentrierung 0,7×

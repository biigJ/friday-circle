# Factfulness-Slide — Layout-Freeze (2026-05-22)

Dieser Stand ist bewusst festgehalten. **Nicht ohne visuellen Test ändern:**

- `gogogo-landing.html` — CSS-Block `.gogl-tile-grid` (Kommentar `LAYOUT FREEZE`)
- `gogogo-joscha-grow.js` — `syncTileRowHeights()`, Popup-Klicks

## Zielbild

| Element | Verhalten |
|--------|-----------|
| Kleine Kacheln | 5:3, visuell **0,7×** (`scale` am ganzen Grid) |
| Raster | horizontal + vertikal mittig in der rechten Spalte (`.gogl-tile-grid-stage`) |
| Läufer | Zeilen 2 + 4 mit `translateX(--gogl-tile-shift)` |
| Kleines Popup | mittig über angeklickter Kachel, **5:3** (`aspect-ratio` am Scaler) |
| Hintergrund-Button | sichtbar in `.gogl-tile__actions` (Popup-Scaler: `flex-start`, kein `overflow:hidden`) |
| Hintergrund-Popup | horizontal über Kachel, Oberkante unter Slider-Dots, Höhe bis kurz vor Container-Unterkante; nur `.gogl-tile__bg` (kein Intro-Text, kein Hintergrund-Button) |
| Popup-Text | gleiche Lesegröße wie Kachel-Labels (÷ `--gogl-popup-scale` nur im offenen Scaler) |
| Kein Sprung | feste `--gogl-row-h`, Scaler **immer** `position: absolute` |

## Technische Stützen gegen „Springen“

1. **`--gogl-row-h`** — aus Kachelbreite × 3/5, alle 12 Zellen gleich hoch.
2. **Scaler aus dem Fluss** — `.gogl-tile > .gogl-tile__scaler { position: absolute; inset: 0 }` auch bei geschlossenen Kacheln.
3. **Body/Bg nur mit Overlay** — `max-height`-Expansion nur bei `.is-tile-overlay-active`.
4. **Klick-Reihenfolge** — zuerst `open` + Overlay-Klasse, dann andere Kacheln schließen.
5. **Läufer-Platzhalter** — geöffnete Kacheln in Zeile 2/4 behalten `translateX(shift)` am Zell-Element.

## Bekannte Commits

- `959ffd6` — Popup-Schrift + erster Sprung-Fix
- *(folgender Commit)* — Layout-Freeze + Scaler/Row-Höhe

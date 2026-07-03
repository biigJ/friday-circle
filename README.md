# Friday Circle

Statische Website für **FRIDAY CIRCLE**. Das Repo ist auf die aktiven Programme reduziert:

- `gogogo` → öffentlich auf [gogogo.social](https://gogogo.social) (Landing, Anmeldung, Cycle, Quiz, Joscha als Trainer)
- `biig Interior` + WGA/Kunst → öffentlich auf [biig.works](https://biig.works) (`/kunst/index.html`)
- `Berlin Architecture Tour`, Kaufen, Kontakt, … → auf [fridaycircle.club](https://www.fridaycircle.club)

Ausgelagerte Projekte wie Balko, Holyprop und Fitness First Social Club liegen nicht mehr in diesem Repo.

## Domains & Inhalts-Architektur

| Domain | Rolle | Deploy |
|--------|--------|--------|
| [fridaycircle.club](https://www.fridaycircle.club) | **Friday Circle Hub** — Ziele, Lösungen, Service, Kaufen, Kontakt, Tour, … | Vercel bei `git push` |
| [biig.works](https://biig.works) | **biig Interior** + **Kunst/WGA** unter `/kunst/` | Export → [`biigJ/biig-works`](https://github.com/biigJ/biig-works) |
| [gogogo.social](https://gogogo.social) | **gogogo** (Landing + Flows) | Export → [`biigJ/gogogo-social`](https://github.com/biigJ/gogogo-social) |

**Prinzip:** Alles wird hier entwickelt. fridaycircle.club **verlinkt** zu den Marken-Domains; alte FC-URLs **leiten um** (`fc-canonical-redirect.js`).

```bash
git push                              # → fridaycircle.club
bash scripts/deploy-biig-works.sh     # → biig.works (inkl. /kunst/)
bash scripts/deploy-gogogo-social.sh  # → gogogo.social
```

GitHub Actions syncen die Marken-Sites bei Push auf `main`, wenn Secrets gesetzt sind:

| Secret | Ziel-Repo |
|--------|-----------|
| `BIIG_WORKS_DEPLOY_TOKEN` | `biigJ/biig-works` |
| `GOGOGO_SOCIAL_DEPLOY_TOKEN` | `biigJ/gogogo-social` |

## Lokal öffnen

```bash
cd friday-circle
python3 -m http.server 5173
```

Berlin Architecture Tour neu generieren:

```bash
node scripts/build-berlin-arch-tour.mjs
node scripts/build-partial-js.mjs   # wenn site-header.html geändert wurde
```

## Vercel Deployment

Friday Circle ist ein statisches Vercel-Projekt (Framework: Other, kein Build).

**biig.works auf Vercel (geplant):** Build-Skript und Checkliste liegen bereit — [`docs/biig-works-vercel-migration.md`](docs/biig-works-vercel-migration.md), `scripts/vercel-build-biig.sh`, `vercel.biig.json`.

## Medien

- **Hero-Video:** `assets/hero.mp4`
- **gogogo auf Ziele:** `assets/gogogo.mp4`
- **Lösungen:** `assets/loesungen.MOV`
- **biig Interior:** `assets/biigJ-33-kitchen.jpeg`

## Schriften

- **Inter** (Google Fonts) — Logo, Navigation, Überschriften, UI.
- **Georgia** (System) — Fließtext in Hero, Landing-Bridge, Lösungen-Fortsetzung.

# biig.works → Vercel (später)

Aktuell: Export nach [`biigJ/biig-works`](https://github.com/biigJ/biig-works) → GitHub Pages (`CNAME: biig.works`).

Ziel: Wie **fridaycircle.club** — zweites Vercel-Projekt am gleichen Repo `biigJ/friday-circle`, Deploy bei `git push` ohne PAT/Actions.

## Im Repo bereits vorbereitet

| Datei | Zweck |
|-------|--------|
| `scripts/vercel-build-biig.sh` | Vercel Build-Einstieg → ruft `build-biig-works.sh` auf, Output nach `biig-export/` |
| `vercel.biig.json` | Vorlage für Projekteinstellungen (nicht automatisch aktiv — siehe unten) |
| `.gitignore` | `biig-export/` (lokaler Build-Ordner) |

Lokal testen:

```bash
bash scripts/vercel-build-biig.sh
python3 -m http.server 5180 --directory biig-export
# → http://localhost:5180
```

## Checkliste Vercel Dashboard (einmalig)

### 1. Neues Projekt anlegen

- [Vercel](https://vercel.com) → **Add New…** → **Project**
- GitHub-Repo **`biigJ/friday-circle`** importieren (gleiches Repo wie Friday Circle)
- Projektname z. B. `biig-works`

### 2. Build-Einstellungen

| Feld | Wert |
|------|------|
| Framework Preset | **Other** |
| Root Directory | `.` (Repo-Root) |
| Build Command | `bash scripts/vercel-build-biig.sh` |
| Output Directory | `biig-export` |
| Install Command | leer lassen |

Alternativ beim ersten `vercel link` die Datei `vercel.biig.json` als Referenz nutzen (Einstellungen manuell übernehmen oder per CLI mit eigenem Config-Pfad verknüpfen).

**Wichtig:** Das bestehende Vercel-Projekt für **fridaycircle.club** unverändert lassen (kein Build, Output = Repo-Root). Nur das **neue** Projekt bekommt den Build oben.

### 3. Domain `biig.works`

- Im neuen Projekt → **Settings** → **Domains** → `biig.works` und optional `www.biig.works` hinzufügen
- DNS beim Domain-Provider auf Vercel umstellen (Vercel zeigt die nötigen Records)
- Bis die DNS-Propagation durch ist, kann GitHub Pages noch antworten — das ist normal

### 4. GitHub Pages abschalten (nach erfolgreichem Vercel-Deploy)

- Repo `biigJ/biig-works` → **Settings** → **Pages** → Source deaktivieren  
  oder `CNAME`-Datei entfernen / Repo nur als Archiv behalten
- Prüfen: `curl -I https://biig.works` → Header `server: Vercel` (statt `GitHub.com`)

### 5. GitHub Action entfernen (optional, wenn Vercel läuft)

- In `friday-circle`: `.github/workflows/sync-biig-works.yml` löschen
- Secret `BIIG_WORKS_DEPLOY_TOKEN` in Repo-Settings kann entfernt werden
- `scripts/deploy-biig-works.sh` bleibt als manuelles Fallback für GitHub Pages, falls noch gebraucht

### 6. Smoke-Test nach Umstellung

- [ ] https://biig.works/ — Interior-Startseite, Slider, KI-Skala
- [ ] https://biig.works/kunst/ — WGA-Katalog, Deep-Links
- [ ] Shop-Link → https://www.fridaycircle.club/kaufen/kunst.html
- [ ] Konfigurator / Unterseiten (joscha, impressum, kontakt, datenschutz)

## Friday Circle vs. biig.works (zum Vergleich)

| | fridaycircle.club | biig.works (Ziel) |
|--|-------------------|-------------------|
| Vercel-Projekt | 1 (bestehend) | 2 (neu) |
| Build | keiner | `vercel-build-biig.sh` |
| Output | Repo-Root | `biig-export/` |
| Quellcode | `friday-circle` | gleiches Repo |

## gogogo.social

Gleiches Muster möglich (`scripts/build-gogogo-social.sh` → eigenes Vercel-Projekt). Separates Dokument bei Bedarf.

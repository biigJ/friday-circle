# Cycle Table · Supabase

Die Zirkeltabelle (`cycle-table.html`) und der mobile HYROX-Builder (`cycle-table-mobile.html`) speichern Sessions und Nutzer:innen in Supabase — mit localStorage-Fallback, solange noch keine Keys gesetzt sind.

## 1. Projekt anlegen

1. [supabase.com](https://supabase.com) → neues Projekt
2. **Settings → API** → `Project URL` und `anon public` key kopieren
3. Im Repo: `fc-cycle-supabase-config.example.js` nach `fc-cycle-supabase-config.js` kopieren und Werte eintragen (Datei ist in `.gitignore`)

## 2. Schema (SQL Editor)

```sql
create table if not exists cycle_sessions (
  id text primary key,
  date date not null unique,
  workout_name text not null,
  round_count int,
  exercises jsonb not null default '[]'::jsonb,
  participants jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cycle_users (
  slug text primary key,
  name text not null,
  pin text not null,
  created_at timestamptz not null default now()
);

create index if not exists cycle_sessions_date_idx on cycle_sessions (date desc);

alter table cycle_sessions enable row level security;
alter table cycle_users enable row level security;

-- MVP: anon read/write (PIN liegt clientseitig wie bisher in localStorage)
create policy "cycle_sessions_anon_all"
  on cycle_sessions for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "cycle_users_anon_all"
  on cycle_users for all
  to anon, authenticated
  using (true)
  with check (true);
```

> Für Produktion: RLS verschärfen (z. B. Admin-Service-Role für Session-Anlage, Auth für Nutzer:innen).

## 3. `exercises` JSON-Struktur

Pro Session, Array von Stationen:

```json
{
  "id": "id-abc123",
  "name": "SkiErg",
  "stationKey": "ski-erg",
  "positionPreset": "1",
  "positionFactor": "1.0",
  "valuePreset": "500",
  "unitPreset": "m",
  "userData": {
    "ben": {
      "positionIndividual": "",
      "handicapIndividual": "",
      "result": "4:32",
      "points": "12"
    }
  }
}
```

## 4. Seiten

| Datei | Zweck |
|-------|--------|
| `cycle-table.html` | Desktop-Tabelle, Ergebnisse eintragen |
| `cycle-table-mobile.html` | Mobile HYROX-Builder: Stationen sortieren, Werte setzen, speichern |

Admin-PIN wie bisher: **`friday`**

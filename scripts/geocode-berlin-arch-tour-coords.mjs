#!/usr/bin/env node
/** Refresh COORDS_BY_STOP via Nominatim. Run: node scripts/geocode-berlin-arch-tour-coords.mjs */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const coordsPath = join(rootDir, "scripts", "berlin-arch-tour-coords.mjs");
const buildPath = join(rootDir, "scripts", "build-berlin-arch-tour.mjs");

const src = readFileSync(buildPath, "utf8");
import { NEW_STOPS_META } from "./berlin-arch-tour-photos.mjs";
import { EXTRA_STOPS, STOP_OVERRIDES, DAY_LAYOUT } from "./berlin-arch-tour-layout.mjs";

const names = new Map();
for (const m of NEW_STOPS_META) names.set(m.id, m.nameDe);
for (const [id, s] of Object.entries(EXTRA_STOPS)) names.set(id, s.nameDe);
for (const [id, s] of Object.entries(STOP_OVERRIDES)) if (s.nameDe) names.set(id, s.nameDe);
const re = /id:\s*"([^"]+)"[\s\S]*?nameDe:\s*"([^"]+)"/g;
let match;
while ((match = re.exec(src))) names.set(match[1], match[2]);

/** Verified WGS84 — always applied after geocoding (Nominatim often returns wrong matches). */
const MANUAL_COORDS = {
  "d1-chipperfield-villa": { lat: 52.437383, lng: 13.2520761 },
  "d1-gropius": { lat: 52.4445455, lng: 13.2357765 },
  "d2-gedaechtniskirche": { lat: 52.5047055, lng: 13.3350322 },
  "d3-hejduk": { lat: 52.5049275, lng: 13.3921753 },
  "d4-quartier-schuetzen": { lat: 52.5089405, lng: 13.3962523 },
  "d5-tacheles": { lat: 52.5256724, lng: 13.3891203 },
  "d6-bastian": { lat: 52.5192812, lng: 13.3967674 },
  "d6-so36": { lat: 52.5003909, lng: 13.4221612 },
  "d6-taut-neukoelln": { lat: 52.4865007, lng: 13.4378528 },
};

/** Curated Nominatim queries — overrides generic "name + Berlin". */
const QUERY_OVERRIDES = {
  "d2-shellhaus": "Shell-Haus Berlin Reichpietschufer 32",
  "d4-nl": "Neue Nationalgalerie Berlin",
  "d1-boros": "Boros Collection Bunker Berlin Reinhardtstraße",
  "d5-times-art": "Times Art Center Berlin Brunnenstraße 116",
  "d6-altes-museum": "Altes Museum Berlin Museumsinsel",
  "d6-neues": "Neues Museum Berlin Museumsinsel",
  "d6-james": "James-Simon-Galerie Berlin",
  "d6-bastian": "Haus Bastian Berlin Kupfergraben",
  "d6-chip-campus": "Joachimstraße 15 Berlin Chipperfield",
  "d4-dhm": "Deutsches Historisches Museum Berlin",
  "d2-nng": "Neue Nationalgalerie Berlin",
  "d2-philharmonie": "Berliner Philharmonie Berlin",
  "d4-sony": "Sony Center Potsdamer Platz Berlin",
  "d4-dz": "DZ Bank Pariser Platz Berlin",
  "d2-babylon": "Babylon Kino Berlin Rosa-Luxemburg-Straße",
  "d1-onkel": "Onkel Toms Hütte Berlin Siedlung",
  "d1-schorlemer": "Schorlemerallee Berlin Zehlendorf",
  "d1-u3-krumme": "U-Bahnhof Krumme Lanke Berlin",
  "d1-fischerhuette-106": "Fischerhüttenstraße 106 Berlin",
  "d1-gropius": "Fischerhüttenstraße 90 Berlin Gropius",
  "d1-chipperfield-villa": "Fischerhüttenstraße 14 Berlin Chipperfield",
  "d3-holocaust": "Holocaust-Mahnmal Berlin Cora-Berliner-Straße",
  "d4-band": "Band des Bundes Berlin Schiffbauerdamm",
  "d3-topo": "Topographie des Terrors Berlin",
  "d4-reichstag": "Reichstag Berlin",
  "d3-botschaft": "Schweizer Botschaft Berlin Otto-von-Bismarck-Allee",
  "d2-hkw": "Haus der Kulturen der Welt Berlin",
  "d4-siegessaeule": "Siegessäule Berlin Großer Stern",
  "d2-hansa": "Hansaplatz Berlin Hansaviertel",
  "d1-bauhaus-archiv": "Bauhaus-Archiv Berlin",
  "d4-icc": "Internationales Congress Centrum Berlin",
  "d1-unite": "Unité d'Habitation Berlin Flatowallee",
  "d1-olympia": "Olympiastadion Berlin",
  "d2-pavillon-breitscheid": "Breitscheidplatz Berlin Pavillon",
  "d2-gedaechtniskirche": "Gedächtniskirche Berlin Charlottenburg",
  "d2-bikini": "Bikini-Haus Berlin Budapester Straße",
  "d2-co-berlin": "C/O Berlin Amerika-Haus",
  "d4-newton": "Museum für Fotografie Berlin Jebensstraße",
  "d2-hamburger-bahnhof": "Hamburger Bahnhof Berlin",
  "d1-siemens": "Großsiedlung Siemensstadt Berlin",
  "d4-aeg-turbinen": "AEG Turbinenhalle Berlin Huttenstraße",
  "d4-strandbad-ploetzensee": "Strandbad Plötzensee Berlin",
  "d5-lemke": "Haus Lemke Berlin Oberseestraße",
  "d2-kino": "Kino International Berlin Karl-Marx-Allee",
  "d5-cafe-moskau": "Café Moskau Berlin Karl-Marx-Allee",
  "d2-kma": "Karl-Marx-Allee 126 Berlin",
  "d5-berghain": "Berghain Berlin",
  "d5-oberbaum": "Oberbaumbrücke Berlin",
  "d5-amazon": "Amazon Spheres Berlin Warschauer Straße",
  "d5-tacheles": "Oranienburger Straße 54 Berlin Tacheles",
  "d4-tchoban": "Museum für Architekturzeichnung Berlin",
  "d1-hufeisen": "Hufeisensiedlung Berlin Britz",
  "d6-taut-neukoelln": "Fuldastraße 37 Berlin Bruno Taut",
  "d5-ullsteinhaus": "Ullsteinhaus Berlin Tempelhofer Damm",
  "d5-tempelhof": "Flughafen Tempelhof Berlin",
  "d1-lokdepot": "Am Lokdepot Berlin Schöneberg",
  "d6-hallesches-ufer": "Hallesches Ufer 78 Berlin",
  "d5-kottbusser-tor": "Kottbusser Tor 25 Berlin",
  "d3-zanderroth": "Brunnenstraße 9 Berlin Zanderroth",
  "d3-bonjour-tristesse": "Bonjour Tristesse Wilhelmstraße Berlin Siza",
  "d6-so36": "SO36 Oranienstraße 190 Berlin",
  "d5-paul-lincke": "Paul-Lincke-Ufer 30 Berlin",
  "d6-ankerklause": "Ankerklause Berlin Admiralbrücke",
  "d3-ig-metall": "IG Metall Haus Berlin Alte Jakobstraße",
  "d5-koenig": "St. Agnes Kirche Berlin Alexandrinenstraße",
  "d3-berlinische": "Berlinische Galerie Berlin",
  "d6-r50": "R50 Baugruppe Berlin Ritterstraße",
  "d3-krier": "Rob Krier Wohnanlage Berlin Wilhelmstraße",
  "d5-springer": "Axel Springer Neubau Berlin Zimmerstraße",
  "d3-jm": "Jüdisches Museum Berlin",
  "d3-taz": "TAZ Berlin Rudi-Dutschke-Straße",
  "d3-lima": "LiMa Wohnhof Berlin Ritterstraße",
  "d3-hejduk": "Kreuzberg Tower Charlottenstraße Berlin",
  "d4-quartier-schuetzen": "Schützenstraße Mitte Berlin",
  "d3-checkpoint": "Haus am Checkpoint Charlie Berlin",
};

const stopIds = [...new Set(DAY_LAYOUT.flatMap((d) => d.stopIds))];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geocode(query) {
  const url =
    "https://nominatim.openstreetmap.org/search?q=" +
    encodeURIComponent(query + ", Berlin, Germany") +
    "&format=json&limit=1&countrycodes=de";
  const res = await fetch(url, {
    headers: { "User-Agent": "FridayCircleBerlinArchTour/1.0 (friday-circle)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data[0]) return null;
  return { lat: +(+data[0].lat).toFixed(7), lng: +(+data[0].lon).toFixed(7) };
}

const coords = {};
const failed = [];

for (const id of stopIds) {
  const query = QUERY_OVERRIDES[id] || `${names.get(id) || id} Berlin`;
  await sleep(1100);
  const c = await geocode(query.replace(/, Berlin, Germany$/, ""));
  if (c && c.lat >= 52.33 && c.lat <= 52.62 && c.lng >= 13.08 && c.lng <= 13.65) {
    coords[id] = c;
    console.log("OK", id, c.lat, c.lng, "—", query);
  } else {
    failed.push(id);
    console.log("FAIL", id, "—", query);
  }
}

if (failed.length) {
  const { COORDS_BY_STOP: prev } = await import("./berlin-arch-tour-coords.mjs");
  for (const id of failed) {
    if (prev[id]) {
      coords[id] = prev[id];
      console.log("KEEP", id, prev[id]);
    }
  }
}

for (const [id, c] of Object.entries(MANUAL_COORDS)) {
  coords[id] = c;
  console.log("MANUAL", id, c);
}

const lines = Object.entries(coords)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(
    ([id, c]) => `  "${id}": {\n    "lat": ${c.lat},\n    "lng": ${c.lng}\n  },`
  )
  .join("\n");

writeFileSync(
  coordsPath,
  `/** WGS84 coordinates for Berlin Architecture Tour stops (map markers). */\nexport const COORDS_BY_STOP = {\n${lines}\n};\n`
);
console.log("\nWrote", Object.keys(coords).length, "coordinates,", failed.length, "fallbacks");

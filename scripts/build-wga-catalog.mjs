#!/usr/bin/env node
/**
 * Ordnet assets/wolfgang-grope/*.jpg den Katalog-Sections zu (Reihenfolge = Nummer im Dateinamen).
 * Danach: node scripts/build-wga-catalog.mjs && node scripts/sync-wga-catalog-js.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(root, "assets/wolfgang-grope");
const jsonPath = path.join(root, "data/wga-catalog.json");

const SECTION_DEFS = [
  { id: "oel-1955-1970", title: "1955 - 1970 Ölmalerei", re: /^WG-(Aquarell|Oel)-1955-1970-/i },
  { id: "rad-1972-1974", title: "1972 - 1974 Radierungen", re: /^WG-Grafik-1972-1974-/i },
  { id: "oel-1974-drei", title: "1974 Drei Ölgemälde", re: /^WG-Gemaelde-1974-/i },
  {
    id: "rad-1975-1979",
    title: "1975 - 1979 Radierungen",
    re: /^WG-(Grafik|Zeichnung)-1975-1979-/i,
  },
  {
    id: "zeich-1976-1991",
    title: "1976 - 1991 Zeichnungen und Gemälde",
    re: /^WG-(Gemaelde|Zeichnung|Grafik)-1976-1991-/i,
  },
  {
    id: "rad-holz-1984-1993",
    title: "1984 - 1993 Radierungen und Holzschnitte",
    re: /^WG-Grafik-1984-1993-/i,
  },
  {
    id: "zeich-1991-1995",
    title: "1991 - 1995 Zeichnungen und Skizzen",
    re: /^WG-(Zeichnung|Skizze|Gemaelde|Grafik)-1991-1995-/i,
  },
  { id: "gem-1998-2001", title: "1998 - 2001 Gemälde", re: /^WG-Gemaelde-1998-2001-/i },
  {
    id: "skiz-2001-2003",
    title: "2001 - 2003 Skizzen",
    re: /^WG-(Gemaelde|Skizze|Zeichnung)-2001-2003-/i,
  },
  {
    id: "abstraktion-2002",
    title: "2002 Abstraktion. Zwei Gemälde, Skizzen und eine Radierung",
    re: /^WG-Gemaelde-2002-/i,
  },
  {
    id: "skiz-2003-2007",
    title: "2003, 2005, 2007 Eine Skizze je Jahr",
    re: /^WG-(Gemaelde|Skizze|Zeichnung)-2003-2007-/i,
  },
  { id: "keramiken", title: "Keramiken", re: /^WG-Keramik-/i },
];

function mediumAndTitle(base) {
  if (/Aquarell/i.test(base)) return { medium: "Aquarell", title: "Aquarell" };
  if (/Oel/i.test(base)) return { medium: "Öl auf Leinwand", title: "Ölmalerei" };
  if (/Grafik/i.test(base)) return { medium: "Radierung", title: "Radierung" };
  if (/Gemaelde/i.test(base)) return { medium: "Gemälde", title: "Gemälde" };
  if (/Zeichnung/i.test(base)) return { medium: "Zeichnung", title: "Zeichnung" };
  if (/Skizze/i.test(base)) return { medium: "Skizze", title: "Skizze" };
  if (/Keramik/i.test(base)) return { medium: "Keramik", title: "Keramik" };
  return { medium: "—", title: "Werk" };
}

function workFromFile(filename) {
  const base = filename.replace(/\.[^.]+$/i, "");
  const numMatch = base.match(/-(\d+)$/);
  const sortNum = numMatch ? parseInt(numMatch[1], 10) : 0;
  const { medium, title } = mediumAndTitle(base);
  const id = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    id,
    title,
    year: "—",
    medium,
    dimensions: "—",
    body: "",
    images: [`assets/wolfgang-grope/${filename}`],
    sortNum,
  };
}

function sectionForFile(filename) {
  for (const def of SECTION_DEFS) {
    if (def.re.test(filename)) return def.id;
  }
  return null;
}

const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const buckets = Object.fromEntries(SECTION_DEFS.map((d) => [d.id, []]));

const files = fs
  .readdirSync(assetsDir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith("."));

for (const file of files) {
  const sid = sectionForFile(file);
  if (!sid) {
    console.warn("Unzugeordnet:", file);
    continue;
  }
  buckets[sid].push(workFromFile(file));
}

for (const id of Object.keys(buckets)) {
  buckets[id].sort((a, b) => a.sortNum - b.sortNum);
  buckets[id] = buckets[id].map(({ sortNum, ...w }) => w);
}

const payload = {
  meta: existing.meta,
  heroSlides: existing.heroSlides,
  sections: SECTION_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    works: buckets[def.id] || [],
  })),
};

fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");

let total = 0;
for (const s of payload.sections) {
  console.log(`${s.title}: ${s.works.length} Werke`);
  total += s.works.length;
}
console.log(`Gesamt: ${total} Werke → ${jsonPath}`);

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

const HOLZSCHNITT_1972_1974 = new Set([14, 15, 16, 18, 19, 52, 53, 54, 55, 56, 57, 58]);
const SKIP_GRAFIK_1972_1974 = new Set([11]);

const SECTION_DEFS = [
  {
    id: "aquarell-1960",
    title: "1960 - Aquarell",
    re: /^WG-Aquarell-1955-1970-/i,
    skip: (f) => /^WG-Aquarell-1955-1970-01\./i.test(f),
  },
  { id: "acryl-1970", title: "1970 - Acryl", re: /^WG-Oel-1955-1970-/i },
  { id: "rad-1972-1974", title: "1972 - 1974 Radierungen", re: /^WG-Grafik-1972-1974-/i },
  { id: "holz-1973-1974", title: "1973 - 1974 - Holzschnitt", re: /^WG-Grafik-1972-1974-/i },
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

function mediumAndTitle(base, sectionId) {
  if (/Aquarell/i.test(base)) return { medium: "Aquarell", title: "Aquarell" };
  if (/Oel/i.test(base) && sectionId === "acryl-1970") return { medium: "Acryl", title: "Acryl" };
  if (/Oel/i.test(base)) return { medium: "Öl auf Leinwand", title: "Ölmalerei" };
  if (sectionId === "holz-1973-1974") return { medium: "Holzschnitt", title: "Holzschnitt" };
  if (/Grafik/i.test(base)) return { medium: "Radierung", title: "Radierung" };
  if (/Gemaelde/i.test(base)) return { medium: "Gemälde", title: "Gemälde" };
  if (/Zeichnung/i.test(base)) return { medium: "Zeichnung", title: "Zeichnung" };
  if (/Skizze/i.test(base)) return { medium: "Skizze", title: "Skizze" };
  if (/Keramik/i.test(base)) return { medium: "Keramik", title: "Keramik" };
  return { medium: "—", title: "Werk" };
}

function workFromFile(filename, sectionId, existingById) {
  const base = filename.replace(/\.[^.]+$/i, "");
  const numMatch = base.match(/-(\d+)$/);
  const sortNum = numMatch ? parseInt(numMatch[1], 10) : 0;
  const { medium, title } = mediumAndTitle(base, sectionId);
  const id = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const work = {
    id,
    title,
    year: "—",
    medium,
    dimensions: "—",
    body: "",
    images: [`assets/wolfgang-grope/${filename}`],
    sortNum,
  };
  const prev = existingById.get(id);
  if (!prev) return work;
  for (const key of ["title", "year", "medium", "dimensions", "body", "price", "availability"]) {
    if (prev[key] != null && prev[key] !== "" && prev[key] !== "—") {
      work[key] = prev[key];
    }
  }
  return work;
}

function grafik1972Num(filename) {
  const m = filename.match(/^WG-Grafik-1972-1974-(\d+)\./i);
  return m ? parseInt(m[1], 10) : null;
}

function sectionForFile(filename) {
  const grafikNum = grafik1972Num(filename);
  if (grafikNum !== null) {
    if (SKIP_GRAFIK_1972_1974.has(grafikNum)) return null;
    if (HOLZSCHNITT_1972_1974.has(grafikNum)) return "holz-1973-1974";
    return "rad-1972-1974";
  }
  for (const def of SECTION_DEFS) {
    if (def.id === "rad-1972-1974" || def.id === "holz-1973-1974") continue;
    if (def.skip && def.skip(filename)) continue;
    if (def.re.test(filename)) return def.id;
  }
  return null;
}

function sortSectionWorks(id, works) {
  works.sort((a, b) => a.sortNum - b.sortNum);
  if (id === "holz-1973-1974") {
    const i56 = works.findIndex((w) => w.sortNum === 56);
    const i57 = works.findIndex((w) => w.sortNum === 57);
    if (i56 >= 0 && i57 >= 0 && i57 > i56) {
      const w57 = works[i57];
      works.splice(i57, 1);
      works.splice(i56, 0, w57);
    }
  }
}

const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const existingById = new Map();
for (const section of existing.sections || []) {
  for (const work of section.works || []) {
    if (work && work.id) existingById.set(work.id, work);
  }
}
const buckets = Object.fromEntries(SECTION_DEFS.map((d) => [d.id, []]));

const files = fs
  .readdirSync(assetsDir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith("."));

for (const file of files) {
  const sid = sectionForFile(file);
  if (!sid) {
    if (grafik1972Num(file) === null) console.warn("Unzugeordnet:", file);
    continue;
  }
  buckets[sid].push(workFromFile(file, sid, existingById));
}

for (const id of Object.keys(buckets)) {
  sortSectionWorks(id, buckets[id]);
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

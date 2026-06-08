#!/usr/bin/env node
/**
 * Build WGA catalog from folder-sorted assets + wg-notion-import.csv
 *
 *   node scripts/build-wga-catalog.mjs
 *   node scripts/sync-wga-catalog-js.mjs
 *
 * CSV: data/sources/wg-notion-import.csv
 * Columns: ID, Dateiname, Kapitel, Sektion, Jahr, Technik
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(root, "assets/wolfgang-grope");
const jsonPath = path.join(root, "data/wga-catalog.json");
const csvPath = path.join(root, "data/sources/wg-notion-import.csv");
const berlinUnavailablePath = path.join(root, "data/sources/wg-berlin-unavailable.txt");

function parseCsv(text) {
  const rows = [];
  let cur = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      row.push(cur);
      cur = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      cur = "";
    } else cur += ch;
  }
  row.push(cur);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function clean(val) {
  return val == null ? "" : String(val).trim();
}

function nfcPath(value) {
  return String(value ?? "").normalize("NFC");
}

function nfc(value) {
  return clean(value).normalize("NFC");
}

const CHAPTER_09_FOLDER_ORDER = [
  "09 90'er Jahre 1990 (Krypta Würzburger Dom)",
  "09 90'er Jahre 1991 (Skizzen Griechenland)",
  "09 90'er Jahre 1990-1995 (Aquarellbilder)",
  "09 90'er Jahre 1991-1995 (Skribbel)",
  "09 90'er jahre 1992 (Acrylbilder im Großformat)",
  "09 90'er Jahre 1992 (Skizzen Bornholm)",
  "09 90'er Jahre 1992 (Tuschestrichzeichnungen)",
  "09 90'er Jahre 1992-1994 (Skizzenbuch)",
  "09 90'er Jahre 1993 (Spontanes Objekt)",
  "09 90'er Jahre 1995 (Obst in Aquarell)",
  "09 90'er Jahre 1995 (Ölkreide)",
  "09 90'er Jahre 1995 (Skizzen Lofoten)",
];

const FOLDER_ORDER_KEYS = new Map(
  CHAPTER_09_FOLDER_ORDER.map((name, index) => [nfc(name), `009-${String(index).padStart(3, "0")}`])
);

/** Keramik: second row omitted; extra image merged into primary work for popup slider. */
const KERAMIK_SKIP_IDS = new Set([
  "WG-11-008",
  "WG-11-011",
  "WG-11-040",
  "WG-11-042",
  "WG-11-044",
  "WG-11-050",
  "WG-11-052",
  "WG-11-055",
  "WG-11-061",
]);

const KERAMIK_EXTRA_IMAGES = new Map([
  ["WG-11-007", ["WG-Keramik-08.jpg"]],
  ["WG-11-010", ["WG-Keramik-11.jpg"]],
  ["WG-11-039", ["WG-Keramik-42.jpg"]],
  ["WG-11-047", ["WG-Keramik-52.jpg"]],
  ["WG-11-048", ["WG-Keramik-55.jpg"]],
  ["WG-11-049", ["WG-Keramik-50.jpg"]],
  ["WG-11-059", ["WG-Keramik-61.jpg"]],
]);

function resolveWorkImagePaths(primaryFilename, extraFilenames, imageIndex) {
  const images = [];
  for (const file of [primaryFilename, ...extraFilenames]) {
    const rel = imageIndex.get(nfc(file)) || imageIndex.get(file);
    if (!rel) {
      console.warn("Image not found for work merge:", file);
      continue;
    }
    images.push(`assets/wolfgang-grope/${rel}`);
  }
  return images;
}

function isBerlinUnavailable(filenames, unavailable) {
  return filenames.some((file) => unavailable.has(nfc(file)));
}

function folderSortKey(folder) {
  const ordered = FOLDER_ORDER_KEYS.get(nfc(folder));
  if (ordered) return `${ordered}-${folder.toLowerCase()}`;
  const m = folder.match(/^(\d+|x)\s*/i);
  if (!m) return `z-${folder}`;
  const prefix = m[1].toLowerCase() === "x" ? 999 : parseInt(m[1], 10);
  return `${String(prefix).padStart(3, "0")}-${folder.toLowerCase()}`;
}

function indexImages() {
  const byName = new Map();
  for (const entry of fs.readdirSync(assetsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const folder = nfcPath(entry.name);
    const dir = path.join(assetsDir, entry.name);
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
      const rel = `${folder}/${nfcPath(file)}`;
      byName.set(nfcPath(file), rel);
      byName.set(nfc(file), rel);
      if (file !== nfcPath(file)) byName.set(file, rel);
    }
  }
  return byName;
}

function loadCsvRows() {
  if (!fs.existsSync(csvPath)) {
    console.error(`Missing CSV: ${csvPath}`);
    process.exit(1);
  }
  const parsed = parseCsv(fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, ""));
  const headers = parsed[0].map((h) => clean(h));
  const idx = {
    id: headers.indexOf("ID"),
    filename: headers.indexOf("Dateiname"),
    chapter: headers.indexOf("Kapitel"),
    section: headers.indexOf("Sektion"),
    year: headers.indexOf("Jahr"),
    medium: headers.indexOf("Technik"),
  };
  if (idx.id < 0 || idx.filename < 0) {
    console.error("CSV must contain ID and Dateiname columns.");
    process.exit(1);
  }
  return parsed.slice(1).map((cells) => ({
    id: clean(cells[idx.id]),
    filename: nfc(cells[idx.filename]),
    chapter: idx.chapter >= 0 ? nfc(cells[idx.chapter]) : "",
    section: idx.section >= 0 ? nfc(cells[idx.section]) : "",
    year: idx.year >= 0 ? clean(cells[idx.year]) : "",
    medium: idx.medium >= 0 ? nfc(cells[idx.medium]) : "",
  }));
}

function loadPreviousMeta() {
  const byFilename = new Map();
  const byId = new Map();
  if (!fs.existsSync(jsonPath)) return { byFilename, byId };
  const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  for (const section of existing.sections || []) {
    for (const work of section.works || []) {
      if (!work) continue;
      if (work.id) byId.set(work.id.toLowerCase(), work);
      const base = (work.images && work.images[0] || "").split("/").pop();
      if (base) byFilename.set(base.toLowerCase(), work);
    }
  }
  return { byFilename, byId };
}

function deriveChapterYear(chapter, chapterSections) {
  const eraFull = chapter.match(/\b(20\d{2})er\s+Jahre/i);
  if (eraFull) return `${eraFull[1]}er Jahre`;

  const eraShort = chapter.match(/\b(\d{2})er\s+Jahre/i);
  if (eraShort) {
    const n = parseInt(eraShort[1], 10);
    return n >= 80 ? `19${eraShort[1]}er Jahre` : `20${eraShort[1]}er Jahre`;
  }

  const years = [];
  const addToken = (token) => {
    const matches = String(token || "").match(/\d{4}/g);
    if (matches) matches.forEach((y) => years.push(parseInt(y, 10)));
  };

  for (const section of chapterSections) {
    if (section.sectionLabel && /^\d{4}(?:[–-]\d{4})?$/.test(section.sectionLabel.trim())) {
      addToken(section.sectionLabel);
    }
    addToken(section.title);
  }
  addToken(chapter);

  if (!years.length) return "";
  years.sort((a, b) => a - b);
  const min = years[0];
  const max = years[years.length - 1];
  return min === max ? String(min) : `${min}–${max}`;
}

function attachChapterYears(sections) {
  const byChapter = new Map();
  for (const section of sections) {
    if (!byChapter.has(section.chapter)) byChapter.set(section.chapter, []);
    byChapter.get(section.chapter).push(section);
  }
  for (const section of sections) {
    section.chapterYear = deriveChapterYear(section.chapter, byChapter.get(section.chapter) || []);
  }
  return sections;
}

function loadBerlinUnavailable() {
  if (!fs.existsSync(berlinUnavailablePath)) return new Set();
  return new Set(
    fs
      .readFileSync(berlinUnavailablePath, "utf8")
      .split(/\r?\n/)
      .map((line) => nfc(clean(line)))
      .filter(Boolean)
  );
}

function mergeMeta(work, prev) {
  if (!prev) return work;
  for (const key of ["dimensions", "body", "price", "availability"]) {
    if (prev[key] != null && prev[key] !== "" && prev[key] !== "—") {
      work[key] = prev[key];
    }
  }
  if (prev.title && prev.title !== "—" && prev.title !== work.title) {
    const mediumChanged =
      nfc(prev.medium || "").toLowerCase() !== nfc(work.medium || "").toLowerCase();
    if (!mediumChanged) work.title = prev.title;
  }
  return work;
}

function buildHeroSlides(imageIndex, csvByFilename) {
  const HERO_SLIDE_FILES = [
    "WG-Ölmalerei-1960-07.jpg",
    "WG-Grafik-1972-1974-50.jpg",
    "WG-Grafik-1975-09.jpg",
    "WG-Aquarell-1976-14.jpg",
    "WG-Buntstiftskizze-1979-08.jpg",
    "WG-Buntstiftskizze-1980-11.jpg",
    "WG-Aquarell-1984-27.jpg",
    "WG-Ölkreide-1987-47.jpg",
    "WG-Grafik-1991-1995-100.jpg",
    "WG-Aquarell-1990-62.jpg",
    "WG-Tuscheskizze-1976-03.jpg",
    "WG-Tuschezeichnung-1992-19.jpg",
    "WG-Aquarell-Lofoten-1995-71.jpg",
    "WG-Ölgemälde-2002-04.jpg",
    "WG-Gemaelde-2002-03 Kopie.jpg",
    "WG-Keramik-07.jpg",
    "WG-Keramik-49.jpg",
    "WG-Keramik-45.jpg",
  ];

  return HERO_SLIDE_FILES.map((file) => {
    const nfile = nfc(file);
    const rel = imageIndex.get(nfile) || imageIndex.get(file);
    if (!rel) {
      console.warn("Hero image not found:", file);
      return null;
    }
    const row = csvByFilename.get(nfile);
    const year = row?.year || "";
    const medium = row?.medium || "";
    const slide = {
      src: `assets/wolfgang-grope/${rel}`,
      alt: `Wolfgang Grope — ${[medium, year].filter(Boolean).join(", ")}`,
      year,
      medium,
    };
    if (/keramik/i.test(medium)) slide.logoOn = "dark";
    return slide;
  }).filter(Boolean);
}

const imageIndex = indexImages();
const csvRows = loadCsvRows();
const csvByFilename = new Map(csvRows.map((row) => [nfc(row.filename), row]));
const berlinUnavailable = loadBerlinUnavailable();
const prevMeta = loadPreviousMeta();
const existing = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : { meta: {} };

const sectionMap = new Map();

for (const row of csvRows) {
  if (!row.id || !row.filename) continue;
  if (/^x\b/i.test(row.chapter)) continue;
  if (KERAMIK_SKIP_IDS.has(row.id)) continue;
  const extraFiles = KERAMIK_EXTRA_IMAGES.get(row.id) || [];
  const rel = imageIndex.get(row.filename);
  if (!rel) {
    console.warn("Image not found in numbered folders:", row.filename);
    continue;
  }
  const images = resolveWorkImagePaths(row.filename, extraFiles, imageIndex);
  if (!images.length) continue;
  const folder = rel.includes("/") ? rel.split("/")[0] : "";
  if (!sectionMap.has(folder)) {
    sectionMap.set(folder, {
      folder,
      chapter: row.chapter,
      sectionLabel: row.section,
      works: [],
    });
  }

  const workId = row.id.toLowerCase();
  const prev = prevMeta.byId.get(workId) || prevMeta.byFilename.get(row.filename.toLowerCase());
  const work = mergeMeta(
    {
      id: workId,
      catalogId: row.id,
      title: row.medium || row.chapter || "Werk",
      year: row.year || "—",
      medium: row.medium || "—",
      dimensions: "—",
      body: "",
      berlinStatus: isBerlinUnavailable([row.filename, ...extraFiles], berlinUnavailable)
        ? "unavailable"
        : "available",
      images,
    },
    prev
  );
  sectionMap.get(folder).works.push(work);
}

const sections = attachChapterYears(
  Array.from(sectionMap.values())
    .sort((a, b) => folderSortKey(a.folder).localeCompare(folderSortKey(b.folder), undefined, { numeric: true }))
    .map((entry, index, all) => {
      const base = slugify(entry.folder) || `section-${index + 1}`;
      let id = base;
      let n = 2;
      while (all.some((s, j) => j < index && slugify(s.folder) === id)) {
        id = `${base}-${n++}`;
      }
      return {
        id,
        title: entry.folder,
        folder: entry.folder,
        chapter: entry.chapter,
        sectionLabel: entry.sectionLabel,
        works: entry.works,
      };
    })
);

const payload = {
  meta: {
    artist: existing.meta?.artist || "Wolfgang Grope",
    heroHeadline: existing.meta?.heroHeadline || "1955 - 2005",
    placeholder: existing.meta?.placeholder || "assets/wolfgang-grope/placeholder.svg",
  },
  heroSlides: buildHeroSlides(imageIndex, csvByFilename),
  sections: sections.map(({ id, title, chapter, chapterYear, sectionLabel, works }) => ({
    id,
    title,
    chapter,
    chapterYear,
    sectionLabel,
    works,
  })),
};

fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");

let total = 0;
for (const s of payload.sections) {
  console.log(`${s.title}: ${s.works.length} Werke`);
  total += s.works.length;
}
console.log(`Gesamt: ${total} Werke → ${jsonPath}`);

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

function folderSortKey(folder) {
  const m = folder.match(/^(\d+|x)\s*/i);
  if (!m) return `z-${folder}`;
  const prefix = m[1].toLowerCase() === "x" ? 999 : parseInt(m[1], 10);
  return `${String(prefix).padStart(3, "0")}-${folder.toLowerCase()}`;
}

function indexImages() {
  const byName = new Map();
  for (const entry of fs.readdirSync(assetsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const folder = entry.name;
    const dir = path.join(assetsDir, folder);
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
      byName.set(file, `${folder}/${file}`);
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
    filename: clean(cells[idx.filename]),
    chapter: idx.chapter >= 0 ? clean(cells[idx.chapter]) : "",
    section: idx.section >= 0 ? clean(cells[idx.section]) : "",
    year: idx.year >= 0 ? clean(cells[idx.year]) : "",
    medium: idx.medium >= 0 ? clean(cells[idx.medium]) : "",
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

function mergeMeta(work, prev) {
  if (!prev) return work;
  for (const key of ["dimensions", "body", "price", "availability"]) {
    if (prev[key] != null && prev[key] !== "" && prev[key] !== "—") {
      work[key] = prev[key];
    }
  }
  if (prev.title && prev.title !== "—" && prev.title !== work.title) {
    work.title = prev.title;
  }
  return work;
}

function pickHeroSlides(sections) {
  const findImage = (filename) => {
    for (const section of sections) {
      for (const work of section.works) {
        const base = work.images[0].split("/").pop();
        if (base === filename) return work.images[0];
      }
    }
    return null;
  };

  const picks = [
    { file: "WG-Gemaelde-1976-1991-30.jpg", alt: "Wolfgang Grope — Gemälde 1976–1991", folderHint: "Skizzen" },
    { file: "WG-Gemaelde-2002-04.jpg", alt: "Wolfgang Grope — Gemälde 2002", folderHint: "1999-2002" },
    { file: "WG-Grafik-1972-1974-39.jpg", alt: "Wolfgang Grope — Radierung 1972–1974" },
    { file: "WG-Keramik-25.jpg", alt: "Wolfgang Grope — Keramik", logoOn: "dark" },
  ];

  return picks.map((pick) => {
    let src = findImage(pick.file);
    if (!src && pick.folderHint) {
      outer: for (const section of sections) {
        if (!section.folder.includes(pick.folderHint)) continue;
        if (section.works.length) {
          src = section.works[Math.min(2, section.works.length - 1)].images[0];
          break outer;
        }
      }
    }
    if (!src) {
      for (const section of sections) {
        if (section.works.length) {
          src = section.works[0].images[0];
          break;
        }
      }
    }
    const slide = { src, alt: pick.alt };
    if (pick.logoOn) slide.logoOn = pick.logoOn;
    return slide;
  }).filter((s) => s.src);
}

const imageIndex = indexImages();
const csvRows = loadCsvRows();
const prevMeta = loadPreviousMeta();
const existing = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : { meta: {} };

const sectionMap = new Map();

for (const row of csvRows) {
  if (!row.id || !row.filename) continue;
  const rel = imageIndex.get(row.filename);
  if (!rel) {
    console.warn("Image not found in numbered folders:", row.filename);
    continue;
  }
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
      images: [`assets/wolfgang-grope/${rel}`],
    },
    prev
  );
  sectionMap.get(folder).works.push(work);
}

const sections = Array.from(sectionMap.values())
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
  });

const payload = {
  meta: {
    artist: existing.meta?.artist || "Wolfgang Grope",
    heroHeadline: existing.meta?.heroHeadline || "1955 - 2005",
    placeholder: existing.meta?.placeholder || "assets/wolfgang-grope/placeholder.svg",
  },
  heroSlides: pickHeroSlides(sections),
  sections: sections.map(({ id, title, chapter, sectionLabel, works }) => ({
    id,
    title,
    chapter,
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

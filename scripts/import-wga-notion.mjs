#!/usr/bin/env node
/**
 * Import WGA metadata from Notion CSV export into data/wga-catalog.json
 *
 * CSV: data/sources/wg-notion-import.csv (master image map)
 *        or data/sources/wga-notion-export.csv (metadata round-trip)
 *
 *   node scripts/import-wga-notion.mjs
 *   node scripts/sync-wga-catalog-js.mjs
 *
 * Matching is by column "ID". Empty cells do not overwrite existing values,
 * except Verfügbarkeit "—" or empty clears availability.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "data/wga-catalog.json");
const sourcesDir = path.join(root, "data/sources");

const AVAILABILITY_MAP = {
  "verkäuflich": "available",
  verkauflich: "available",
  available: "available",
  "unverkäuflich": "not_for_sale",
  unverkauflich: "not_for_sale",
  "nicht verkäuflich": "not_for_sale",
  "not for sale": "not_for_sale",
  not_for_sale: "not_for_sale",
  verkauft: "sold",
  sold: "sold",
  verliehen: "on_loan",
  on_loan: "on_loan",
  loaned: "on_loan",
};

function findCsvPath() {
  const preferred = [
    path.join(sourcesDir, "wga-notion-export.csv"),
    path.join(sourcesDir, "wg-notion-import.csv"),
  ];
  for (const p of preferred) {
    if (fs.existsSync(p)) return p;
  }
  if (!fs.existsSync(sourcesDir)) return null;
  const files = fs
    .readdirSync(sourcesDir)
    .filter((f) => /wga|wg-notion/i.test(f) && f.endsWith(".csv"))
    .sort();
  return files.length ? path.join(sourcesDir, files[0]) : null;
}

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

function normHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function colIndex(headers, names) {
  const norm = headers.map(normHeader);
  for (const name of names) {
    const i = norm.indexOf(normHeader(name));
    if (i >= 0) return i;
  }
  return -1;
}

function clean(val) {
  if (val == null) return "";
  return String(val).trim();
}

function parseAvailability(raw) {
  const s = clean(raw).toLowerCase();
  if (!s || s === "—" || s === "-") return null;
  return AVAILABILITY_MAP[s] || AVAILABILITY_MAP[s.replace(/\s+/g, "_")] || null;
}

function setField(work, key, raw, { emptyClears = false } = {}) {
  const val = clean(raw);
  if (!val || val === "—") {
    if (emptyClears) delete work[key];
    return false;
  }
  if (work[key] === val) return false;
  work[key] = val;
  return true;
}

const csvPath = findCsvPath();
if (!csvPath) {
  console.error("No WGA Notion CSV found. Run: node scripts/export-wga-notion.mjs");
  process.exit(1);
}

const csvText = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(csvText);
if (rows.length < 2) {
  console.error("CSV has no data rows:", csvPath);
  process.exit(1);
}

const headers = rows[0];
const idx = {
  id: colIndex(headers, ["ID", "id"]),
  title: colIndex(headers, ["Titel", "title", "Technik"]),
  year: colIndex(headers, ["Jahr", "year"]),
  medium: colIndex(headers, ["Technik", "medium"]),
  dimensions: colIndex(headers, ["Maße", "Masse", "dimensions"]),
  price: colIndex(headers, ["Preis", "price"]),
  availability: colIndex(headers, ["Verfügbarkeit", "Verfugbarkeit", "availability"]),
  body: colIndex(headers, ["Text", "body", "Beschreibung"]),
};

if (idx.id < 0) {
  console.error('CSV must contain an "ID" column.');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const byId = new Map();
for (const section of catalog.sections || []) {
  for (const work of section.works || []) {
    if (work && work.id) byId.set(work.id.toLowerCase(), work);
    if (work && work.catalogId) byId.set(work.catalogId.toLowerCase(), work);
  }
}

let updated = 0;
let unknown = 0;

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const id = clean(row[idx.id]);
  if (!id) continue;
  const work = byId.get(id.toLowerCase());
  if (!work) {
    unknown++;
    continue;
  }
  let touched = false;

  if (idx.title >= 0) touched = setField(work, "title", row[idx.title]) || touched;
  if (idx.year >= 0) touched = setField(work, "year", row[idx.year]) || touched;
  if (idx.medium >= 0) touched = setField(work, "medium", row[idx.medium]) || touched;
  if (idx.dimensions >= 0) touched = setField(work, "dimensions", row[idx.dimensions]) || touched;
  if (idx.body >= 0) touched = setField(work, "body", row[idx.body]) || touched;
  if (idx.price >= 0) touched = setField(work, "price", row[idx.price], { emptyClears: true }) || touched;

  if (idx.availability >= 0) {
    const raw = clean(row[idx.availability]);
    if (!raw || raw === "—" || raw === "-") {
      if (work.availability) {
        delete work.availability;
        touched = true;
      }
    } else {
      const parsed = parseAvailability(raw);
      if (!parsed) {
        console.warn(`Unknown Verfügbarkeit for ${id}: ${raw}`);
      } else if (work.availability !== parsed) {
        work.availability = parsed;
        touched = true;
      }
    }
  }

  if (touched) updated++;
}

fs.writeFileSync(jsonPath, JSON.stringify(catalog, null, 2) + "\n");

console.log(`Imported from ${csvPath}`);
console.log(`Updated ${updated} works (${byId.size} in catalog, ${unknown} unknown IDs skipped).`);
console.log("Next: node scripts/sync-wga-catalog-js.mjs");

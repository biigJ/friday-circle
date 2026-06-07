#!/usr/bin/env node
/**
 * Export all WGA catalog works to a Notion-friendly CSV.
 *
 *   node scripts/export-wga-notion.mjs
 *
 * Output: data/sources/wga-notion-export.csv
 * In Notion: New database → Import → CSV → map columns.
 * Keep column "ID" unchanged — it is the re-import key.
 *
 * Verfügbarkeit options: verkäuflich | unverkäuflich | verkauft | verliehen
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "data/wga-catalog.json");
const outPath = path.join(root, "data/sources/wga-notion-export.csv");

const AVAILABILITY_DE = {
  available: "verkäuflich",
  not_for_sale: "unverkäuflich",
  sold: "verkauft",
  on_loan: "verliehen",
};

const HEADERS = [
  "ID",
  "Kapitel",
  "Dateiname",
  "Bildpfad",
  "Titel",
  "Jahr",
  "Technik",
  "Maße",
  "Preis",
  "Verfügbarkeit",
  "Text",
];

function csvCell(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(values) {
  return values.map(csvCell).join(",") + "\n";
}

function basename(imagePath) {
  if (!imagePath) return "";
  return imagePath.split("/").pop() || "";
}

const catalog = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const rows = [csvRow(HEADERS)];

for (const section of catalog.sections || []) {
  for (const work of section.works || []) {
    if (!work || work.empty) continue;
    const image = (work.images && work.images[0]) || "";
    rows.push(
      csvRow([
        work.id,
        section.title,
        basename(image),
        image,
        work.title || "",
        work.year || "",
        work.medium || "",
        work.dimensions || "",
        work.price || "",
        AVAILABILITY_DE[work.availability] || "",
        work.body || "",
      ])
    );
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, "\uFEFF" + rows.join(""), "utf8");

console.log(`Exported ${rows.length - 1} works → ${outPath}`);
console.log("Notion: Import CSV as database, then edit. Re-import with:");
console.log("  node scripts/import-wga-notion.mjs && node scripts/sync-wga-catalog-js.mjs");

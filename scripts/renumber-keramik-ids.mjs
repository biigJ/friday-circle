#!/usr/bin/env node
/**
 * Renumber Keramik catalog IDs sequentially (001…N).
 * Pairs use WG-11-NNN-a (primary) + WG-11-NNN-b (second view, grid-hidden).
 *
 *   node scripts/renumber-keramik-ids.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const KERAMIK_EXTRA_BY_PRIMARY = new Map([
  ["WG-Keramik-07.jpg", "WG-Keramik-08.jpg"],
  ["WG-Keramik-10.jpg", "WG-Keramik-11.jpg"],
  ["WG-Keramik-39.jpg", "WG-Keramik-42.jpg"],
  ["WG-Keramik-47.jpg", "WG-Keramik-52.jpg"],
  ["WG-Keramik-48.jpg", "WG-Keramik-55.jpg"],
  ["WG-Keramik-49.jpg", "WG-Keramik-50.jpg"],
  ["WG-Keramik-59.jpg", "WG-Keramik-61.jpg"],
]);

function nfc(s) {
  return String(s || "").normalize("NFC").trim();
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

function serializeCsv(rows) {
  return rows.map((cells) => cells.join(",")).join("\n") + "\n";
}

function renumberFile(relPath, isExport) {
  const filePath = path.join(root, relPath);
  const parsed = parseCsv(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  const headers = parsed[0];
  const idIdx = headers.findIndex((h) => nfc(h) === "ID");
  const fileIdx = headers.findIndex((h) => nfc(h) === "Dateiname");
  const chapterIdx = headers.findIndex((h) => nfc(h) === "Kapitel");

  const out = [headers];
  let seq = 0;

  for (let i = 1; i < parsed.length; i++) {
    const cells = parsed[i];
    const id = nfc(cells[idIdx]);
    const filename = nfc(cells[fileIdx]);
    const chapter = nfc(cells[chapterIdx]);

    if (!id.startsWith("WG-11-") || chapter !== "11 Keramik") {
      out.push(cells);
      continue;
    }
    if (/-b$/i.test(id)) continue;

    seq += 1;
    const num = String(seq).padStart(3, "0");
    const extra = KERAMIK_EXTRA_BY_PRIMARY.get(filename);

    if (extra) {
      const aId = `WG-11-${num}-a`;
      const bId = `WG-11-${num}-b`;
      const aRow = [...cells];
      aRow[idIdx] = aId;
      out.push(aRow);

      const bRow = [...cells];
      bRow[idIdx] = bId;
      bRow[fileIdx] = extra;
      out.push(bRow);
      console.log(`${id} → ${aId} + ${bId} (${filename} + ${extra})`);
    } else {
      const newId = `WG-11-${num}`;
      const row = [...cells];
      row[idIdx] = newId;
      out.push(row);
      console.log(`${id} → ${newId} (${filename})`);
    }
  }

  fs.writeFileSync(filePath, serializeCsv(out));
  console.log(`Wrote ${relPath} (${seq} Keramik slots)`);
}

renumberFile("data/sources/wg-notion-import.csv", false);
renumberFile("data/sources/wga-notion-export.csv", true);

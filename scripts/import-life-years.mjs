#!/usr/bin/env node
/**
 * Import kuratierte Jahresdaten in data/life-years.json
 * Quellen (in dieser Priorität):
 *   1. Notion CSV-Export → data/sources/notion-export.csv
 *   2. Matrix-Markdown   → data/sources/pragmatischer-optimismus-matrix.md
 *
 * Danach: node scripts/import-life-years.mjs && node scripts/sync-life-years-js.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "data/life-years.json");
const sourcesDir = path.join(root, "data/sources");
const matrixPath = path.join(sourcesDir, "pragmatischer-optimismus-matrix.md");

function findNotionCsvPath() {
  const preferred = path.join(sourcesDir, "notion-export.csv");
  if (fs.existsSync(preferred)) return preferred;
  if (!fs.existsSync(sourcesDir)) return null;
  const files = fs
    .readdirSync(sourcesDir)
    .filter((f) => f.endsWith(".csv"))
    .sort((a, b) => b.length - a.length);
  return files.length ? path.join(sourcesDir, files[0]) : null;
}

function parseNum(val) {
  if (val == null || val === "") return null;
  const m = String(val).replace(",", ".").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

function parseMatrix(md) {
  const years = {};
  const parts = md.split(/^##\s+(\d{4})\s*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const year = parseInt(parts[i], 10);
    const block = parts[i + 1];
    const label = block.match(/\*\*Label:\*\*\s*(.+)/)?.[1]?.trim() || "";
    const ueberschrift = block.match(/\*\*Überschrift:\*\*\s*(.+)/)?.[1]?.trim() || "";

    const weltSection = block.split("### Welt")[1]?.split("### Gesellschaft")[0] || "";
    const welt = {
      usa: "",
      china: "",
      alte_welt: "",
      neue_welt: "",
      crypto: "",
      handel: "",
    };
    const weltMap = [
      [/^\*\*Weltmacht USA:\*\*\s*([\s\S]*?)(?=^\*\*|\n---|\n###|$)/m, "usa"],
      [/^\*\*Aufstrebendes China:\*\*\s*([\s\S]*?)(?=^\*\*|\n---|\n###|$)/m, "china"],
      [/^\*\*Alte Welt[^:]*:\*\*\s*([\s\S]*?)(?=^\*\*|\n---|\n###|$)/m, "alte_welt"],
      [/^\*\*Neue Welt[^:]*:\*\*\s*([\s\S]*?)(?=^\*\*|\n---|\n###|$)/m, "neue_welt"],
      [/^\*\*Krypto[^:]*:\*\*\s*([\s\S]*?)(?=^\*\*|\n---|\n###|$)/m, "crypto"],
      [/^\*\*Handel[^:]*:\*\*\s*([\s\S]*?)(?=^\*\*|\n---|\n###|$)/m, "handel"],
    ];
    for (const [re, key] of weltMap) {
      const m = weltSection.match(re);
      if (m) welt[key] = m[1].trim().replace(/\n+/g, " ");
    }

    const gesellschaftSection = block.split("### Gesellschaft")[1]?.split("### Chancen")[0] || "";
    const gesellschaftText = gesellschaftSection
      .split("| Metrik |")[0]
      .trim()
      .replace(/\n+/g, " ");

    const metrics = {};
    const metricRows = gesellschaftSection.match(/\|\s*Screentime\s*\|\s*([^|]+)/i);
    if (metricRows) metrics.screentime_std_tag = parseNum(metricRows[1]);
    const friends = gesellschaftSection.match(/\|\s*Freundschaften\s*\|\s*([^|]+)/i);
    if (friends) metrics.freundschaften = parseNum(friends[1]);
    const freiheit = gesellschaftSection.match(/\|\s*Freiheit\s*\|\s*([^|]+)/i);
    if (freiheit) metrics.freiheit_pct = parseNum(freiheit[1]);
    const bmi = gesellschaftSection.match(/\|\s*BMI[^|]*\|\s*([^|]+)/i);
    if (bmi) metrics.bmi_weltweit = parseNum(bmi[1]);
    const polar = gesellschaftSection.match(/\|\s*Medienpolarisierung\s*\|\s*([^|]+)/i);
    if (polar) metrics.polarisierung_pct = parseNum(polar[1]);

    const chancenSection = block.split("### Chancen")[1]?.split("## ")[0] || "";
    const chancen = {
      mental: chancenSection.match(/\*\*🧠 Mentales:\*\*\s*([\s\S]*?)(?=^\*\*|$)/m)?.[1]?.trim().replace(/\n+/g, " ") || "",
      koerper: chancenSection.match(/\*\*💪 Körper:\*\*\s*([\s\S]*?)(?=^\*\*|$)/m)?.[1]?.trim().replace(/\n+/g, " ") || "",
      gemeinschaft: chancenSection.match(/\*\*🤝 Gemeinschaft:\*\*\s*([\s\S]*?)(?=^\*\*|$)/m)?.[1]?.trim().replace(/\n+/g, " ") || "",
      technologie: chancenSection.match(/\*\*🔬 Technologie:\*\*\s*([\s\S]*?)(?=^\*\*|$)/m)?.[1]?.trim().replace(/\n+/g, " ") || "",
    };

    const was_tun = {};
    const jung = block.match(/\*\*Was tun \(unter 50\):\*\*\s*([\s\S]*?)(?=^\*\*Was tun|\n---|\n## |$)/m);
    const aelter = block.match(/\*\*Was tun \(über 50\):\*\*\s*([\s\S]*?)(?=^\*\*|\n---|\n## |$)/m);
    if (jung) was_tun.jung = jung[1].trim().replace(/\n+/g, " ");
    if (aelter) was_tun.aelter = aelter[1].trim().replace(/\n+/g, " ");

    years[String(year)] = {
      jahr: year,
      label,
      ueberschrift,
      welt,
      gesellschaft: { text: gesellschaftText, metriken: metrics },
      chancen,
      ...(Object.keys(was_tun).length ? { was_tun } : {}),
    };
  }
  return years;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function splitCsvRows(csv) {
  const rows = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (ch === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        cur += ch;
      }
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (cur.trim()) rows.push(cur);
      cur = "";
      if (ch === "\r" && csv[i + 1] === "\n") i++;
    } else cur += ch;
  }
  if (cur.trim()) rows.push(cur);
  return rows;
}

function headerIndex(headers, names) {
  const norm = (s) =>
    s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]+/g, "");
  const normalized = headers.map(norm);
  for (const name of names) {
    const target = norm(name);
    const idx = normalized.findIndex((h) => h === target || h.includes(target) || target.includes(h));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseNotionCsv(csv) {
  const rows = splitCsvRows(csv.trim());
  if (rows.length < 2) return {};
  const headers = parseCsvLine(rows[0]);

  const idx = {
    jahr: headerIndex(headers, ["Jahr", "Year"]),
    label: headerIndex(headers, ["Label", "Epoche"]),
    ueberschrift: headerIndex(headers, ["Überschrift", "Headline"]),
    usa: headerIndex(headers, ["Welt_USA", "Weltmacht USA"]),
    china: headerIndex(headers, ["Welt_China", "Aufstrebendes China"]),
    alte_welt: headerIndex(headers, ["Welt_AlteWelt", "Alte Welt"]),
    neue_welt: headerIndex(headers, ["Welt_NeueWelt", "Neue Welt"]),
    crypto: headerIndex(headers, ["Welt_Crypto", "Crypto", "Krypto"]),
    handel: headerIndex(headers, ["Welt_Handel", "Handel"]),
    gesellschaft: headerIndex(headers, ["Gesellschaft_Text", "Gesellschaft"]),
    screentime: headerIndex(headers, ["Screentime_StdTag", "Screentime"]),
    freundschaften: headerIndex(headers, ["Freundschaften"]),
    freiheit: headerIndex(headers, ["Freiheit_Pct", "Freiheit"]),
    bmi: headerIndex(headers, ["BMI_Weltweit", "BMI"]),
    polar: headerIndex(headers, ["Polarisierung_Pct", "Polarisierung"]),
    mental: headerIndex(headers, ["Chancen_Mental", "Mentales"]),
    koerper: headerIndex(headers, ["Chancen_Koerper", "Koerper", "Körper"]),
    gemeinschaft: headerIndex(headers, ["Chancen_Gemeinschaft", "Gemeinschaft"]),
    technologie: headerIndex(headers, ["Chancen_Technologie", "Technologie"]),
    was_jung: headerIndex(headers, ["WasTun_Jung", "Was tun (unter 50)", "jung"]),
    was_aelter: headerIndex(headers, ["WasTun_Aelter", "Was tun (über 50)", "aelter", "älter"]),
  };

  const years = {};
  for (const row of rows.slice(1)) {
    const cells = parseCsvLine(row);
    const year = parseInt(cells[idx.jahr], 10);
    if (Number.isNaN(year)) continue;
    const get = (i) => (i >= 0 ? (cells[i] || "").trim() : "");
    const jung = get(idx.was_jung);
    const aelter = get(idx.was_aelter);
    years[String(year)] = {
      jahr: year,
      label: get(idx.label),
      ueberschrift: get(idx.ueberschrift),
      welt: {
        usa: get(idx.usa),
        china: get(idx.china),
        alte_welt: get(idx.alte_welt),
        neue_welt: get(idx.neue_welt),
        crypto: get(idx.crypto),
        handel: get(idx.handel),
      },
      gesellschaft: {
        text: get(idx.gesellschaft),
        metriken: {
          screentime_std_tag: parseNum(get(idx.screentime)),
          freundschaften: parseNum(get(idx.freundschaften)),
          freiheit_pct: parseNum(get(idx.freiheit)),
          bmi_weltweit: parseNum(get(idx.bmi)),
          polarisierung_pct: parseNum(get(idx.polar)),
        },
      },
      chancen: {
        mental: get(idx.mental),
        koerper: get(idx.koerper),
        gemeinschaft: get(idx.gemeinschaft),
        technologie: get(idx.technologie),
      },
      ...(jung || aelter ? { was_tun: { jung, aelter } } : {}),
    };
  }
  return years;
}

function deepMergeYear(base, override) {
  if (!override) return base;
  const pick = (a, b) => (a != null && a !== "" ? a : b ?? "");
  return {
    jahr: override.jahr ?? base.jahr,
    label: pick(override.label, base.label),
    ueberschrift: pick(override.ueberschrift, base.ueberschrift),
    welt: {
      usa: pick(override.welt?.usa, base.welt?.usa),
      china: pick(override.welt?.china, base.welt?.china),
      alte_welt: pick(override.welt?.alte_welt, base.welt?.alte_welt),
      neue_welt: pick(override.welt?.neue_welt, base.welt?.neue_welt),
      crypto: pick(override.welt?.crypto, base.welt?.crypto),
      handel: pick(override.welt?.handel, base.welt?.handel),
    },
    gesellschaft: {
      text: pick(override.gesellschaft?.text, base.gesellschaft?.text),
      metriken: {
        screentime_std_tag:
          override.gesellschaft?.metriken?.screentime_std_tag ??
          base.gesellschaft?.metriken?.screentime_std_tag,
        freundschaften:
          override.gesellschaft?.metriken?.freundschaften ??
          base.gesellschaft?.metriken?.freundschaften,
        freiheit_pct:
          override.gesellschaft?.metriken?.freiheit_pct ??
          base.gesellschaft?.metriken?.freiheit_pct,
        bmi_weltweit:
          override.gesellschaft?.metriken?.bmi_weltweit ??
          base.gesellschaft?.metriken?.bmi_weltweit,
        polarisierung_pct:
          override.gesellschaft?.metriken?.polarisierung_pct ??
          base.gesellschaft?.metriken?.polarisierung_pct,
      },
    },
    chancen: {
      mental: pick(override.chancen?.mental, base.chancen?.mental),
      koerper: pick(override.chancen?.koerper, base.chancen?.koerper),
      gemeinschaft: pick(override.chancen?.gemeinschaft, base.chancen?.gemeinschaft),
      technologie: pick(override.chancen?.technologie, base.chancen?.technologie),
    },
    ...(override.was_tun || base.was_tun
      ? {
          was_tun: {
            jung: pick(override.was_tun?.jung, base.was_tun?.jung),
            aelter: pick(override.was_tun?.aelter, base.was_tun?.aelter),
          },
        }
      : {}),
  };
}

const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const csvPath = findNotionCsvPath();
let csvYears = {};
let matrixYears = {};

if (csvPath) {
  csvYears = parseNotionCsv(fs.readFileSync(csvPath, "utf8"));
  console.log(`Notion CSV (${path.basename(csvPath)}): ${Object.keys(csvYears).length} Jahre`);
}

if (fs.existsSync(matrixPath) && Object.keys(csvYears).length < 20) {
  matrixYears = parseMatrix(fs.readFileSync(matrixPath, "utf8"));
  console.log(`Matrix MD: ${Object.keys(matrixYears).length} Jahre`);
}

if (!Object.keys(csvYears).length && !Object.keys(matrixYears).length) {
  console.error("Keine Import-Quelle gefunden.");
  console.error("Lege eine Notion-CSV in data/sources/ ab.");
  process.exit(1);
}

const REPLACE_FROM_YEAR = 2027;

for (const [key, rec] of Object.entries(csvYears)) {
  payload.years[key] = rec;
}

for (const key of Object.keys(payload.years)) {
  const year = parseInt(key, 10);
  if (year >= REPLACE_FROM_YEAR && !csvYears[key]) {
    delete payload.years[key];
  }
}

for (const [key, rec] of Object.entries(matrixYears)) {
  if (!csvYears[key]) {
    payload.years[key] = deepMergeYear(payload.years[key] || { jahr: parseInt(key, 10) }, rec);
  }
}

const importedCount = new Set([...Object.keys(csvYears), ...Object.keys(matrixYears)]).size;
const yearKeys = Object.keys(payload.years).map(Number).sort((a, b) => a - b);

payload.meta = {
  ...payload.meta,
  source: "Notion + Kuratierung",
  range: `${yearKeys[0]}-${yearKeys[yearKeys.length - 1]}`,
  count: yearKeys.length,
  last_import: new Date().toISOString().slice(0, 10),
  imported_years: importedCount,
  sources: [
    csvPath ? path.basename(csvPath) : null,
    fs.existsSync(matrixPath) && Object.keys(matrixYears).length ? "pragmatischer-optimismus-matrix.md" : null,
  ].filter(Boolean),
};

fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");
console.log(`Aktualisiert: ${jsonPath} (${Object.keys(payload.years).length} Jahre gesamt)`);

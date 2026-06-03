#!/usr/bin/env node
/**
 * Migriert YEAR_DATA aus fc-life-in-squares.js → data/life-years.json
 * Bestehende JSON-Einträge (Notion/Kuratierung) haben Vorrang.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsPath = path.join(root, "fc-life-in-squares.js");
const schemaPath = path.join(root, "data/pragmatischer-optimismus-schema.json");
const outPath = path.join(root, "data/life-years.json");
const existingPath = outPath;

const EPOCH_LABELS = [
  { name: "Kalter Krieg & Weltraum", start: 1960, end: 1969 },
  { name: "Ölkrise & Gegenkultur", start: 1970, end: 1979 },
  { name: "PC-Revolution", start: 1980, end: 1989 },
  { name: "Mauerfall & Prä-Web", start: 1990, end: 1994 },
  { name: "Frühes Web", start: 1995, end: 1999 },
  { name: "Dot-Com-Boom & Crash", start: 2000, end: 2004 },
  { name: "Web 2.0", start: 2004, end: 2009 },
  { name: "Smartphone-Revolution", start: 2007, end: 2013 },
  { name: "Plattform-Ökonomie", start: 2013, end: 2018 },
  { name: "Post-Truth & Pandemie", start: 2019, end: 2022 },
  { name: "KI-Zeitalter", start: 2023, end: 2026 },
  { name: "Tech-Oligarchie", start: 2027, end: 2031 },
  { name: "Neues Mittelalter", start: 2031, end: 2039 },
  { name: "Wendepunkt", start: 2039, end: 2049 },
  { name: "Neue Ordnung", start: 2050, end: 2084 },
];

function epochLabel(year) {
  for (const e of EPOCH_LABELS) {
    if (year >= e.start && year <= e.end) return e.name;
  }
  if (year < 1960) return "Vor 1960";
  return "Neue Ordnung";
}

function lerpMetric(arc, year) {
  if (!arc) return null;
  const keys = Object.keys(arc)
    .map(Number)
    .sort((a, b) => a - b);
  if (!keys.length) return null;
  if (arc[year] != null) return arc[year];
  let lo = keys[0];
  let hi = keys[keys.length - 1];
  for (const k of keys) {
    if (k <= year) lo = k;
  }
  for (const k of keys) {
    if (k >= year) {
      hi = k;
      break;
    }
  }
  if (lo === hi) return arc[lo];
  const t = (year - lo) / (hi - lo);
  return Math.round((arc[lo] + (arc[hi] - arc[lo]) * t) * 10) / 10;
}

function legacyToRecord(year, d, metricsArc) {
  const g = d.global || [];
  const p = d.pos || [];
  const n = d.neg || [];
  const record = {
    jahr: year,
    label: epochLabel(year),
    ueberschrift: d.event || "",
    welt: {
      usa: g[0] || "",
      china: g[1] || "",
      alte_welt: g[2] || "",
      neue_welt: g[3] || "",
      crypto: g[4] || "",
      handel: g[5] || "",
    },
    gesellschaft: {
      text: n.filter(Boolean).join(" "),
      metriken: {
        screentime_std_tag: d.screen ?? 0,
        freundschaften: d.friends ?? 0,
        freiheit_pct: lerpMetric(metricsArc?.freiheit_pct, year),
        bmi_weltweit: d.bmi ?? 0,
        polarisierung_pct: d.polar ?? 0,
      },
    },
    chancen: {
      mental: p[0] || "",
      koerper: p[1] || "",
      gemeinschaft: p[2] || "",
      technologie: p[3] || "",
    },
  };

  if (year >= 2027 && d.agency) {
    const intro = d.agency.intro || "";
    record.was_tun = {
      jung: d.agency.jung || intro,
      aelter: d.agency.aelter || intro,
    };
  }

  return record;
}

function deepMergeYear(base, override) {
  if (!override) return base;
  return {
    jahr: override.jahr ?? base.jahr,
    label: override.label || base.label,
    ueberschrift: override.ueberschrift || base.ueberschrift,
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

function pick(overrideVal, baseVal) {
  if (overrideVal != null && overrideVal !== "") return overrideVal;
  return baseVal ?? "";
}

function extractYearData(jsSource) {
  const start = jsSource.indexOf("const YEAR_DATA = {");
  const end = jsSource.indexOf("\n};\n\n// ═══════════════════════════════════════════════════════════\n// INTERPOLATION");
  if (start === -1 || end === -1) {
    throw new Error("YEAR_DATA block not found in fc-life-in-squares.js");
  }
  const objSrc = jsSource.slice(start + "const YEAR_DATA = ".length, end + 2);
  // eslint-disable-next-line no-new-func
  return new Function(`return ${objSrc}`)();
}

const jsSource = fs.readFileSync(jsPath, "utf8");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const existing = fs.existsSync(existingPath)
  ? JSON.parse(fs.readFileSync(existingPath, "utf8"))
  : { years: {} };
const yearData = extractYearData(jsSource);
const metricsArc = schema.key_metrics_arc || {};

const years = {};
const legacyYears = Object.keys(yearData).map(Number).sort((a, b) => a - b);

for (const year of legacyYears) {
  years[String(year)] = legacyToRecord(year, yearData[year], metricsArc);
}

for (const [key, rec] of Object.entries(existing.years || {})) {
  const y = parseInt(key, 10);
  years[key] = deepMergeYear(years[key] || legacyToRecord(y, {}, metricsArc), rec);
}

const output = {
  meta: {
    source: "fc-life-in-squares YEAR_DATA + Kuratierung",
    range: `${legacyYears[0]}-${legacyYears[legacyYears.length - 1]}`,
    count: Object.keys(years).length,
    generated: new Date().toISOString().slice(0, 10),
    note: "Neue Jahre ergänzen oder via scripts/build-life-years.mjs neu generieren",
  },
  years,
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");
const jsOutPath = path.join(root, "data/life-years.js");
fs.writeFileSync(jsOutPath, `window.__FC_LIFE_YEARS__=${JSON.stringify(output)};\n`);
console.log(`Wrote ${Object.keys(years).length} years to ${outPath}`);
console.log(`Wrote ${jsOutPath}`);

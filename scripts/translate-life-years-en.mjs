#!/usr/bin/env node
/**
 * Fügt englische Felder (rec.en) zu data/life-years.json hinzu.
 * Nutzt translate-google; danach: node scripts/sync-life-years-js.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import translate from "translate-google";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "data/life-years.json");
const force = process.argv.includes("--force");
const delayMs = Number(process.env.TRANSLATE_DELAY_MS || 120);

const LABEL_EN = {
  "Vor 1960": "Before 1960",
  "Kalter Krieg & Weltraum": "Cold War & Space",
  "Ölkrise & Gegenkultur": "Oil Crisis & Counterculture",
  "PC-Revolution": "PC Revolution",
  "Mauerfall & Prä-Web": "Fall of the Wall & Pre-Web",
  "Frühes Web": "Early Web",
  "Dot-Com-Boom & Crash": "Dot-Com Boom & Crash",
  "Web 2.0": "Web 2.0",
  "Smartphone-Revolution": "Smartphone Revolution",
  "Plattform-Ökonomie": "Platform Economy",
  "Post-Truth & Pandemie": "Post-Truth & Pandemic",
  "KI-Zeitalter": "AI Age",
  "Tech-Oligarchie": "Tech Oligarchy",
  "Neues Mittelalter": "New Middle Ages",
  "Wendepunkt": "Turning Point",
  "Neue Ordnung": "New Order",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tr(text) {
  const s = (text || "").trim();
  if (!s) return "";
  if (LABEL_EN[s]) return LABEL_EN[s];
  try {
    const out = await translate(s, { from: "de", to: "en" });
    await sleep(delayMs);
    return out || s;
  } catch (err) {
    console.warn("  translate fail:", s.slice(0, 40), err.message);
    return s;
  }
}

async function translateYear(rec) {
  const w = rec.welt || {};
  const c = rec.chancen || {};
  const wt = rec.was_tun || {};
  return {
    label: LABEL_EN[rec.label] || (await tr(rec.label)),
    ueberschrift: await tr(rec.ueberschrift),
    welt: {
      usa: await tr(w.usa),
      china: await tr(w.china),
      alte_welt: await tr(w.alte_welt),
      neue_welt: await tr(w.neue_welt),
      crypto: await tr(w.crypto),
      handel: await tr(w.handel),
    },
    gesellschaft: {
      text: await tr(rec.gesellschaft?.text),
      metriken: rec.gesellschaft?.metriken || {},
    },
    chancen: {
      mental: await tr(c.mental),
      koerper: await tr(c.koerper),
      gemeinschaft: await tr(c.gemeinschaft),
      technologie: await tr(c.technologie),
    },
    ...(wt.jung || wt.aelter
      ? { was_tun: { jung: await tr(wt.jung), aelter: await tr(wt.aelter) } }
      : {}),
  };
}

const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const keys = Object.keys(payload.years).map(Number).sort((a, b) => a - b);
let done = 0;
let skipped = 0;

for (const year of keys) {
  const key = String(year);
  const rec = payload.years[key];
  if (rec.en && !force) {
    skipped++;
    continue;
  }
  process.stdout.write(`Translating ${year}… `);
  rec.en = await translateYear(rec);
  done++;
  process.stdout.write("ok\n");
  if (done % 10 === 0) {
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");
    console.log(`  (checkpoint ${done} years)`);
  }
}

payload.meta = {
  ...payload.meta,
  locales: ["de", "en"],
  en_translated: new Date().toISOString().slice(0, 10),
};

fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");
console.log(`Done: ${done} translated, ${skipped} skipped → ${jsonPath}`);

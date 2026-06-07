#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dePath = path.join(root, "data/wga-bio-de.txt");
const enPath = path.join(root, "data/wga-bio-en.txt");
const jsPath = path.join(root, "data/wga-bio.js");

const payload = {
  de: fs.readFileSync(dePath, "utf8").trim(),
  en: fs.readFileSync(enPath, "utf8").trim(),
};

const body = `window.__WGA_BIO__=${JSON.stringify(payload)};\n`;
fs.writeFileSync(jsPath, body);
console.log(`Wrote ${jsPath} (${(fs.statSync(jsPath).size / 1024).toFixed(1)} KB)`);

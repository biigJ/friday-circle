#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "data/wga-catalog.json");
const jsPath = path.join(root, "data/wga-catalog.js");
const json = fs.readFileSync(jsonPath, "utf8");
fs.writeFileSync(jsPath, `window.__WGA_CATALOG__=${json};\n`);
console.log(`Wrote ${jsPath} (${(fs.statSync(jsPath).size / 1024).toFixed(1)} KB)`);

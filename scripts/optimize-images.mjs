#!/usr/bin/env node
/**
 * Generate resized WebP variants next to raster sources.
 * Naming: photo.png -> photo-800.webp, photo-1400.webp
 *
 * Usage:
 *   npm run optimize:images
 *   npm run optimize:images -- --dir assets/interior
 *   npm run optimize:images:force
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const RASTER_EXT = /\.(jpe?g|png|tiff?)$/i;
const VARIANT_SUFFIX = /-(800|1000|1200|1400|1600)\.webp$/i;

const RULES = [
  { test: (p) => p.startsWith("assets/interior/"), variants: [{ w: 800, q: 82 }, { w: 1400, q: 82 }] },
  { test: (p) => p.startsWith("assets/hochbau/"), variants: [{ w: 800, q: 82 }, { w: 1400, q: 82 }] },
  { test: (p) => p.startsWith("assets/interior-rocketscience/"), variants: [{ w: 800, q: 82 }, { w: 1400, q: 82 }] },
  { test: (p) => p.startsWith("assets/biigJ/"), variants: [{ w: 1200, q: 82 }] },
  { test: (p) => p.startsWith("assets/gogogo/"), variants: [{ w: 1600, q: 82 }] },
  { test: (p) => p.startsWith("assets/berlin-arch-tour/"), variants: [{ w: 1200, q: 82 }] },
  { test: (p) => p.startsWith("assets-mockups/"), variants: [{ w: 1200, q: 82 }] },
  { test: (p) => p.startsWith("assets/wolfgang-grope/"), variants: [{ w: 1000, q: 80 }] },
  { test: () => true, variants: [{ w: 1400, q: 82 }] },
];

const args = process.argv.slice(2);
const force = args.includes("--force");
const dirArgs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--dir" && args[i + 1]) {
    dirArgs.push(args[++i]);
  }
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function rel(absPath) {
  return toPosix(path.relative(ROOT, absPath));
}

function getVariants(relPath) {
  for (const rule of RULES) {
    if (rule.test(relPath)) return rule.variants;
  }
  return [{ w: 1400, q: 82 }];
}

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return out;
    throw err;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

async function isUpToDate(srcPath, outPath) {
  if (force) return false;
  try {
    const [srcStat, outStat] = await Promise.all([fs.stat(srcPath), fs.stat(outPath)]);
    return outStat.mtimeMs >= srcStat.mtimeMs;
  } catch {
    return false;
  }
}

async function processFile(absPath, stats) {
  const relPath = rel(absPath);
  if (!RASTER_EXT.test(relPath)) return;
  if (VARIANT_SUFFIX.test(relPath)) return;

  const variants = getVariants(relPath);
  const base = absPath.replace(RASTER_EXT, "");
  let wroteAny = false;

  for (const { w, q } of variants) {
    const outPath = `${base}-${w}.webp`;
    if (await isUpToDate(absPath, outPath)) {
      stats.skipped++;
      continue;
    }

    const image = sharp(absPath, { failOn: "none" }).rotate();
    const meta = await image.metadata();
    if (!meta.width) {
      stats.errors++;
      console.warn("skip (unreadable):", relPath);
      return;
    }

    await image
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: q, effort: 4 })
      .toFile(outPath);

    const outStat = await fs.stat(outPath);
    stats.bytesOut += outStat.size;
    stats.variants++;
    wroteAny = true;
  }

  if (wroteAny) {
    stats.sources++;
    const srcStat = await fs.stat(absPath);
    stats.bytesIn += srcStat.size;
  }
}

async function main() {
  const roots =
    dirArgs.length > 0
      ? dirArgs.map((d) => path.join(ROOT, d))
      : [path.join(ROOT, "assets"), path.join(ROOT, "assets-mockups")];

  const stats = { sources: 0, variants: 0, skipped: 0, errors: 0, bytesIn: 0, bytesOut: 0 };
  const files = [];
  for (const root of roots) {
    files.push(...(await walk(root)));
  }

  console.log(`Optimizing ${files.length} files under ${dirArgs.length ? dirArgs.join(", ") : "assets, assets-mockups"}…`);

  for (const file of files) {
    await processFile(file, stats);
  }

  const saved = stats.bytesIn - stats.bytesOut;
  const pct = stats.bytesIn > 0 ? Math.round((saved / stats.bytesIn) * 100) : 0;
  console.log(
    `Done: ${stats.variants} WebP variants from ${stats.sources} sources (${stats.skipped} up-to-date, ${stats.errors} errors).`
  );
  if (stats.bytesIn > 0) {
    console.log(
      `Approx. output ${(stats.bytesOut / 1024 / 1024).toFixed(1)} MB vs ${(stats.bytesIn / 1024 / 1024).toFixed(1)} MB sources processed (~${pct}% smaller for those files).`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

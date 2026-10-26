// Скачивает фотографии товаров по манифесту scripts/image-sources.json,
// приводит к квадрату 800x800 webp на белом фоне и пишет public/products/sources.json.
//
//   node scripts/fetch-images.mjs [--only slug1,slug2] [--raw-dir <dir>]
//
// Сырые файлы складываются отдельно (по умолчанию .cache/raw-images) и в репозиторий не попадают.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "scripts/image-sources.json");
const OUT_DIR = path.join(ROOT, "public/products");
const SOURCES = path.join(OUT_DIR, "sources.json");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const rawDir = args.includes("--raw-dir")
  ? args[args.indexOf("--raw-dir") + 1]
  : path.join(ROOT, ".cache/raw-images");

const SIZE = 800;
const PAD = 56; // поля вокруг флакона
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function download(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024) throw new Error(`too small (${buf.length} B)`);
  if (/text\/html/i.test(type) || /^\s*<(!doctype|html)/i.test(buf.subarray(0, 64).toString("latin1"))) {
    throw new Error("HTML page instead of image");
  }
  return { buf, type };
}

async function toSquareWebp(raw) {
  const base = sharp(raw, { failOn: "none", animated: false }).rotate();
  const meta = await base.metadata();
  const flat = await sharp(raw, { failOn: "none" })
    .rotate()
    .flatten({ background: "#ffffff" })
    .toBuffer();
  let trimmed = flat;
  try {
    // Обрезаем однотонные поля исходника, чтобы флакон у всех был вписан одинаково.
    const t = await sharp(flat).trim({ threshold: 14 }).toBuffer();
    const tm = await sharp(t).metadata();
    if (tm.width >= 120 && tm.height >= 120) trimmed = t;
  } catch {
    // trim падает на картинках без полей, оставляем как есть
  }
  const inner = SIZE - PAD * 2;
  const out = await sharp(trimmed)
    .resize(inner, inner, { fit: "contain", background: "#ffffff", withoutEnlargement: false })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: "#ffffff" })
    .webp({ quality: 88 })
    .toBuffer();
  return { out, sourceWidth: meta.width ?? 0, sourceHeight: meta.height ?? 0, sourceFormat: meta.format ?? "" };
}

async function main() {
  const manifest = await readJson(MANIFEST, []);
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(rawDir, { recursive: true });
  const existing = await readJson(SOURCES, []);
  const bySlug = new Map(existing.map((s) => [s.slug, s]));

  const failures = [];
  for (const entry of manifest) {
    if (only && !only.includes(entry.slug)) continue;
    const dest = path.join(OUT_DIR, `${entry.slug}.webp`);
    try {
      const { buf, type } = await download(entry.url);
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("avif") ? "avif" : "jpg";
      await fs.writeFile(path.join(rawDir, `${entry.slug}.${ext}`), buf);
      const { out, sourceWidth, sourceHeight, sourceFormat } = await toSquareWebp(buf);
      await fs.writeFile(dest, out);
      bySlug.set(entry.slug, {
        slug: entry.slug,
        url: entry.url,
        type: entry.type,
        page: entry.page ?? undefined,
        sourceWidth,
        sourceHeight,
        sourceFormat,
        fetchedAt: new Date().toISOString().slice(0, 10),
      });
      console.log(`ok    ${entry.slug}  ${sourceWidth}x${sourceHeight} ${sourceFormat}`);
    } catch (err) {
      failures.push({ slug: entry.slug, url: entry.url, reason: err.message });
      console.log(`FAIL  ${entry.slug}  ${err.message}`);
    }
  }

  const sorted = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  await fs.writeFile(SOURCES, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\nsources.json: ${sorted.length} entries, failures: ${failures.length}`);
  for (const f of failures) console.log(`  ${f.slug}: ${f.reason}  ${f.url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Генерирует заглушки для позиций без чистой фотографии:
// плитка 800x800 в фирменных цветах, название бренда капителью золотом на тёмно-зелёном.
//
//   node scripts/make-placeholders.mjs            # для всех товаров без файла в public/products
//   node scripts/make-placeholders.mjs slug1 slug2 # принудительно для указанных
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/products");
const SOURCES = path.join(OUT_DIR, "sources.json");
const PRODUCTS_TS = path.join(ROOT, "src/data/products.ts");

const EMERALD = "#0B2A21";
const EMERALD_700 = "#114C3A";
const GOLD = "#C9A227";

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function placeholderSvg(brand) {
  const text = escapeXml(brand.toUpperCase());
  const fontSize = brand.length > 12 ? 54 : 68;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="${EMERALD}"/>
  <rect x="40" y="40" width="720" height="720" fill="none" stroke="${GOLD}" stroke-width="2" rx="12"/>
  <circle cx="400" cy="400" r="190" fill="${EMERALD_700}"/>
  <circle cx="400" cy="400" r="190" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  <path d="M352 318 L368 290 L384 314 L400 282 L416 314 L432 290 L448 318 Z" fill="${GOLD}"/>
  <text x="400" y="430" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="600" letter-spacing="8" fill="${GOLD}">${text}</text>
  <text x="400" y="520" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" letter-spacing="6" fill="${GOLD}" opacity="0.8">ZÜMRÜD PARFUM</text>
</svg>`;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function productsFromTs() {
  const src = await fs.readFile(PRODUCTS_TS, "utf8");
  const out = [];
  const re = /slug:\s*"([^"]+)",\s*brand:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) out.push({ slug: m[1], brand: m[2] });
  return out;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const forced = process.argv.slice(2);
  const products = await productsFromTs();
  await fs.mkdir(OUT_DIR, { recursive: true });
  const sources = await readJson(SOURCES, []);
  const bySlug = new Map(sources.map((s) => [s.slug, s]));

  let made = 0;
  for (const p of products) {
    const dest = path.join(OUT_DIR, `${p.slug}.webp`);
    const need = forced.length ? forced.includes(p.slug) : !(await exists(dest));
    if (!need) continue;
    const svg = Buffer.from(placeholderSvg(p.brand));
    const out = await sharp(svg, { density: 96 }).resize(800, 800).webp({ quality: 90 }).toBuffer();
    await fs.writeFile(dest, out);
    bySlug.set(p.slug, { slug: p.slug, url: "", type: "placeholder", generatedAt: new Date().toISOString().slice(0, 10) });
    made++;
    console.log(`placeholder  ${p.slug}`);
  }
  const sorted = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  await fs.writeFile(SOURCES, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\n${made} placeholder(s) written, sources.json: ${sorted.length} entries`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

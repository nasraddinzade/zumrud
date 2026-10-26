// Проверяет фотографии товаров в public/products скриптом, а не глазами.
//
//   node scripts/check-images.mjs
//
// Для каждого товара из src/data/products.ts:
//   - файл существует и открывается как изображение (sharp)
//   - размер ровно 800x800, формат webp
//   - вес больше 5 КБ
//   - это не HTML-страница ошибки, не логотип сайта и не баннер:
//       пропорции исходника до ресайза (из sources.json) в разумных пределах,
//       картинка не сплошная заливка, в кадре есть тёмный объект на светлом фоне
//   - для заглушек: тёмно-зелёная плитка с золотым текстом
// Выводит таблицу slug, ok/fail, причина. Код выхода 1, если есть хоть один fail.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/products");
const SOURCES = path.join(OUT_DIR, "sources.json");
const PRODUCTS_TS = path.join(ROOT, "src/data/products.ts");

const SIZE = 800;
const MIN_BYTES = 5 * 1024;

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function slugsFromTs() {
  const src = await fs.readFile(PRODUCTS_TS, "utf8");
  return [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function analyze(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const n = width * height;

  let sumL = 0;
  let sumL2 = 0;
  let dark = 0; // тёмные или насыщенные пиксели: объект
  let light = 0; // почти белый фон
  let gold = 0;
  let greenish = 0;
  const hist = new Map(); // квантованные цвета для оценки доминирующей заливки

  for (let i = 0; i < n; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const L = lum(r, g, b);
    sumL += L;
    sumL2 += L * L;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    // объект: всё, что заметно отличается от белого фона (тёмное, среднее по яркости или окрашенное)
    if (L < 225 || sat > 0.12) dark++;
    if (L > 235 && sat < 0.08) light++;
    // золото ~ #C9A227: r>g>b, тёплый
    if (r > 150 && g > 110 && b < 110 && r - b > 80) gold++;
    // тёмно-зелёный ~ #0B2A21
    if (g >= r && g >= b && L < 80) greenish++;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    hist.set(key, (hist.get(key) ?? 0) + 1);
  }
  const mean = sumL / n;
  const std = Math.sqrt(Math.max(0, sumL2 / n - mean * mean));
  const dominant = Math.max(...hist.values()) / n;
  return {
    mean,
    std,
    darkFrac: dark / n,
    lightFrac: light / n,
    goldFrac: gold / n,
    greenFrac: greenish / n,
    dominant,
  };
}

async function check(slug, source) {
  const file = path.join(OUT_DIR, `${slug}.webp`);
  let stat;
  try {
    stat = await fs.stat(file);
  } catch {
    return { ok: false, reason: "файл отсутствует" };
  }
  if (stat.size <= MIN_BYTES) return { ok: false, reason: `вес ${stat.size} B, меньше 5 КБ` };

  const head = (await fs.readFile(file)).subarray(0, 64).toString("latin1");
  if (/^\s*<(!doctype|html)/i.test(head)) return { ok: false, reason: "HTML вместо изображения" };

  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch (e) {
    return { ok: false, reason: `не открывается как изображение: ${e.message}` };
  }
  if (meta.format !== "webp") return { ok: false, reason: `формат ${meta.format}, нужен webp` };
  if (meta.width !== SIZE || meta.height !== SIZE)
    return { ok: false, reason: `размер ${meta.width}x${meta.height}, нужен 800x800` };

  const a = await analyze(file);
  const isPlaceholder = source?.type === "placeholder";

  if (isPlaceholder) {
    if (a.greenFrac < 0.6) return { ok: false, reason: `заглушка: мало тёмно-зелёного (${pct(a.greenFrac)})` };
    if (a.goldFrac < 0.004) return { ok: false, reason: `заглушка: нет золотого текста (${pct(a.goldFrac)})` };
    return { ok: true, reason: `заглушка, бренд золотом (${pct(a.goldFrac)})` };
  }

  // Пропорции исходника до ресайза: баннеры и шапки сайтов вытянутые.
  if (source?.sourceWidth && source?.sourceHeight) {
    const ratio = source.sourceWidth / source.sourceHeight;
    // Вытянутые по горизонтали исходники это баннеры и шапки; вертикальные фото флакона допустимы.
    if (ratio > 2.2 || ratio < 0.3)
      return { ok: false, reason: `исходник ${source.sourceWidth}x${source.sourceHeight}, похоже на баннер` };
    if (source.sourceWidth < 300 || source.sourceHeight < 300)
      return { ok: false, reason: `исходник ${source.sourceWidth}x${source.sourceHeight}, слишком маленький (логотип?)` };
  } else {
    return { ok: false, reason: "нет записи об исходнике в sources.json" };
  }

  if (a.dominant > 0.985 || a.std < 6) return { ok: false, reason: `сплошная заливка (${pct(a.dominant)} одного цвета)` };
  if (a.darkFrac < 0.02) return { ok: false, reason: `нет объекта в кадре (${pct(a.darkFrac)})` };
  // Белый или прозрачный фон: не меньше трети кадра почти белая.
  if (a.lightFrac < 0.3)
    return { ok: false, reason: `тёмный или цветной фон (белого ${pct(a.lightFrac)}, яркость ${a.mean.toFixed(0)}), похоже на рекламный рендер` };

  return {
    ok: true,
    reason: `${source.type}, исходник ${source.sourceWidth}x${source.sourceHeight}, объект ${pct(a.darkFrac)}, фон ${pct(a.lightFrac)}`,
  };
}

function pct(x) {
  return `${(x * 100).toFixed(1)}%`;
}

async function main() {
  const slugs = await slugsFromTs();
  const sources = new Map((await readJson(SOURCES, [])).map((s) => [s.slug, s]));
  const rows = [];
  for (const slug of slugs) {
    const r = await check(slug, sources.get(slug));
    rows.push({ slug, ...r });
  }
  const w = Math.max(...rows.map((r) => r.slug.length));
  console.log(`${"slug".padEnd(w)}  status  причина`);
  console.log("-".repeat(w + 60));
  for (const r of rows) console.log(`${r.slug.padEnd(w)}  ${r.ok ? "ok  " : "FAIL"}    ${r.reason}`);
  const fails = rows.filter((r) => !r.ok).length;
  const placeholders = rows.filter((r) => r.ok && sources.get(r.slug)?.type === "placeholder").length;
  console.log("-".repeat(w + 60));
  console.log(`всего ${rows.length}, ok ${rows.length - fails}, fail ${fails}, заглушек ${placeholders}`);
  process.exit(fails ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

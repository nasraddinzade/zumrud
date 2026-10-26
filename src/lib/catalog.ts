import { products } from "@/data/products";
import type { Gender, Product } from "@/data/types";

export const VOLUMES = [30, 45, 50, 75, 80, 85, 100, 150] as const;
export const GENDERS: Gender[] = ["kisi", "qadin", "uniseks"];
export const SORTS = ["popular", "price-asc", "price-desc", "name"] as const;
export type Sort = (typeof SORTS)[number];

export const BRANDS: string[] = Array.from(new Set(products.map((p) => p.brand)));

export const PRICE_RANGE = products.reduce(
  (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
  { min: Infinity, max: -Infinity },
);

export type Filters = {
  q: string;
  brands: string[];
  volumes: number[];
  genders: Gender[];
  min: number;
  max: number;
  sort: Sort;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  brands: [],
  volumes: [],
  genders: [],
  min: PRICE_RANGE.min,
  max: PRICE_RANGE.max,
  sort: "popular",
};

function isGender(v: string): v is Gender {
  return (GENDERS as string[]).includes(v);
}
function isSort(v: string): v is Sort {
  return (SORTS as readonly string[]).includes(v);
}

export function parseFilters(sp: URLSearchParams): Filters {
  const list = (key: string) =>
    (sp.get(key) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const num = (key: string, fallback: number) => {
    const n = Number(sp.get(key));
    return sp.has(key) && Number.isFinite(n) ? n : fallback;
  };
  const min = Math.max(PRICE_RANGE.min, num("min", PRICE_RANGE.min));
  const max = Math.min(PRICE_RANGE.max, num("max", PRICE_RANGE.max));
  const sortRaw = sp.get("sort") ?? "popular";
  return {
    q: (sp.get("q") ?? "").trim(),
    brands: list("brand").filter((b) => BRANDS.includes(b)),
    volumes: list("vol")
      .map(Number)
      .filter((v) => (VOLUMES as readonly number[]).includes(v)),
    genders: list("gender").filter(isGender),
    min: Math.min(min, max),
    max: Math.max(min, max),
    sort: isSort(sortRaw) ? sortRaw : "popular",
  };
}

export function filtersToSearchParams(f: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.brands.length) sp.set("brand", f.brands.join(","));
  if (f.volumes.length) sp.set("vol", f.volumes.join(","));
  if (f.genders.length) sp.set("gender", f.genders.join(","));
  if (f.min > PRICE_RANGE.min) sp.set("min", String(f.min));
  if (f.max < PRICE_RANGE.max) sp.set("max", String(f.max));
  if (f.sort !== "popular") sp.set("sort", f.sort);
  return sp;
}

export function countActiveFilters(f: Filters): number {
  let n = 0;
  if (f.brands.length) n++;
  if (f.volumes.length) n++;
  if (f.genders.length) n++;
  if (f.min > PRICE_RANGE.min || f.max < PRICE_RANGE.max) n++;
  return n;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ə/g, "e")
    .replace(/ı/g, "i");
}

export function matchesQuery(p: Product, q: string): boolean {
  if (!q) return true;
  const hay = normalize(`${p.brand} ${p.name} ${p.concentration}`);
  return normalize(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => hay.includes(token));
}

export function applyFilters(f: Filters): Product[] {
  const list = products.filter(
    (p) =>
      matchesQuery(p, f.q) &&
      (f.brands.length === 0 || f.brands.includes(p.brand)) &&
      (f.volumes.length === 0 || f.volumes.includes(p.volumeMl)) &&
      (f.genders.length === 0 || f.genders.includes(p.gender)) &&
      p.price >= f.min &&
      p.price <= f.max,
  );
  switch (f.sort) {
    case "price-asc":
      return [...list].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...list].sort((a, b) => b.price - a.price);
    case "name":
      return [...list].sort((a, b) =>
        `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, "en"),
      );
    default:
      return list;
  }
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

// Похожие: тот же бренд, затем тот же пол с близкой ценой.
export function getSimilar(p: Product, n = 4): Product[] {
  const sameBrand = products.filter((x) => x.slug !== p.slug && x.brand === p.brand);
  const sameGender = products
    .filter((x) => x.slug !== p.slug && x.brand !== p.brand && x.gender === p.gender)
    .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price));
  const others = products
    .filter((x) => x.slug !== p.slug && x.brand !== p.brand && x.gender !== p.gender)
    .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price));
  return [...sameBrand, ...sameGender, ...others].slice(0, n);
}

export const collections = {
  newArrivals: () => products.slice(0, 8),
  men: () => products.filter((p) => p.gender === "kisi").slice(0, 8),
  women: () => products.filter((p) => p.gender === "qadin").slice(0, 8),
  unisex: () => products.filter((p) => p.gender === "uniseks").slice(0, 8),
  under50: () => products.filter((p) => p.price <= 50).slice(0, 8),
};

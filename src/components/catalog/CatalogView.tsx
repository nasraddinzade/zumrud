"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRICE_RANGE,
  SORTS,
  applyFilters,
  countActiveFilters,
  filtersToSearchParams,
  parseFilters,
  type Filters,
  type Sort,
} from "@/lib/catalog";
import { useI18n } from "@/components/providers/LanguageProvider";
import { ProductCard } from "@/components/ProductCard";
import { CloseIcon, FilterIcon, SearchIcon } from "@/components/Icons";
import { FilterPanel } from "./FilterPanel";
import { notifySearchChanged } from "@/lib/searchEvent";
import { pluralKey } from "@/lib/plural";

export function CatalogView() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  useEffect(() => {
    notifySearchChanged();
  }, [filters.q]);
  const results = useMemo(() => applyFilters(filters), [filters]);
  const activeCount = countActiveFilters(filters);

  const update = useCallback(
    (patch: Partial<Filters>) => {
      const next: Filters = { ...filters, ...patch };
      const qs = filtersToSearchParams(next).toString();
      router.replace(qs ? `/catalog?${qs}` : "/catalog", { scroll: false });
    },
    [filters, router],
  );

  const clearFilters = () =>
    update({ brands: [], volumes: [], genders: [], min: PRICE_RANGE.min, max: PRICE_RANGE.max });

  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const sortLabel: Record<Sort, string> = {
    popular: t.catalog.sortPopular,
    "price-asc": t.catalog.sortPriceAsc,
    "price-desc": t.catalog.sortPriceDesc,
    name: t.catalog.sortName,
  };

  const title = filters.q ? `${t.catalog.searchResults}: «${filters.q}»` : t.catalog.title;
  const foundLabel = `${results.length} ${t.catalog[pluralKey(results.length, lang)]}`;

  return (
    <div className="container-x py-6 sm:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 sm:text-3xl">{title}</h1>
        <p className="text-sm text-ink-500" aria-live="polite">
          {foundLabel}
        </p>
      </div>

      {filters.q ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => update({ q: "" })}
            className="inline-flex items-center gap-1 rounded-full border border-ink-500/30 bg-white px-3 py-1 text-xs text-ink-900 hover:border-gold-500"
          >
            <SearchIcon size={12} />
            {filters.q}
            <CloseIcon size={12} />
          </button>
        </div>
      ) : null}

      <div className="mt-6 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        {/* Десктоп: фильтры слева */}
        <aside className="hidden lg:block">
          <div className="sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto pr-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-emerald-900">
                {t.catalog.filters}
                {activeCount ? (
                  <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                    {activeCount}
                  </span>
                ) : null}
              </h2>
              {activeCount ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-emerald-700 underline-offset-2 hover:underline"
                >
                  {t.catalog.clear}
                </button>
              ) : null}
            </div>
            <FilterPanel filters={filters} onChange={update} idPrefix="d" />
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="btn-outline min-h-10 bg-white px-4 lg:hidden"
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
            >
              <FilterIcon size={18} />
              {t.catalog.filters}
              {activeCount ? (
                <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                  {activeCount}
                </span>
              ) : null}
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm text-ink-500">
              <span className="hidden sm:inline">{t.catalog.sort}</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as Sort })}
                aria-label={t.catalog.sort}
                className="input min-h-10 w-auto max-w-[200px] py-2 text-sm"
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>
                    {sortLabel[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="card mt-6 px-6 py-14 text-center">
              <h2 className="font-serif text-xl font-semibold text-emerald-900">{t.catalog.empty}</h2>
              <p className="mt-2 text-sm text-ink-500">{t.catalog.emptyHint}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {activeCount || filters.q ? (
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        q: "",
                        brands: [],
                        volumes: [],
                        genders: [],
                        min: PRICE_RANGE.min,
                        max: PRICE_RANGE.max,
                      })
                    }
                    className="btn-gold"
                  >
                    {t.catalog.clear}
                  </button>
                ) : null}
                <Link href="/" className="btn-outline">
                  {t.nav.home}
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {results.map((p, i) => (
                <li key={p.slug}>
                  <ProductCard product={p} priority={i < 4} className="h-full" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Мобильная нижняя шторка с фильтрами */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.catalog.filters}>
          <button
            type="button"
            aria-label={t.catalog.close}
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-emerald-900/50"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-2xl bg-cream-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink-500/10 px-4 py-3">
              <h2 className="font-serif text-lg font-semibold text-emerald-900">
                {t.catalog.filters}
                {activeCount ? (
                  <span className="ml-2 text-sm font-normal text-ink-500">
                    {activeCount} {t.catalog.activeFilters}
                  </span>
                ) : null}
              </h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label={t.catalog.close}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <FilterPanel filters={filters} onChange={update} idPrefix="m" />
            </div>
            <div className="flex gap-3 border-t border-ink-500/10 bg-cream-50 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={clearFilters} className="btn-outline flex-1 bg-white">
                {t.catalog.clear}
              </button>
              <button type="button" onClick={() => setSheetOpen(false)} className="btn-gold flex-[2]">
                {t.catalog.showResults} ({results.length})
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

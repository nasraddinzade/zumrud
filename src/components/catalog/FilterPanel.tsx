"use client";

import type { Gender } from "@/data/types";
import { BRANDS, GENDERS, VOLUMES, type Filters } from "@/lib/catalog";
import { useI18n } from "@/components/providers/LanguageProvider";
import { PriceRange } from "./PriceRange";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-9 rounded-full border px-3.5 text-sm transition-colors ${
        active
          ? "border-gold-500 bg-gold-500 text-emerald-900"
          : "border-ink-500/30 bg-white text-ink-900 hover:border-gold-500"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterPanel({
  filters,
  onChange,
  idPrefix = "f",
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  idPrefix?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="label-caps mb-3">{t.catalog.brand}</legend>
        <ul className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-1">
          {BRANDS.map((brand) => {
            const id = `${idPrefix}-brand-${brand.replace(/\s+/g, "-")}`;
            const checked = filters.brands.includes(brand);
            return (
              <li key={brand}>
                <label
                  htmlFor={id}
                  className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm text-ink-900"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange({ brands: toggle(filters.brands, brand) })}
                    className="h-4.5 w-4.5 h-[18px] w-[18px] rounded border-ink-500/40 accent-gold-500"
                  />
                  {brand}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="label-caps mb-3">{t.catalog.volume}</legend>
        <div className="flex flex-wrap gap-2">
          {VOLUMES.map((v) => (
            <Chip
              key={v}
              active={filters.volumes.includes(v)}
              onClick={() => onChange({ volumes: toggle(filters.volumes, v) })}
            >
              {v}&nbsp;ml
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label-caps mb-3">{t.catalog.gender}</legend>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g: Gender) => (
            <Chip
              key={g}
              active={filters.genders.includes(g)}
              onClick={() => onChange({ genders: toggle(filters.genders, g) })}
            >
              {t.gender[g]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label-caps mb-3">{t.catalog.price}</legend>
        <PriceRange
          min={filters.min}
          max={filters.max}
          onCommit={(min, max) => onChange({ min, max })}
        />
      </fieldset>
    </div>
  );
}

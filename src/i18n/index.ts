import { az } from "./az";
import { ru } from "./ru";
import type { Dict, Lang } from "./types";

export type { Dict, Lang };

export const LANGS: Lang[] = ["az", "ru"];
export const DEFAULT_LANG: Lang = "az";
export const LANG_STORAGE_KEY = "zumrud-lang";

export const dictionaries: Record<Lang, Dict> = { az, ru };

export function isLang(value: unknown): value is Lang {
  return value === "az" || value === "ru";
}

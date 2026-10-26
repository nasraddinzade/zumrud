import type { az } from "./az";

// Рекурсивно превращает литеральные строки словаря az в string,
// чтобы ru мог содержать свои тексты при той же структуре ключей.
type Widen<T> = T extends string
  ? string
  : { readonly [K in keyof T]: Widen<T[K]> };

export type Dict = Widen<typeof az>;
export type Lang = "az" | "ru";

import type { Lang } from "@/i18n";

// Ключ формы множественного числа для счётчика товаров.
// Азербайджанский форм не различает, русский: 1 товар, 2-4 товара, 5+ товаров.
export function pluralKey(n: number, lang: Lang): "foundOne" | "foundFew" | "foundMany" {
  if (lang === "az") return "foundMany";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "foundOne";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "foundFew";
  return "foundMany";
}

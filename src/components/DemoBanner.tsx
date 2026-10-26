"use client";

import { SHOW_DEMO_BANNER } from "@/config";
import { useI18n } from "@/components/providers/LanguageProvider";

// Плашка демо. Рендерится в корневом layout над шапкой, внутри sticky-обёртки,
// поэтому едет вместе с шапкой и не перекрывает контент.
export function DemoBanner() {
  const { t } = useI18n();
  if (!SHOW_DEMO_BANNER) return null;
  return (
    <div
      role="status"
      className="bg-gold-500 px-4 py-1.5 text-center text-xs font-medium leading-snug text-emerald-900 sm:text-sm"
    >
      {t.demoBanner}
    </div>
  );
}

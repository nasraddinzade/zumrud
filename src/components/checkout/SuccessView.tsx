"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/components/providers/LanguageProvider";
import { CheckIcon } from "@/components/Icons";

export function SuccessView() {
  const { t } = useI18n();
  const sp = useSearchParams();
  const order = sp.get("order");
  const total = Number(sp.get("total"));
  const valid = order && /^ZP-\d{6}$/.test(order) && Number.isFinite(total);

  return (
    <div className="container-x py-10 sm:py-16">
      <div className="card mx-auto max-w-lg px-6 py-10 text-center sm:px-10">
        {valid ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-cream-50">
              <CheckIcon size={28} />
            </div>
            <h1 className="mt-5 label-caps">{t.success.title}</h1>
            <p className="mt-2 font-serif text-4xl font-semibold tracking-wide text-emerald-900">{order}</p>
            <p className="mt-5 text-sm text-ink-500">{t.success.amount}</p>
            <p className="font-serif text-2xl font-semibold text-gold-500">{formatPrice(total)}</p>
            <p className="mt-6 rounded border border-gold-500/40 bg-gold-300/10 px-4 py-3 text-sm leading-relaxed text-ink-900">
              {t.success.demoText}
            </p>
          </>
        ) : (
          <p className="text-ink-500">{t.success.missing}</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/catalog" className="btn-gold">
            {t.success.toCatalog}
          </Link>
          <Link href="/" className="btn-outline">
            {t.success.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

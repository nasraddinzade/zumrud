"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatVolume } from "@/lib/format";
import { useI18n } from "@/components/providers/LanguageProvider";
import { useCart } from "@/components/providers/CartProvider";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/Icons";

export function CartView() {
  const { t } = useI18n();
  const { lines, count, total, hydrated, setQty, remove } = useCart();

  if (!hydrated) {
    return (
      <div className="container-x py-10">
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 sm:text-3xl">{t.cart.title}</h1>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-10 sm:py-16">
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 sm:text-3xl">{t.cart.title}</h1>
        <div className="card mt-6 px-6 py-14 text-center">
          <p className="font-serif text-xl text-emerald-900">{t.cart.empty}</p>
          <p className="mt-2 text-sm text-ink-500">{t.cart.emptyHint}</p>
          <Link href="/catalog" className="btn-gold mt-6">
            {t.cart.toCatalog}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-6 sm:py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 sm:text-3xl">{t.cart.title}</h1>
        <span className="text-sm text-ink-500">
          {count} {t.cart.items}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <ul className="space-y-3">
          {lines.map(({ product, qty }) => (
            <li key={product.slug} className="card flex gap-3 p-3 sm:gap-4 sm:p-4">
              <Link
                href={`/product/${product.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded border border-cream-50 bg-white sm:h-28 sm:w-28"
              >
                <Image
                  src={product.image}
                  alt={`${product.brand} ${product.name}`}
                  fill
                  sizes="112px"
                  className="object-contain p-1.5"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="label-caps truncate">{product.brand}</div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-0.5 block truncate text-sm font-medium text-ink-900 hover:text-emerald-700"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-0.5 text-xs text-ink-500">
                      {formatVolume(product.volumeMl)} · {formatPrice(product.price)} / {t.cart.perItem}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(product.slug)}
                    aria-label={`${t.cart.remove}: ${product.brand} ${product.name}`}
                    className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-cream-50 hover:text-emerald-900"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div
                    className="flex items-center rounded-full border border-ink-500/25 bg-white"
                    role="group"
                    aria-label={t.cart.qty}
                  >
                    <button
                      type="button"
                      onClick={() => setQty(product.slug, qty - 1)}
                      aria-label={t.cart.decrease}
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-50"
                    >
                      <MinusIcon size={16} />
                    </button>
                    <span className="min-w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(product.slug, qty + 1)}
                      aria-label={t.cart.increase}
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-50"
                    >
                      <PlusIcon size={16} />
                    </button>
                  </div>
                  <span className="font-serif text-lg font-semibold text-gold-500">
                    {formatPrice(product.price * qty)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card p-5 lg:sticky lg:top-40">
          <div className="flex items-baseline justify-between text-sm text-ink-500">
            <span>
              {t.cart.subtotal} ({count})
            </span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-ink-500/10 pt-3">
            <span className="font-medium text-ink-900">{t.cart.total}</span>
            <span className="font-serif text-2xl font-semibold text-gold-500">{formatPrice(total)}</span>
          </div>
          <Link href="/checkout" className="btn-gold mt-5 w-full min-h-12 text-base">
            {t.cart.checkout}
          </Link>
          <Link href="/catalog" className="btn-ghost mt-2 w-full text-sm">
            {t.cart.continue}
          </Link>
        </aside>
      </div>
    </div>
  );
}

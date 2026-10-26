"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/types";
import { getProduct, getSimilar } from "@/lib/catalog";
import { formatPrice, formatVolume } from "@/lib/format";
import { useI18n } from "@/components/providers/LanguageProvider";
import { useCart } from "@/components/providers/CartProvider";
import { ProductCard } from "@/components/ProductCard";
import { CartIcon, CheckIcon, ChevronRight } from "@/components/Icons";

// Галерея готова к нескольким изображениям: пока у товара одно.
function Gallery({ product }: { product: Product }) {
  const { t } = useI18n();
  const images = [product.image];
  const [active, setActive] = useState(0);
  const alt = `${product.brand} ${product.name}`;
  return (
    <div>
      <div className="card relative aspect-square w-full overflow-hidden">
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain p-6"
        />
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 flex gap-2" aria-label={t.product.gallery}>
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${t.product.image} ${i + 1}`}
                aria-current={i === active}
                className={`relative h-16 w-16 overflow-hidden rounded border bg-white ${
                  i === active ? "border-gold-500" : "border-transparent"
                }`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AddToCart({ product }: { product: Product }) {
  const { t } = useI18n();
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.slug === product.slug)?.qty ?? 0;

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            add(product.slug, 1);
            setAdded(true);
          }}
          className="btn-gold min-h-12 flex-1 text-base"
        >
          <CartIcon size={20} />
          {t.product.addToCart}
        </button>
        {added ? (
          <Link href="/cart" className="btn-outline min-h-12 flex-1 bg-white text-base">
            {t.product.goToCart}
            <ChevronRight size={18} />
          </Link>
        ) : null}
      </div>
      <p
        className={`mt-3 flex min-h-5 items-center gap-1.5 text-sm text-emerald-700 ${added ? "" : "invisible"}`}
        role="status"
        aria-live="polite"
      >
        <CheckIcon size={16} />
        {t.product.added}
        {inCart ? ` (${t.product.inCart}: ${inCart})` : ""}
      </p>
    </div>
  );
}

function Notes({ product }: { product: Product }) {
  const { t } = useI18n();
  const n = product.notes;
  if (!n || (!n.top.length && !n.heart.length && !n.base.length)) return null;
  const groups: { label: string; items: string[] }[] = [
    { label: t.product.top, items: n.top },
    { label: t.product.heart, items: n.heart },
    { label: t.product.base, items: n.base },
  ].filter((g) => g.items.length > 0);
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold text-emerald-900">{t.product.notesTitle}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {groups.map((g) => (
          <div key={g.label} className="card p-4">
            <h3 className="label-caps font-sans">{g.label}</h3>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-gold-500/40 bg-cream-50 px-2.5 py-1 text-xs text-ink-900"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductView({ slug }: { slug: string }) {
  const { t, lang } = useI18n();
  const product = getProduct(slug);
  if (!product) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-serif text-2xl text-emerald-900">{t.product.notFound}</h1>
        <Link href="/catalog" className="btn-gold mt-6">
          {t.product.backToCatalog}
        </Link>
      </div>
    );
  }
  const similar = getSimilar(product, 4);
  const description = product.description?.[lang];

  return (
    <div className="container-x py-6 sm:py-10">
      <nav aria-label="breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-ink-500">
        <Link href="/" className="hover:text-emerald-900">
          {t.nav.home}
        </Link>
        <ChevronRight size={12} />
        <Link href="/catalog" className="hover:text-emerald-900">
          {t.nav.catalog}
        </Link>
        <ChevronRight size={12} />
        <span className="truncate text-ink-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <Gallery product={product} />

        <div>
          <Link
            href={`/catalog?brand=${encodeURIComponent(product.brand)}`}
            className="label-caps inline-flex items-center gap-1 text-emerald-700 hover:text-gold-500"
            title={t.product.brandLink}
          >
            {product.brand}
            <ChevronRight size={12} />
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-emerald-900 sm:text-4xl">
            {product.name}
          </h1>

          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded border border-ink-500/15 bg-white px-3 py-2">
              <dt className="label-caps text-[10px]">{t.product.volume}</dt>
              <dd className="mt-0.5 text-ink-900">{formatVolume(product.volumeMl)}</dd>
            </div>
            <div className="rounded border border-ink-500/15 bg-white px-3 py-2">
              <dt className="label-caps text-[10px]">{t.product.concentration}</dt>
              <dd className="mt-0.5 text-ink-900">{t.concentration[product.concentration]}</dd>
            </div>
            <div className="rounded border border-ink-500/15 bg-white px-3 py-2">
              <dt className="label-caps text-[10px]">{t.product.gender}</dt>
              <dd className="mt-0.5 text-ink-900">{t.gender[product.gender]}</dd>
            </div>
          </dl>

          <p className="mt-6 font-serif text-4xl font-semibold text-gold-500">
            {formatPrice(product.price)}
          </p>

          <AddToCart product={product} />

          {description ? (
            <section className="mt-8">
              <h2 className="label-caps">{t.product.description}</h2>
              <p className="mt-2 text-base leading-relaxed text-ink-900">{description}</p>
            </section>
          ) : null}
        </div>
      </div>

      <Notes product={product} />

      {similar.length ? (
        <section className="mt-12">
          <h2 className="font-serif text-xl font-semibold text-emerald-900">{t.product.similar}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {similar.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

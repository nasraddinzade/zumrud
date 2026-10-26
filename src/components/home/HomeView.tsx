"use client";

import Link from "next/link";
import { STORE } from "@/config";
import type { Product } from "@/data/types";
import { BRANDS, collections } from "@/lib/catalog";
import { useI18n } from "@/components/providers/LanguageProvider";
import { ProductCard } from "@/components/ProductCard";
import { LogoMark } from "@/components/Logo";
import { ChevronRight, ClockIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";

function Hero() {
  const { t } = useI18n();
  return (
    <section className="bg-emerald-900 text-cream-50">
      <div className="container-x relative overflow-hidden py-14 sm:py-20">
        <div className="pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 opacity-[0.07] sm:block">
          <LogoMark size={360} />
        </div>
        <p className="label-caps text-gold-300">{t.hero.eyebrow}</p>
        <h1 className="mt-3 max-w-xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">
          {t.hero.title}
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream-50/80 sm:text-base">
          {t.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/catalog" className="btn-gold">
            {t.hero.cta}
          </Link>
          <a href="#stores" className="btn border border-cream-50/30 text-cream-50 hover:bg-emerald-700">
            {t.hero.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}

function ProductRow({
  title,
  href,
  items,
  priority = false,
}: {
  title: string;
  href: string;
  items: Product[];
  priority?: boolean;
}) {
  const { t } = useI18n();
  if (items.length === 0) return null;
  return (
    <section className="mt-10 sm:mt-14">
      <div className="container-x flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-emerald-900 sm:text-2xl">{title}</h2>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 hover:text-gold-500"
        >
          {t.collections.viewAll}
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:px-6 lg:mx-auto lg:max-w-6xl">
        {items.map((p, i) => (
          <ProductCard
            key={p.slug}
            product={p}
            priority={priority && i < 2}
            className="w-[44vw] min-w-[160px] max-w-[220px] shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  );
}

function BrandStrip() {
  const { t } = useI18n();
  return (
    <section className="mt-12 sm:mt-16">
      <div className="container-x">
        <h2 className="font-serif text-xl font-semibold text-emerald-900 sm:text-2xl">
          {t.brands.title}
        </h2>
        <p className="mt-1 text-sm text-ink-500">{t.brands.subtitle}</p>
      </div>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:px-6 lg:mx-auto lg:max-w-6xl lg:flex-wrap">
        {BRANDS.map((brand) => (
          <Link
            key={brand}
            href={`/catalog?brand=${encodeURIComponent(brand)}`}
            className="shrink-0 rounded-full border border-gold-500/50 bg-white px-4 py-2 font-serif text-sm text-emerald-900 transition-colors hover:border-gold-500 hover:bg-gold-300/20"
          >
            {brand}
          </Link>
        ))}
      </div>
    </section>
  );
}

function About() {
  const { t } = useI18n();
  return (
    <section id="stores" className="container-x mt-14 scroll-mt-40 sm:mt-20">
      <div className="card grid gap-8 p-6 sm:p-8 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-emerald-900">{t.about.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">{t.about.text}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={STORE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <WhatsAppIcon size={18} />
              {t.about.whatsapp}
            </a>
            <a href={STORE.phoneHref} className="btn-outline">
              <PhoneIcon size={18} />
              {STORE.phone}
            </a>
          </div>
        </div>
        <ul className="space-y-4 text-sm">
          {STORE.stores.map((s, i) => (
            <li key={s.id} className="flex items-start gap-3">
              <PinIcon size={20} className="mt-0.5 shrink-0 text-gold-500" />
              <div>
                <div className="label-caps">{i === 0 ? t.about.store1 : t.about.store2}</div>
                <div className="mt-0.5 text-ink-900">{s.address}</div>
              </div>
            </li>
          ))}
          <li className="flex items-start gap-3">
            <ClockIcon size={20} className="mt-0.5 shrink-0 text-gold-500" />
            <div>
              <div className="label-caps">{t.footer.hours}</div>
              <div className="mt-0.5 text-ink-900">
                {t.about.hours} {STORE.hours}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function HomeView() {
  const { t } = useI18n();
  return (
    <>
      <Hero />
      <ProductRow title={t.collections.new} href="/catalog" items={collections.newArrivals()} priority />
      <ProductRow title={t.collections.men} href="/catalog?gender=kisi" items={collections.men()} />
      <ProductRow title={t.collections.women} href="/catalog?gender=qadin" items={collections.women()} />
      <ProductRow title={t.collections.unisex} href="/catalog?gender=uniseks" items={collections.unisex()} />
      <ProductRow title={t.collections.under50} href="/catalog?max=50" items={collections.under50()} />
      <BrandStrip />
      <About />
    </>
  );
}

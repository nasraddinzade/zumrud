"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { SEARCH_EVENT } from "@/lib/searchEvent";
import { Logo } from "@/components/Logo";
import { CartIcon, SearchIcon } from "@/components/Icons";
import { useI18n } from "@/components/providers/LanguageProvider";
import { useCart } from "@/components/providers/CartProvider";
import type { Lang } from "@/i18n";

function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const options: Lang[] = ["az", "ru"];
  return (
    <div
      role="group"
      aria-label={t.nav.switchLang}
      className="flex overflow-hidden rounded-full border border-gold-500/60 text-xs font-semibold"
    >
      {options.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-w-10 px-2.5 py-1.5 uppercase transition-colors ${
            lang === l ? "bg-gold-500 text-emerald-900" : "text-cream-50 hover:bg-emerald-700"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function CartButton() {
  const { t } = useI18n();
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`${t.nav.openCart}${hydrated && count ? `, ${count}` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-cream-50 transition-colors hover:bg-emerald-700"
    >
      <CartIcon size={22} />
      {hydrated && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-emerald-900">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function SearchForm({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState("");

  // Поле показывает текущий запрос, когда мы в каталоге. Читаем его из адресной строки,
  // а не через useSearchParams, чтобы шапка рендерилась статически без Suspense.
  useEffect(() => {
    const sync = () => {
      const q = new URLSearchParams(window.location.search).get("q") ?? "";
      setValue(pathname === "/catalog" ? q : "");
    };
    sync();
    window.addEventListener(SEARCH_EVENT, sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener(SEARCH_EVENT, sync);
      window.removeEventListener("popstate", sync);
    };
  }, [pathname]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    const sp = new URLSearchParams(pathname === "/catalog" ? window.location.search : "");
    if (q) sp.set("q", q);
    else sp.delete("q");
    const qs = sp.toString();
    router.push(qs ? `/catalog?${qs}` : "/catalog");
  };

  return (
    <form role="search" onSubmit={onSubmit} className={`relative ${className}`}>
      <label htmlFor="site-search" className="sr-only">
        {t.search.label}
      </label>
      <SearchIcon
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
      />
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t.search.placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="h-10 w-full rounded-full border border-transparent bg-white pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-500/80 focus:border-gold-500 focus:outline-none"
      />
      <button type="submit" className="sr-only">
        {t.search.submit}
      </button>
    </form>
  );
}

export function Header() {
  const { t } = useI18n();
  return (
    <header className="bg-emerald-900 text-cream-50">
      <div className="container-x flex h-16 items-center gap-3">
        <Logo name={t.brandName} tagline={t.tagline} inverted />
        <nav aria-label={t.nav.catalog} className="ml-4 hidden items-center gap-5 text-sm md:flex">
          <Link href="/catalog" className="hover:text-gold-300">
            {t.nav.catalog}
          </Link>
        </nav>
        <SearchForm className="mx-auto hidden w-full max-w-md md:block" />
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <LanguageSwitcher />
          <CartButton />
        </div>
      </div>
      <div className="container-x pb-3 md:hidden">
        <SearchForm />
      </div>
    </header>
  );
}

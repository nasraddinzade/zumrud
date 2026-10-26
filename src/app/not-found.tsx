"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/LanguageProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container-x py-24 text-center">
      <h1 className="font-serif text-3xl text-emerald-900">{t.notFound.title}</h1>
      <p className="mt-3 text-ink-500">{t.notFound.text}</p>
      <Link href="/" className="btn-gold mt-8">
        {t.notFound.home}
      </Link>
    </div>
  );
}

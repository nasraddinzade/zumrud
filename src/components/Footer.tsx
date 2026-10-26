"use client";

import { STORE } from "@/config";
import { LogoMark } from "@/components/Logo";
import { ClockIcon, InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";
import { useI18n } from "@/components/providers/LanguageProvider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 bg-emerald-900 text-cream-50">
      <div className="container-x grid gap-10 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={44} />
            <div>
              <div className="font-serif text-xl font-semibold">{t.brandName}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold-500">
                {t.tagline}
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-2 text-sm text-cream-50/85">
            <ClockIcon size={18} className="mt-0.5 shrink-0 text-gold-500" />
            <div>
              <div className="label-caps text-gold-300/80">{t.footer.hours}</div>
              <div>
                {t.footer.everyDay} {STORE.hours}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="label-caps mb-4 text-gold-300/80">{t.footer.addresses}</h2>
          <ul className="space-y-4 text-sm text-cream-50/85">
            {STORE.stores.map((s, i) => (
              <li key={s.id} className="flex items-start gap-2">
                <PinIcon size={18} className="mt-0.5 shrink-0 text-gold-500" />
                <div>
                  <div className="font-medium text-cream-50">
                    {i === 0 ? t.about.store1 : t.about.store2}
                  </div>
                  <div>{s.address}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="label-caps mb-4 text-gold-300/80">{t.footer.contacts}</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={STORE.phoneHref} className="flex items-center gap-2 hover:text-gold-300">
                <PhoneIcon size={18} className="text-gold-500" />
                <span>
                  <span className="sr-only">{t.footer.phone}: </span>
                  {STORE.phone}
                </span>
              </a>
            </li>
            <li>
              <a
                href={STORE.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gold-300"
              >
                <WhatsAppIcon size={18} className="text-gold-500" />
                <span>
                  {t.footer.whatsapp} {STORE.whatsapp}
                </span>
              </a>
            </li>
            <li>
              <a
                href={STORE.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gold-300"
              >
                <InstagramIcon size={18} className="text-gold-500" />
                <span>{STORE.instagram}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-50/10">
        <div className="container-x py-4 text-xs text-cream-50/60">{t.footer.rights}</div>
      </div>
    </footer>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANG,
  LANG_STORAGE_KEY,
  dictionaries,
  isLang,
  type Dict,
  type Lang,
} from "@/i18n";

type LanguageContextValue = {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Внешнее хранилище языка. Во время гидрации React берёт серверный снимок (az),
// поэтому разметка совпадает с сервером, а после гидрации подставляется сохранённый язык.
const listeners = new Set<() => void>();
let current: Lang | null = null;

function readLang(): Lang {
  if (current === null) {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      current = isLang(stored) ? stored : DEFAULT_LANG;
    } catch {
      current = DEFAULT_LANG;
    }
  }
  return current;
}

function serverLang(): Lang {
  return DEFAULT_LANG;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function writeLang(next: Lang) {
  current = next;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch {
    // localStorage недоступен, язык живёт до перезагрузки
  }
  listeners.forEach((cb) => cb());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, serverLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => writeLang(next), []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, t: dictionaries[lang], setLang }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}

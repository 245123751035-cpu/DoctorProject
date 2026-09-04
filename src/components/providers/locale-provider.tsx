"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { translate } from "@/locales";

interface LocaleContextValue {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  lang,
  children
}: {
  lang: string;
  children: ReactNode;
}) {
  const [currentLang, setCurrentLang] = useState<string>(lang || "en");

  const t = useCallback(
    (key: string) => translate(currentLang, key),
    [currentLang]
  );

  const setLang = useCallback((newLang: string) => {
    setCurrentLang(newLang);
  }, []);

  return (
    <LocaleContext.Provider value={{ lang: currentLang, setLang, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

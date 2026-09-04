"use client";

import { useRouter } from "next/navigation";
import { languages } from "@/locales/languages";
import { useLocale } from "@/components/providers/locale-provider";

const COOKIE_NAME = "dp_lang";

export function LanguageSelector() {
  const router = useRouter();
  const { lang, setLang } = useLocale();

  function handleChange(code: string) {
    setLang(code);
    document.cookie = `${COOKIE_NAME}=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <select
      value={lang}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Select language"
      className="rounded-md border border-input bg-white px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeName}
        </option>
      ))}
    </select>
  );
}

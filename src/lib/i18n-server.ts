import { cookies } from "next/headers";
import { translate } from "@/locales";
import { languages } from "@/locales/languages";

export function getServerLocale(): string {
  const lang = cookies().get("dp_lang")?.value;
  const valid = languages.some((l) => l.code === lang);
  return valid ? (lang as string) : "en";
}

export function t(key: string): string {
  return translate(getServerLocale(), key);
}

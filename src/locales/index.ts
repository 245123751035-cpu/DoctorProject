import en from "./en";
import hi from "./hi";
import te from "./te";
import type { LanguageCode } from "./languages";

const dictionaries: Record<string, Record<string, unknown>> = {
  en,
  hi,
  te
};

export function translate(lang: string, key: string): string {
  const dict = dictionaries[lang] ?? dictionaries.en;
  const value = valueAt(dict, key);
  if (typeof value === "string") return value;
  const enValue = valueAt(dictionaries.en, key);
  return typeof enValue === "string" ? enValue : key;
}

function valueAt(obj: unknown, key: string): unknown {
  const path = key.split(".");
  let cursor: unknown = obj;
  for (const part of path) {
    if (cursor && typeof cursor === "object" && part in cursor) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cursor;
}

export type TranslationKeyType = "en" | "hi" | "te";
export { en, hi, te };

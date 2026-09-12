import { getAIService } from "@/lib/ai";
import { NOT_AVAILABLE_COPY } from "./types";

export function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;•·]/)
    .map((item) => item.trim().replace(/^[-–]\s*/, ""))
    .filter((item) => item.length > 0);
}

export function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

export function normalizeText(value?: string | null): string | undefined {
  const v = value?.trim();
  return v && v.length ? v : undefined;
}

export function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const v of values) {
    if (v && v.trim().length > 0) return v.trim();
  }
  return NOT_AVAILABLE_COPY;
}

export function isNotAvailableText(value: string): boolean {
  return value.trim() === NOT_AVAILABLE_COPY;
}

export function cleanList(value: string | null | undefined): string[] {
  return unique(splitList(value)).filter((item) => !isNotAvailableText(item));
}

export function safeParseJson(content: string): Record<string, unknown> | null {
  try {
    const data = JSON.parse(content);
    return data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function pickString(
  parsed: Record<string, unknown>,
  key: string,
  fallback: string
): string {
  const value = parsed[key];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0 && !isNotAvailableText(trimmed)) return trimmed;
  }
  return fallback;
}

export function pickStringArray(
  parsed: Record<string, unknown>,
  key: string,
  fallback: string[]
): string[] {
  const value = parsed[key];
  if (Array.isArray(value)) {
    const items = value
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter((x) => x.length > 0 && !isNotAvailableText(x));
    if (items.length > 0) return unique(items);
  }
  return fallback;
}

/**
 * Sends a prompt to the configured AI provider when one is available.
 * Returns the raw text or null in offline mode / on any provider failure,
 * so callers always fall back to deterministic extraction.
 */
export async function requestAI(
  system: string,
  user: string,
  options: { json?: boolean } = {}
): Promise<string | null> {
  const service = getAIService();
  try {
    return await service.complete(system, user, options);
  } catch {
    return null;
  }
}
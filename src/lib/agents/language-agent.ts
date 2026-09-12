import type { AgentRunResult, LanguageAnalysis } from "./types";
import { requestAI } from "./utils";

export const SUPPORTED_LANGUAGES = ["en", "hi", "te"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  te: "Telugu (తెలుగు)"
};

const DEVANAGARI = /[\u0900-\u097F]/;
const TELUGU = /[\u0C00-\u0C7F]/;
const LATIN = /[A-Za-z]/;

type Script = "devanagari" | "telugu" | "latin" | "other";

export function detectScript(text: string): Script {
  let devanagari = 0;
  let telugu = 0;
  let latin = 0;

  for (const ch of text) {
    if (DEVANAGARI.test(ch)) devanagari++;
    else if (TELUGU.test(ch)) telugu++;
    else if (LATIN.test(ch)) latin++;
  }

  const total = devanagari + telugu + latin;
  if (total === 0) return "other";
  if (devanagari / total > 0.5) return "devanagari";
  if (telugu / total > 0.5) return "telugu";
  if (latin / total > 0.5) return "latin";
  return "other";
}

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return Boolean(value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value));
}

/**
 * Detects the consultation language. Prefers the explicitly recorded case
 * language, then falls back to heuristic script detection of the text.
 */
export function detectLanguage(
  originalText: string,
  declaredLanguage?: string | null
): string {
  if (isSupportedLanguage(declaredLanguage)) return declaredLanguage;

  switch (detectScript(originalText)) {
    case "devanagari":
      return "hi";
    case "telugu":
      return "te";
    case "latin":
      return "en";
    default:
      return isSupportedLanguage(declaredLanguage) ? declaredLanguage : "en";
  }
}

export interface LanguageAgentInput {
  originalText: string;
  declaredLanguage?: string | null;
  targetLanguage: string;
}

/**
 * Offline language analysis: detect the language and preserve the original
 * text. A translated/normalized version is only produced when it is actually
 * required (detected language differs from the target) AND an AI provider is
 * available. The original text is never replaced or deleted.
 */
export function languageAnalysisFallback(
  input: LanguageAgentInput
): LanguageAnalysis {
  const detected = detectLanguage(input.originalText, input.declaredLanguage);
  const requiresNormalization = detected !== input.targetLanguage;

  return {
    detectedLanguage: detected,
    languageLabel:
      LANGUAGE_LABELS[detected] ?? detectLanguage(input.originalText),
    originalText: input.originalText,
    normalizedText: null,
    note: requiresNormalization
      ? `Consultation is in ${LANGUAGE_LABELS[detected] ?? detected}; original text preserved. No translation available in offline mode.`
      : undefined
  };
}

/** Language Agent. */
export async function runLanguageAgent(
  input: LanguageAgentInput
): Promise<AgentRunResult<LanguageAnalysis>> {
  const fallback = languageAnalysisFallback(input);

  const requiresNormalization = fallback.detectedLanguage !== input.targetLanguage;
  if (!requiresNormalization) {
    return {
      result: { ...fallback, normalizedText: null },
      usedFallback: true
    };
  }

  const targetLabel = LANGUAGE_LABELS[input.targetLanguage] ?? input.targetLanguage;
  const system =
    "You are a medical documentation translator. Translate the patient's consultation text to the requested target language. Preserve all medical terms, names, numbers and dosages exactly. Return ONLY the translated text with no commentary or quotation marks.";
  const user =
    `The original patient text is in ${fallback.languageLabel}. Translate it to ${targetLabel}.\n\nOriginal text:\n${input.originalText}`;

  const response = await requestAI(system, user);
  if (!response) return { result: fallback, usedFallback: true };

  const normalized = response.trim();
  return {
    result: {
      ...fallback,
      normalizedText: normalized.length > 0 ? normalized : null
    },
    usedFallback: false
  };
}
import type {
  AgentRunResult,
  ConsultationContext,
  SymptomAnalysis
} from "./types";
import { NOT_AVAILABLE_COPY } from "./types";
import {
  cleanList,
  normalizeText,
  pickString,
  pickStringArray,
  requestAI,
  safeParseJson
} from "./utils";

const SYSTEM_PROMPT =
  "You are a clinical documentation assistant extracting structured data from a single patient consultation. Use only facts present in the provided text. Never diagnose, prescribe, or suggest treatments. Respond ONLY with a JSON object with EXACTLY these keys: chiefComplaint (string), symptoms (array of strings), duration (string), severity (string). If a value is missing use the exact string 'Not available in the recorded history.'.";

/**
 * Deterministic, offline extraction of the structured fields straight from
 * the consultation record. This is the fallback used when no AI provider is
 * available.
 */
export function extractSymptomsFallback(
  consultation: ConsultationContext
): SymptomAnalysis {
  return {
    chiefComplaint:
      normalizeText(consultation.chiefComplaint) ?? NOT_AVAILABLE_COPY,
    symptoms: cleanList(consultation.symptoms),
    duration: normalizeText(consultation.duration) ?? NOT_AVAILABLE_COPY,
    severity: normalizeText(consultation.severity) ?? NOT_AVAILABLE_COPY
  };
}

/** Symptom Analysis Agent. */
export async function runSymptomAgent(
  consultation: ConsultationContext
): Promise<AgentRunResult<SymptomAnalysis>> {
  const fallback = extractSymptomsFallback(consultation);

  const response = await requestAI(
    SYSTEM_PROMPT,
    `Extract structured clinical data from this consultation record (JSON):\n${JSON.stringify(consultation, null, 2)}`,
    { json: true }
  );

  if (!response) return { result: fallback, usedFallback: true };

  const parsed = safeParseJson(response);
  if (!parsed) return { result: fallback, usedFallback: true };

  return {
    result: {
      chiefComplaint: pickString(parsed, "chiefComplaint", fallback.chiefComplaint),
      symptoms: pickStringArray(parsed, "symptoms", fallback.symptoms),
      duration: pickString(parsed, "duration", fallback.duration),
      severity: pickString(parsed, "severity", fallback.severity)
    },
    usedFallback: false
  };
}
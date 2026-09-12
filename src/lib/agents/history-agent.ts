import { getAIService, isAIConfigured } from "@/lib/ai";
import type { PatientHistoryInput } from "@/lib/ai/types";
import { buildFactualSummary } from "@/lib/ai/factual";
import type { AgentRunResult, HistoryAnalysis } from "./types";
import { unique } from "./utils";

/**
 * Deterministic, offline assembly of the historical analysis straight from
 * the stored patient records. Reuses the existing factual summary extractor
 * so nothing is ever invented.
 */
export function buildHistoryAnalysis(input: PatientHistoryInput): HistoryAnalysis {
  const summary = buildFactualSummary(input);
  return {
    recurringSymptoms: summary.recurringSymptoms,
    previousDiagnoses: summary.previousConditions,
    allergies: summary.allergies,
    medications: summary.medicationsMentioned,
    importantHistory: unique([
      ...summary.keyHistory,
      ...summary.recentDevelopments
    ])
  };
}

/** Medical History Agent. */
export async function runHistoryAgent(
  input: PatientHistoryInput,
  language = "en"
): Promise<AgentRunResult<HistoryAnalysis>> {
  const fallback = buildHistoryAnalysis(input);

  try {
    // Reuses the existing AIService: the mock provider produces the
    // deterministic factual summary, the real provider may enrich it but
    // still falls back safely on any failure.
    const service = getAIService();
    const summary = await service.generatePatientHistorySummary(input, language);

    return {
      result: {
        recurringSymptoms: summary.recurringSymptoms,
        previousDiagnoses: summary.previousConditions,
        allergies: summary.allergies,
        medications: summary.medicationsMentioned,
        importantHistory: unique([
          ...summary.keyHistory,
          ...summary.recentDevelopments
        ])
      },
      usedFallback: !isAIConfigured()
    };
  } catch {
    return { result: fallback, usedFallback: true };
  }
}
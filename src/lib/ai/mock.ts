import type { AIService, HistorySummary, PatientHistoryInput } from "./types";
import { buildFactualSummary } from "./factual";

/**
 * MockAIService works entirely offline. It produces a deterministic,
 * structured "Clinical History Summary" derived strictly from the stored
 * patient records. This guarantees the hackathon demo works without any
 * API key while still demonstrating the summary feature.
 */
export class MockAIService implements AIService {
  async generatePatientHistorySummary(
    input: PatientHistoryInput,
    _language?: string
  ): Promise<HistorySummary> {
    await delay(600);
    return buildFactualSummary(input);
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

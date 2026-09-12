import type { AIService, AICompletionOptions, HistorySummary, PatientHistoryInput } from "./types";
import { buildFactualSummary } from "./factual";
import { AIError } from "./types";

const DEFAULT_URL = "https://api.openai.com/v1/chat/completions";

/**
 * RealAIService calls a configured, OpenAI-compatible chat completion API.
 * It prompts the model to produce strictly structured JSON extracted only
 * from the provided record text. Output is validated before returning.
 * On any failure (network, validation, missing key) it falls back to the
 * deterministic factual summary so the app never crashes.
 */
export class RealAIService implements AIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string } = {}) {
    this.apiKey = options.apiKey ?? process.env.AI_API_KEY ?? "";
    this.baseUrl = options.baseUrl ?? process.env.AI_BASE_URL ?? DEFAULT_URL;
    this.model = options.model ?? process.env.AI_MODEL ?? "gpt-4o-mini";
  }

  async generatePatientHistorySummary(
    input: PatientHistoryInput,
    language = "en"
  ): Promise<HistorySummary> {
    if (!this.apiKey) {
      throw new AIError(
        "AI_API_KEY is not configured. Falling back to offline summary."
      );
    }

    const prompt = buildPrompt(input, language);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a medical documentation assistant. You never diagnose, prescribe, or invent information. You summarize only the facts present in the provided patient records into a specific JSON structure. If something is missing, use the exact string 'Not available in the recorded history.' for that field."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new AIError(`AI request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new AIError("AI returned no content.");
      }

      const parsed = safeParse(content);
      return this.validateAndNormalize(parsed, input, language);
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }
      throw new AIError("AI request failed. Falling back to offline summary.");
    }
  }

  async complete(
    system: string,
    user: string,
    options: AICompletionOptions = {}
  ): Promise<string | null> {
    if (!this.apiKey) return null;

    const payload: Record<string, unknown> = {
      model: this.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    };
    if (options.json) payload.response_format = { type: "json_object" };

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) return null;

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      return typeof content === "string" && content.trim().length > 0 ? content.trim() : null;
    } catch {
      return null;
    }
  }

  private validateAndNormalize(
    parsed: Record<string, unknown>,
    input: PatientHistoryInput,
    language: string
  ): HistorySummary {
    const fallback = buildFactualSummary(input);

    const str = (v: unknown): string => (typeof v === "string" ? v : "");
    const arr = (v: unknown): string[] => {
      if (!Array.isArray(v)) return [];
      return v
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter((s) => s.length > 0 && s !== "N/A");
    };

    const title =
      language === "hi"
        ? "नैदानिक इतिहास सारांश"
        : language === "te"
        ? "క్లినికల్ హిస్టరీ సారాంశం"
        : "Clinical History Summary";

    return {
      title,
      patientOverview: str(parsed.patientOverview) || fallback.patientOverview,
      keyHistory: nonEmpty(arr(parsed.keyHistory), fallback.keyHistory),
      previousConditions: nonEmpty(arr(parsed.previousConditions), fallback.previousConditions),
      recurringSymptoms: nonEmpty(arr(parsed.recurringSymptoms), fallback.recurringSymptoms),
      medicationsMentioned: nonEmpty(arr(parsed.medicationsMentioned), fallback.medicationsMentioned),
      allergies: nonEmpty(arr(parsed.allergies), fallback.allergies),
      investigations: nonEmpty(arr(parsed.investigations), fallback.investigations),
      recentDevelopments: nonEmpty(arr(parsed.recentDevelopments), fallback.recentDevelopments),
      itemsForDoctorReview: nonEmpty(arr(parsed.itemsForDoctorReview), fallback.itemsForDoctorReview),
      disclaimer: fallback.disclaimer
    };
  }
}

function nonEmpty(primary: string[], fallback: string[]): string[] {
  return primary.length ? primary : fallback;
}

function safeParse(content: string): Record<string, unknown> {
  try {
    const data = JSON.parse(content);
    return (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  } catch {
    throw new AIError("AI returned invalid JSON.");
  }
}

function buildPrompt(input: PatientHistoryInput, language: string): string {
  const record = JSON.stringify(input, null, 2);
  return [
    `Read the patient records below (JSON) and produce a "Clinical History Summary" as a JSON object with EXACTLY these keys:`,
    `patientOverview, keyHistory (array), previousConditions (array), recurringSymptoms (array), medicationsMentioned (array), allergies (array), investigations (array), recentDevelopments (array), itemsForDoctorReview (array).`,
    `Use ONLY facts present in the records. Never invent diagnoses, symptoms, medications, test results, or allergies. If information is missing use the exact string "Not available in the recorded history."`,
    `Output language: ${language}`,
    `Records:`,
    record
  ].join("\n");
}

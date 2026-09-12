import type { AIService } from "./types";
import { MockAIService } from "./mock";
import { RealAIService } from "./real";

/**
 * Returns the AI service to use based on environment configuration.
 * Defaults to the offline MockAIService when no provider is configured,
 * so the application always works in a demo setting.
 */
export function getAIService(): AIService {
  const provider = (process.env.AI_PROVIDER ?? "mock").toLowerCase();

  switch (provider) {
    case "openai":
    case "anthropic":
    case "gemini":
      // The OpenAI-compatible HTTP client works with any compatible endpoint.
      return new RealAIService();
    case "mock":
    default:
      return new MockAIService();
  }
}

/**
 * True when a real external AI provider is configured (non-mock provider plus
 * an API key). Agents use this to report whether they ran in offline fallback
 * mode. The application never depends on this being true.
 */
export function isAIConfigured(): boolean {
  const provider = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  if (provider === "mock") return false;
  return Boolean(process.env.AI_API_KEY);
}

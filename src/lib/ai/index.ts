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

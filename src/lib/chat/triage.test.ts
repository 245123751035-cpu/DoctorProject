import { describe, it, expect } from "vitest";
import { getTriageOutcome, getDefaultWelcome } from "./triage";

describe("triage engine", () => {
  it("returns EMERGENCY for chest pain", () => {
    const out = getTriageOutcome("I have chest pain and can't breathe", "en");
    expect(out.emergency).toBe(true);
    expect(out.urgency).toBe("EMERGENCY");
    expect(out.selfCare.length).toBeGreaterThan(0);
  });

  it("matches fever in English", () => {
    const out = getTriageOutcome("I have a fever and temperature for two days", "en");
    expect(out.urgency).toBe("MODERATE");
    expect(out.matches).toContain("fever");
  });

  it("matches fever in Hindi", () => {
    const out = getTriageOutcome("मुझे बुखार है और खांसी है", "hi");
    expect(out.selfCare.length).toBeGreaterThan(0);
    expect(out.urgency).not.toBe("EMERGENCY");
  });

  it("matches fever in Telugu", () => {
    const out = getTriageOutcome("నాకు జ్వరం మరియు దగ్గు ఉంది", "te");
    expect(out.selfCare.length).toBeGreaterThan(0);
  });

  it("falls back gracefully when nothing matches", () => {
    const out = getTriageOutcome("this is unrelated gibberish", "en");
    expect(out.matches).toHaveLength(0);
    expect(out.isGreeting).toBe(false);
    expect(out.urgency).toBe("LOW");
  });

  it("handles greeting messages", () => {
    const out = getTriageOutcome("Hello there", "en");
    expect(out.isGreeting).toBe(true);
  });

  it("handles empty input without crashing", () => {
    const out = getTriageOutcome("   ", "en");
    expect(out.isGreeting).toBe(false);
  });

  it("combines self-care advice across matched rules", () => {
    const out = getTriageOutcome("fever and headache", "en");
    expect(out.selfCare.length).toBeGreaterThanOrEqual(2);
  });

  it("provides a localized welcome", () => {
    expect(getDefaultWelcome("hi").title.length).toBeGreaterThan(0);
    expect(getDefaultWelcome("te").message.length).toBeGreaterThan(0);
  });
});
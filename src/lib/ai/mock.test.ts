import { describe, it, expect } from "vitest";
import { buildFactualSummary } from "./factual";
import { MockAIService } from "./mock";

const baseInput = {
  patient: {
    fullName: "Test Patient",
    age: 40,
    gender: "MALE",
    bloodGroup: "O_POS"
  },
  consultations: [],
  medications: [],
  allergies: [],
  investigations: [],
  conditions: []
};

describe("buildFactualSummary", () => {
  it("does not invent data and marks missing fields as not available", () => {
    const summary = buildFactualSummary(baseInput as any);
    expect(summary.medicationsMentioned[0]).toContain("Not available");
    expect(summary.allergies[0]).toContain("Not available");
    expect(summary.investigations[0]).toContain("Not available");
  });

  it("extracts only facts present in records", () => {
    const input = {
      ...baseInput,
      consultations: [
        {
          id: "1",
          createdAt: "2026-01-01T00:00:00.000Z",
          chiefComplaint: "Headache for 3 weeks",
          currentMedications: "Paracetamol",
          symptoms: "Frontal headache"
        }
      ]
    } as any;

    const summary = buildFactualSummary(input);
    expect(summary.keyHistory.some((k) => k.includes("Headache"))).toBe(true);
    expect(summary.medicationsMentioned).toContain("Paracetamol");
    expect(summary.recurringSymptoms).toContain("Frontal headache");
  });
});

describe("MockAIService", () => {
  it("works without any API key", async () => {
    const service = new MockAIService();
    const summary = await service.generatePatientHistorySummary(baseInput as any, "en");
    expect(summary.title).toContain("Summary");
    expect(summary.disclaimer).toContain("clinician review");
  });
});

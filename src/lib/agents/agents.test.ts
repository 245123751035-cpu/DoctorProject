import { describe, it, expect } from "vitest";
import type { PatientHistoryInput } from "@/lib/ai/types";
import type { ConsultationContext, ReportAgentInput } from "./types";
import { NOT_AVAILABLE_COPY } from "./types";
import { extractSymptomsFallback, runSymptomAgent } from "./symptom-agent";
import { buildHistoryAnalysis, runHistoryAgent } from "./history-agent";
import {
  detectLanguage,
  languageAnalysisFallback,
  runLanguageAgent
} from "./language-agent";
import { runReportAgent } from "./report-agent";

const consultation: ConsultationContext = {
  id: "c1",
  createdAt: "2026-01-10T00:00:00.000Z",
  chiefComplaint: "Headache for 3 weeks",
  chiefComplaintLang: "en",
  symptoms: "Frontal headache, neck stiffness",
  duration: "3 weeks",
  severity: "moderate",
  medicalHistory: null,
  previousDiagnosis: null,
  currentMedications: "Paracetamol",
  allergies: null,
  previousTreatment: null,
  investigations: null,
  doctorObservations: null,
  assessment: null,
  followUpNotes: null
};

const historyInput: PatientHistoryInput = {
  patient: {
    fullName: "Test Patient",
    age: 40,
    gender: "MALE",
    bloodGroup: "O_POS"
  },
  consultations: [
    {
      id: "c1",
      createdAt: "2026-01-10T00:00:00.000Z",
      chiefComplaint: "Headache for 3 weeks",
      symptoms: "Frontal headache",
      previousDiagnosis: "Migraine",
      currentMedications: "Paracetamol",
      allergies: "Penicillin"
    }
  ],
  medications: [{ name: "Amlodipine", dosage: "5mg", frequency: "daily" }],
  allergies: [{ name: "Ibuprofen", severity: "Mild" }],
  investigations: [{ type: "CBC", result: "Normal" }],
  conditions: [{ name: "Hypertension" }]
};

describe("Symptom Agent", () => {
  it("extracts structured fields from the consultation record (fallback)", () => {
    const result = extractSymptomsFallback(consultation);
    expect(result).toEqual({
      chiefComplaint: "Headache for 3 weeks",
      symptoms: ["Frontal headache", "neck stiffness"],
      duration: "3 weeks",
      severity: "moderate"
    });
  });

  it("marks missing fields as not available", () => {
    const result = extractSymptomsFallback({
      ...consultation,
      chiefComplaint: "",
      symptoms: null,
      duration: null,
      severity: null
    });
    expect(result.chiefComplaint).toBe(NOT_AVAILABLE_COPY);
    expect(result.symptoms).toEqual([]);
    expect(result.duration).toBe(NOT_AVAILABLE_COPY);
    expect(result.severity).toBe(NOT_AVAILABLE_COPY);
  });

  it("works offline and reports the fallback was used", async () => {
    const run = await runSymptomAgent(consultation);
    expect(run.usedFallback).toBe(true);
    expect(run.result.symptoms).toContain("neck stiffness");
    expect(run.result.chiefComplaint).toBe("Headache for 3 weeks");
  });
});

describe("History Agent", () => {
  it("builds the history analysis from stored records without inventing data", () => {
    const result = buildHistoryAnalysis(historyInput);
    expect(result.medications).toContain("Amlodipine");
    expect(result.medications).toContain("Paracetamol");
    expect(result.allergies).toContain("Ibuprofen");
    expect(result.allergies).toContain("Penicillin");
    expect(result.previousDiagnoses).toContain("Hypertension");
    expect(result.previousDiagnoses).toContain("Migraine");
    expect(result.recurringSymptoms).toContain("Frontal headache");
  });

  it("returns a usable result even in offline mode", async () => {
    const run = await runHistoryAgent(historyInput);
    expect(run.usedFallback).toBe(true);
    expect(run.result.importantHistory.length).toBeGreaterThan(0);
  });
});

describe("Language Agent", () => {
  it("detects Telugu text from its script", () => {
    expect(detectLanguage("తలనొప్పి గా ఉంది", null)).toBe("te");
  });

  it("detects Hindi text from its script", () => {
    expect(detectLanguage("मुझे सिर दर्द है", null)).toBe("hi");
  });

  it("detects English text from its script", () => {
    expect(detectLanguage("pain in the head", null)).toBe("en");
  });

  it("prefers the explicitly declared case language", () => {
    expect(detectLanguage("headache", "hi")).toBe("hi");
  });

  it("preserves the original text and offers no translation offline", () => {
    const result = languageAnalysisFallback({
      originalText: "मुझे सिर दर्द है",
      declaredLanguage: "hi",
      targetLanguage: "en"
    });
    expect(result.detectedLanguage).toBe("hi");
    expect(result.originalText).toBe("मुझे सिर दर्द है");
    expect(result.normalizedText).toBeNull();
    expect(result.note).toBeTruthy();
  });

  it("runs fully offline without a provider", async () => {
    const run = await runLanguageAgent({
      originalText: "మళ్ళీ తలనొప్పి",
      declaredLanguage: "te",
      targetLanguage: "en"
    });
    expect(run.usedFallback).toBe(true);
    expect(run.result.detectedLanguage).toBe("te");
    expect(run.result.originalText).toBe("మళ్ళీ తలనొప్పి");
  });
});

describe("Report Agent", () => {
  it("assembles the structured clinical report and adds the safety disclaimer", () => {
    const input: ReportAgentInput = {
      patient: {
        id: "p1",
        fullName: "Test Patient",
        age: 40,
        gender: "MALE",
        preferredLanguage: "en",
        knownAllergies: "Penicillin",
        existingConditions: "Hypertension"
      },
      consultation,
      symptom: extractSymptomsFallback(consultation),
      history: buildHistoryAnalysis(historyInput),
      language: languageAnalysisFallback({
        originalText: consultation.chiefComplaint,
        declaredLanguage: "en",
        targetLanguage: "en"
      })
    };

    const report = runReportAgent(input);
    expect(report.chiefComplaint).toBe("Headache for 3 weeks");
    expect(report.currentSymptoms).toContain("neck stiffness");
    expect(report.durationAndSeverity).toContain("3 weeks");
    expect(report.durationAndSeverity).toContain("moderate");
    expect(report.medications).toContain("Amlodipine");
    expect(report.importantObservations.length).toBeGreaterThanOrEqual(1);
    expect(report.disclaimer).toBe(
      "AI-generated information for clinician review. It does not replace professional medical judgment."
    );
  });
});
import type { HistorySummary, PatientHistoryInput } from "./types";

function list(items: Array<string | undefined | null>): string[] {
  return items
    .map((i) => (i ? String(i).trim() : ""))
    .filter((i) => i.length > 0);
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

function notAvailable(english: string): string {
  return "Not available in the recorded history.";
}

function normalizeText(t?: string | null): string | undefined {
  const v = t?.trim();
  return v && v.length ? v : undefined;
}

/**
 * Builds a factual, structured HistorySummary strictly from the stored
 * patient records. The mock AI and the real AI's fallback both funnel
 * through this deterministic extractor so a usable summary always exists
 * even without any external service. Nothing is invented.
 */
export function buildFactualSummary(input: PatientHistoryInput): HistorySummary {
  const { patient, consultations, medications, allergies, investigations, conditions } = input;

  const sortedConsultations = [...consultations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const recent = sortedConsultations[sortedConsultations.length - 1];

  const allMedications = unique(
    list([
      ...medications.map((m) => m.name),
      ...sortedConsultations.map((c) => normalizeText(c.currentMedications))
    ])
  ).filter((m) => m.toLowerCase() !== "nil" && m.toLowerCase() !== "none");

  const allAllergies = unique(
    list([
      ...allergies.map((a) => a.name),
      ...sortedConsultations.map((c) => normalizeText(c.allergies))
    ])
  ).filter((a) => a.toLowerCase() !== "nil" && a.toLowerCase() !== "none");

  const allInvestigations = unique(
    list([
      ...investigations.map((i) => (i.result ? `${i.type}: ${i.result}` : i.type)),
      ...sortedConsultations.map((c) => normalizeText(c.investigations))
    ])
  );

  const allConditions = unique(
    list([
      ...conditions.map((c) => c.name),
      ...sortedConsultations.map((c) =>
        normalizeText(c.previousDiagnosis)
      )
    ])
  );

  const allComplaints = unique(
    list(sortedConsultations.map((c) => normalizeText(c.chiefComplaint)))
  );

  const recurringSymptoms = unique(
    list(sortedConsultations.map((c) => normalizeText(c.symptoms)))
  );

  const keyHistory = unique([
    ...allComplaints.map((c) => `Chief complaint: ${c}`),
    ...list(sortedConsultations.map((c) => normalizeText(c.assessment)))
  ]);

  const keyReview = list([
    recent ? `Most recent consultation (${formatDate(recent.createdAt)}): ${recent.chiefComplaint}` : undefined,
    ...allConditions.length
      ? []
      : [undefined],
    ...list(sortedConsultations.map((c) => normalizeText(c.followUpNotes))).map(
      (n) => `Follow-up note: ${n}`
    )
  ]);

  const previousConditions = allConditions.length
    ? allConditions
    : [notAvailable("previous conditions")];
  const recurringSymptomsFinal = recurringSymptoms.length
    ? recurringSymptoms
    : [notAvailable("recurring symptoms")];
  const medicationsFinal = allMedications.length
    ? allMedications
    : [notAvailable("medications")];
  const allergiesFinal = allAllergies.length
    ? allAllergies
    : [notAvailable("allergies")];
  const investigationsFinal = allInvestigations.length
    ? allInvestigations
    : [notAvailable("investigations")];

  const itemsForDoctorReview = keyReview.length
    ? keyReview
    : [notAvailable("review items")];

  const ageText =
    patient.age != null
      ? `${patient.age} years`
      : notAvailable("age");

  return {
    title: "Clinical History Summary",
    patientOverview: `${patient.fullName}, ${patient.gender}${
      patient.bloodGroup === "UNKNOWN" ? "" : `, blood group ${patient.bloodGroup ?? ""}`
    }. Age: ${ageText}.`,
    keyHistory: keyHistory.length ? keyHistory : [notAvailable("history")],
    previousConditions,
    recurringSymptoms: recurringSymptomsFinal,
    medicationsMentioned: medicationsFinal,
    allergies: allergiesFinal,
    investigations: investigationsFinal,
    recentDevelopments: keyReview.length ? keyReview : [notAvailable("recent developments")],
    itemsForDoctorReview,
    disclaimer:
      "AI-generated summary for clinician review. It does not replace professional medical judgment."
  };
}

function formatDate(value: Date | string): string {
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
}

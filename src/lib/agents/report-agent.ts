import type {
  ClinicalReport,
  ReportAgentInput
} from "./types";
import { CLINICAL_DISCLAIMER, NOT_AVAILABLE_COPY } from "./types";
import { isNotAvailableText, normalizeText } from "./utils";

function availabilityLabel(items: string[]): string[] {
  return items.length > 0 ? items : [NOT_AVAILABLE_COPY];
}

/** Clinical Report Agent. */
export function runReportAgent(input: ReportAgentInput): ClinicalReport {
  const { consultation, symptom, history, language } = input;

  const importantObservations: string[] = [];

  if (normalizeText(consultation.assessment)) {
    importantObservations.push(
      `Doctor's assessment recorded: ${consultation.assessment}`
    );
  }
  if (normalizeText(consultation.doctorObservations)) {
    importantObservations.push(
      `Doctor's observations recorded: ${consultation.doctorObservations}`
    );
  }
  if (normalizeText(consultation.followUpNotes)) {
    importantObservations.push(
      `Follow-up note: ${consultation.followUpNotes}`
    );
  }
  if (normalizeText(consultation.medicalHistory)) {
    importantObservations.push(
      `Medical history noted in this consultation: ${consultation.medicalHistory}`
    );
  }
  if (language.normalizedText) {
    importantObservations.push(
      `Consultation translated for review (${language.detectedLanguage} → ${LANGUAGE_NAME}): ${language.normalizedText}`
    );
  }

  const itemsForDoctorReview: string[] = [];

  if (
    normalizeText(consultation.chiefComplaintLang) &&
    language.detectedLanguage !== consultation.chiefComplaintLang
  ) {
    itemsForDoctorReview.push(
      `The detected language (${language.detectedLanguage}) differs from the recorded case language (${consultation.chiefComplaintLang}). Confirm the correct language of the consultation.`
    );
  }
  if (symptom.severity && severityIsSevere(symptom.severity)) {
    itemsForDoctorReview.push(
      `Note: severity is recorded as "${symptom.severity}". Given the severity, prioritize clinical review.`
    );
  }
  if (history.medications.length > 0) {
    itemsForDoctorReview.push("Review current medications for relevance and possible interactions.");
  }
  if (history.allergies.length > 0) {
    itemsForDoctorReview.push("Known allergies are on record — take them into account.");
  }
  if (
    symptom.duration &&
    !isNotAvailableText(symptom.duration) &&
    requiresDurationReview(symptom.duration)
  ) {
    itemsForDoctorReview.push(
      `Prolonged duration noted ("${symptom.duration}"). Consider whether specialist review is appropriate.`
    );
  }
  if (history.previousDiagnoses.length > 0) {
    itemsForDoctorReview.push("Previous diagnoses may be relevant to the current complaint.");
  }
  if (consultation.createdAt) {
    itemsForDoctorReview.push(
      `Most recent consultation recorded: ${new Date(consultation.createdAt).toISOString().slice(0, 10)}`
    );
  }

  const durationAndSeverity = [
    symptom.duration !== NOT_AVAILABLE_COPY && symptom.duration
      ? `Duration: ${symptom.duration}`
      : null,
    symptom.severity !== NOT_AVAILABLE_COPY && symptom.severity
      ? `Severity: ${symptom.severity}`
      : null
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ") || NOT_AVAILABLE_COPY;

  return {
    chiefComplaint: symptom.chiefComplaint,
    currentSymptoms: availabilityLabel(symptom.symptoms),
    durationAndSeverity,
    relevantMedicalHistory: availabilityLabel(history.importantHistory),
    previousConditions: availabilityLabel(history.previousDiagnoses),
    medications: availabilityLabel(history.medications),
    allergies: availabilityLabel(history.allergies),
    importantObservations: availabilityLabel(importantObservations),
    itemsForDoctorReview: availabilityLabel(itemsForDoctorReview),
    disclaimer: CLINICAL_DISCLAIMER
  };
}

const LANGUAGE_NAME = "English";

function severityIsSevere(value: string): boolean {
  return value.toLowerCase().trim() === "severe";
}

function requiresDurationReview(value: string): boolean {
  const text = value.toLowerCase();
  const months = text.match(/(\d+)\s*(month|months)/);
  if (months && Number(months[1]) >= 3) return true;
  if (/years|year/.test(text)) return true;
  return false;
}
/**
 * Shared type system for the multi-agent CaseTaker pipeline.
 *
 * The coordinator agent runs the specialized agents, then hands their
 * combined outputs to the report agent. Every agent result is plain,
 * serializable data so it can be rendered directly in the UI.
 */

export const CLINICAL_DISCLAIMER =
  "AI-generated information for clinician review. It does not replace professional medical judgment.";

export const NOT_AVAILABLE_COPY = "Not available in the recorded history.";

export type AgentId = "symptom" | "history" | "language" | "report";

export type AgentStatus = "pending" | "running" | "done" | "skipped" | "error";

/** Structured view of the consultation being analyzed. */
export interface ConsultationContext {
  id: string;
  createdAt: string;
  chiefComplaint: string;
  chiefComplaintLang: string;
  symptoms: string | null;
  duration: string | null;
  severity: string | null;
  medicalHistory: string | null;
  previousDiagnosis: string | null;
  currentMedications: string | null;
  allergies: string | null;
  previousTreatment: string | null;
  investigations: string | null;
  doctorObservations: string | null;
  assessment: string | null;
  followUpNotes: string | null;
}

/** Minimal patient demographics used by the report agent. */
export interface PatientContext {
  id: string;
  fullName: string;
  age: number | null;
  gender: string;
  preferredLanguage: string;
  knownAllergies: string | null;
  existingConditions: string | null;
}

/** Symptom Analysis Agent output. */
export interface SymptomAnalysis {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: string;
}

/** Medical History Agent output. */
export interface HistoryAnalysis {
  recurringSymptoms: string[];
  previousDiagnoses: string[];
  allergies: string[];
  medications: string[];
  importantHistory: string[];
}

/** Language Agent output. */
export interface LanguageAnalysis {
  detectedLanguage: string;
  languageLabel: string;
  originalText: string;
  normalizedText: string | null;
  note?: string;
}

/** Clinical Report Agent output. */
export interface ClinicalReport {
  chiefComplaint: string;
  currentSymptoms: string[];
  durationAndSeverity: string;
  relevantMedicalHistory: string[];
  previousConditions: string[];
  medications: string[];
  allergies: string[];
  importantObservations: string[];
  itemsForDoctorReview: string[];
  disclaimer: string;
}

export type AgentResult =
  | SymptomAnalysis
  | HistoryAnalysis
  | LanguageAnalysis
  | ClinicalReport;

export interface AgentStep {
  id: AgentId;
  name: string;
  status: AgentStatus;
  summary: string;
  usedFallback: boolean;
  result?: AgentResult;
  error?: string;
}

export interface MultiAgentAnalysis {
  patientId: string;
  consultationId: string | null;
  consultationDate: string | null;
  steps: AgentStep[];
  report: ClinicalReport;
  usedFallback: boolean;
  generatedAt: string;
  disclaimer: string;
}

/** Result of a single agent run. */
export interface AgentRunResult<T = AgentResult> {
  result: T;
  usedFallback: boolean;
}

/** Combined input handed by the coordinator to the Report Agent. */
export interface ReportAgentInput {
  patient: PatientContext;
  consultation: ConsultationContext;
  symptom: SymptomAnalysis;
  history: HistoryAnalysis;
  language: LanguageAnalysis;
}
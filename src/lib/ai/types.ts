export interface PatientHistoryInput {
  patient: {
    fullName: string;
    age?: number | null;
    gender: string;
    bloodGroup?: string | null;
    preferredLanguage?: string | null;
  };
  consultations: Array<{
    id: string;
    createdAt: Date | string;
    chiefComplaint: string;
    symptoms?: string | null;
    duration?: string | null;
    severity?: string | null;
    medicalHistory?: string | null;
    previousDiagnosis?: string | null;
    currentMedications?: string | null;
    allergies?: string | null;
    previousTreatment?: string | null;
    investigations?: string | null;
    doctorObservations?: string | null;
    assessment?: string | null;
    followUpNotes?: string | null;
  }>;
  medications: Array<{
    name: string;
    dosage?: string | null;
    frequency?: string | null;
  }>;
  allergies: Array<{
    name: string;
    severity?: string | null;
  }>;
  investigations: Array<{
    type: string;
    result?: string | null;
  }>;
  conditions: Array<{
    name: string;
    notes?: string | null;
  }>;
}

export interface HistorySummary {
  title: string;
  patientOverview: string;
  keyHistory: string[];
  previousConditions: string[];
  recurringSymptoms: string[];
  medicationsMentioned: string[];
  allergies: string[];
  investigations: string[];
  recentDevelopments: string[];
  itemsForDoctorReview: string[];
  disclaimer: string;
}

export interface AICompletionOptions {
  json?: boolean;
}

export interface AIService {
  generatePatientHistorySummary(
    input: PatientHistoryInput,
    language?: string
  ): Promise<HistorySummary>;

  /**
   * Sends an arbitrary prompt to the configured AI provider and returns the
   * raw response text, or `null` when no provider is configured / available
   * (offline mode). Agents use this only to enrich their deterministic,
   * offline results — they must never crash when it returns `null`.
   */
  complete(
    system: string,
    user: string,
    options?: AICompletionOptions
  ): Promise<string | null>;
}

export class AIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIError";
  }
}

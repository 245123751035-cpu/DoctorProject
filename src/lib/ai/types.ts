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

export interface AIService {
  generatePatientHistorySummary(
    input: PatientHistoryInput,
    language?: string
  ): Promise<HistorySummary>;
}

export class AIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIError";
  }
}

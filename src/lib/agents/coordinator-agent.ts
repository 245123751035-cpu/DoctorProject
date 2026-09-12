import { db } from "@/lib/db";
import type { PatientHistoryInput } from "@/lib/ai/types";
import { runSymptomAgent } from "./symptom-agent";
import { runHistoryAgent } from "./history-agent";
import { runLanguageAgent, isSupportedLanguage } from "./language-agent";
import { runReportAgent } from "./report-agent";
import type {
  AgentStep,
  ConsultationContext,
  MultiAgentAnalysis,
  PatientContext
} from "./types";
import { CLINICAL_DISCLAIMER } from "./types";

export interface CoordinatorParams {
  doctorId: string;
  patientId: string;
  consultationId?: string;
  language?: string;
}

function toConsultationContext(
  consultation: {
    id: string;
    createdAt: Date;
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
): ConsultationContext {
  return {
    id: consultation.id,
    createdAt: consultation.createdAt.toISOString(),
    chiefComplaint: consultation.chiefComplaint,
    chiefComplaintLang: consultation.chiefComplaintLang,
    symptoms: consultation.symptoms,
    duration: consultation.duration,
    severity: consultation.severity,
    medicalHistory: consultation.medicalHistory,
    previousDiagnosis: consultation.previousDiagnosis,
    currentMedications: consultation.currentMedications,
    allergies: consultation.allergies,
    previousTreatment: consultation.previousTreatment,
    investigations: consultation.investigations,
    doctorObservations: consultation.doctorObservations,
    assessment: consultation.assessment,
    followUpNotes: consultation.followUpNotes
  };
}

/**
 * Coordinator Agent.
 *
 * Main orchestrator of the multi-agent pipeline:
 * 1. Loads the patient and the consultation (explicit id or the latest one).
 * 2. Decides which specialized agents run (all required ones for a case).
 * 3. Dispatches Symptom, History and Language agents in parallel.
 * 4. Collects every agent output and hands the combined data to the Report
 *    Agent, then returns the final analysis for the doctor dashboard.
 */
export async function runMultiAgentAnalysis(
  params: CoordinatorParams
): Promise<MultiAgentAnalysis> {
  const patient = await db.patient.findFirst({
    where: { id: params.patientId, doctorId: params.doctorId },
    include: {
      medications: true,
      allergies: true,
      investigations: true,
      medicalConditions: true,
      consultations: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!patient) throw new Error("Patient not found");

  const consultations = [...patient.consultations].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const consultation = params.consultationId
    ? consultations.find((c) => c.id === params.consultationId)
    : consultations[consultations.length - 1];

  if (params.consultationId && !consultation) {
    throw new Error("Consultation not found");
  }
  if (!consultation) {
    throw new Error("No consultation recorded for this patient yet.");
  }

  const consultationContext = toConsultationContext(consultation);

  const patientContext: PatientContext = {
    id: patient.id,
    fullName: patient.fullName,
    age: patient.age,
    gender: patient.gender,
    preferredLanguage: patient.preferredLanguage ?? "en",
    knownAllergies: patient.knownAllergies,
    existingConditions: patient.existingConditions
  };

  const patientHistoryInput: PatientHistoryInput = {
    patient: {
      fullName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      preferredLanguage: patient.preferredLanguage
    },
    consultations: patient.consultations.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      chiefComplaint: c.chiefComplaint,
      symptoms: c.symptoms,
      duration: c.duration,
      severity: c.severity,
      medicalHistory: c.medicalHistory,
      previousDiagnosis: c.previousDiagnosis,
      currentMedications: c.currentMedications,
      allergies: c.allergies,
      previousTreatment: c.previousTreatment,
      investigations: c.investigations,
      doctorObservations: c.doctorObservations,
      assessment: c.assessment,
      followUpNotes: c.followUpNotes
    })),
    medications: patient.medications.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency
    })),
    allergies: patient.allergies.map((a) => ({
      name: a.name,
      severity: a.severity
    })),
    investigations: patient.investigations.map((i) => ({
      type: i.type,
      result: i.result
    })),
    conditions: patient.medicalConditions.map((c) => ({
      name: c.name,
      notes: c.notes
    }))
  };

  const targetLanguage = isSupportedLanguage(params.language)
    ? params.language
    : isSupportedLanguage(patient.preferredLanguage)
      ? patient.preferredLanguage
      : "en";

  const originalText = [
    consultation.chiefComplaint,
    consultation.symptoms
  ]
    .filter((part): part is string => Boolean(part && part.trim().length))
    .join("\n");

  const [symptomRun, historyRun, languageRun] = await Promise.all([
    runSymptomAgent(consultationContext),
    runHistoryAgent(patientHistoryInput, targetLanguage),
    runLanguageAgent({
      originalText,
      declaredLanguage: consultation.chiefComplaintLang,
      targetLanguage
    })
  ]);

  const report = runReportAgent({
    patient: patientContext,
    consultation: consultationContext,
    symptom: symptomRun.result,
    history: historyRun.result,
    language: languageRun.result
  });

  const steps: AgentStep[] = [
    {
      id: "symptom",
      name: "Symptom Agent",
      status: "done",
      summary: "Extracted symptoms, duration, severity and chief complaint.",
      usedFallback: symptomRun.usedFallback,
      result: symptomRun.result
    },
    {
      id: "history",
      name: "Medical History Agent",
      status: "done",
      summary: "Analyzed previous consultations and medical history.",
      usedFallback: historyRun.usedFallback,
      result: historyRun.result
    },
    {
      id: "language",
      name: "Language Agent",
      status: "done",
      summary: "Processed the consultation language and preserved the original text.",
      usedFallback: languageRun.usedFallback,
      result: languageRun.result
    },
    {
      id: "report",
      name: "Report Agent",
      status: "done",
      summary: "Combined all agent outputs into the final structured clinical report.",
      usedFallback: true,
      result: report
    }
  ];

  return {
    patientId: patient.id,
    consultationId: consultation.id,
    consultationDate: consultation.createdAt.toISOString(),
    steps,
    report,
    usedFallback: steps.some((step) => step.usedFallback),
    generatedAt: new Date().toISOString(),
    disclaimer: CLINICAL_DISCLAIMER
  };
}
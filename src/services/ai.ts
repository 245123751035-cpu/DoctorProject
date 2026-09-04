import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAIService } from "@/lib/ai";
import type { PatientHistoryInput, HistorySummary } from "@/lib/ai/types";

export async function generatePatientHistorySummary(
  doctorId: string,
  patientId: string,
  language = "en"
): Promise<HistorySummary> {
  const patient = await db.patient.findFirst({
    where: { id: patientId, doctorId },
    include: {
      medications: true,
      allergies: true,
      investigations: true,
      medicalConditions: true,
      consultations: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!patient) throw new Error("Patient not found");

  const input: PatientHistoryInput = {
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

  const ai = getAIService();
  const summary = await ai.generatePatientHistorySummary(input, language);

  await db.aiSummary.create({
    data: {
      patientId,
      doctorId,
      content: summary as unknown as Prisma.InputJsonValue,
      language
    }
  });

  return summary;
}

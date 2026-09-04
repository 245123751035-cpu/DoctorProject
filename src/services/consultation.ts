import { db } from "@/lib/db";
import type { ConsultationInput } from "@/lib/validation/schemas";

export async function createConsultation(
  doctorId: string,
  input: ConsultationInput
) {
  const patient = await db.patient.findFirst({
    where: { id: input.patientId, doctorId }
  });
  if (!patient) throw new Error("Patient not found");

  const consultation = await db.consultation.create({
    data: {
      patientId: input.patientId,
      doctorId,
      chiefComplaint: input.chiefComplaint.trim(),
      chiefComplaintLang: input.chiefComplaintLang || "en",
      symptoms: input.symptoms || null,
      duration: input.duration || null,
      severity: input.severity || null,
      medicalHistory: input.medicalHistory || null,
      previousDiagnosis: input.previousDiagnosis || null,
      currentMedications: input.currentMedications || null,
      allergies: input.allergies || null,
      previousTreatment: input.previousTreatment || null,
      investigations: input.investigations || null,
      doctorObservations: input.doctorObservations || null,
      assessment: input.assessment || null,
      diagnosis: input.diagnosis || null,
      prescription: input.prescription || null,
      followUpNotes: input.followUpNotes || null
    }
  });

  return consultation;
}

export async function getConsultationsForPatient(patientId: string) {
  return db.consultation.findMany({
    where: { patientId },
    orderBy: { createdAt: "asc" }
  });
}

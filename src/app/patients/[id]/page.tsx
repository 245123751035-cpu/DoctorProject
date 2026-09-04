import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { currentDoctor } from "@/lib/auth/current";
import { AppHeader } from "@/features/layout/app-header";
import { getPatientById } from "@/services/patient";
import { ProfileTabs, type PatientProfileData, type ConsultationRow } from "@/features/patients/profile-tabs";
import { t } from "@/lib/i18n-server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage({
  params
}: {
  params: { id: string };
}) {
  const doctor = await currentDoctor();
  if (!doctor) redirect("/login");

  const patient = await getPatientById(doctor.id, params.id);
  if (!patient) notFound();

  const patientReports = await db.patientReport.findMany({
    where: { patientId: params.id },
    orderBy: { createdAt: "desc" }
  });

  const lastVisit = patient.consultations.length
    ? patient.consultations[patient.consultations.length - 1].createdAt.toISOString()
    : null;

  const linkedUser = patient.patientUserId
    ? await db.patientUser.findUnique({
        where: { id: patient.patientUserId },
        select: { email: true }
      })
    : null;

  const profileData: PatientProfileData = {
    id: patient.id,
    fullName: patient.fullName,
    patientCode: patient.patientCode,
    age: patient.age,
    gender: patient.gender,
    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString() : null,
    phone: patient.phone,
    address: patient.address,
    emergencyContact: patient.emergencyContact,
    bloodGroup: patient.bloodGroup,
    knownAllergies: patient.knownAllergies,
    existingConditions: patient.existingConditions,
    lastVisit,
    consultationCount: patient._count.consultations,
    accountEmail: linkedUser?.email ?? null
  };

  const serializedConsultations: ConsultationRow[] = patient.consultations.map((c) => ({
    id: c.id,
    createdAt: c.createdAt.toISOString(),
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
    diagnosis: c.diagnosis,
    prescription: c.prescription,
    followUpNotes: c.followUpNotes
  }));

  const medications = patient.medications.map((m) => ({
    id: m.id,
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency
  }));
  const allergies = patient.allergies.map((a) => ({
    id: a.id,
    name: a.name,
    severity: a.severity
  }));
  const investigations = patient.investigations.map((i) => ({
    id: i.id,
    type: i.type,
    result: i.result
  }));
  const conditions = patient.medicalConditions.map((c) => ({
    id: c.id,
    name: c.name,
    notes: c.notes
  }));

  const serializedReports = patientReports.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    symptoms: r.symptoms,
    complaint: r.complaint,
    medicalHistory: r.medicalHistory,
    currentCondition: r.currentCondition,
    duration: r.duration,
    additionalNotes: r.additionalNotes
  }));

  return (
    <div className="min-h-screen">
      <AppHeader doctorName={doctor.name.replace(/^dr\.\s*/i, "").split(" ")[0]} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-5">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← {t("patient.profile.backToDashboard")}
          </Link>
        </div>

        <div className="card mb-6">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{patient.fullName}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                    {patient.patientCode}
                  </span>
                  <span>
                    {patient.age != null ? `${patient.age} yrs` : ""}
                    {patient.gender && ` · ${patient.gender.toLowerCase()}`}
                  </span>
                  <span>
                    {t("patient.profile.lastVisit")}:{" "}
                    {lastVisit ? formatDate(lastVisit) : t("patient.profile.never")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700">
                  {patient._count.consultations}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("patient.profile.consultations")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProfileTabs
          patient={profileData}
          consultations={serializedConsultations}
          medications={medications}
          allergies={allergies}
          investigations={investigations}
          conditions={conditions}
          patientReports={serializedReports}
        />
      </main>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

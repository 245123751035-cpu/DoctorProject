import { redirect } from "next/navigation";
import { currentPatientUser } from "@/lib/auth/current";
import { PatientHeader } from "@/features/layout/patient-header";
import { PatientSymptomsForm } from "@/features/patient/symptoms-form";
import { t } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function PatientSymptomsPage() {
  const patientUser = await currentPatientUser();
  if (!patientUser) redirect("/patient/login");

  const name = patientUser.name.split(" ")[0];

  return (
    <div className="min-h-screen">
      <PatientHeader patientName={name} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-2">{t("patientDashboard.reportSymptoms")}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t("patientDashboard.symptomsHint")}
        </p>
        <PatientSymptomsForm />
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { currentPatientUser } from "@/lib/auth/current";
import { PatientHeader } from "@/features/layout/patient-header";
import { PatientDashboardContent } from "@/features/patient/dashboard-content";
import { t } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const patientUser = await currentPatientUser();
  if (!patientUser) redirect("/patient/login");

  const name = patientUser.name.split(" ")[0];

  return (
    <div className="min-h-screen">
      <PatientHeader patientName={name} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">
            {t("patientDashboard.welcome")}, {patientUser.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("patientDashboard.subtitle")}
          </p>
        </div>
        <PatientDashboardContent />
      </main>
    </div>
  );
}

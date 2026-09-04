import { redirect } from "next/navigation";
import { currentPatientUser } from "@/lib/auth/current";
import { PatientHeader } from "@/features/layout/patient-header";
import { PatientRecordsContent } from "@/features/patient/records-content";
import { PatientChatWidget } from "@/features/patient/chat-widget";
import { t } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function PatientRecordsPage() {
  const patientUser = await currentPatientUser();
  if (!patientUser) redirect("/patient/login");

  const name = patientUser.name.split(" ")[0];

  return (
    <div className="min-h-screen">
      <PatientHeader patientName={name} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">{t("patientDashboard.viewRecords")}</h1>
        <PatientRecordsContent />
      </main>
      <PatientChatWidget />
    </div>
  );
}

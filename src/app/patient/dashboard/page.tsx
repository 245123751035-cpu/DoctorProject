import { redirect } from "next/navigation";
import { currentPatientUser } from "@/lib/auth/current";
import { PatientHeader } from "@/features/layout/patient-header";
import { PatientDashboardContent } from "@/features/patient/dashboard-content";
import { PatientChatWidget } from "@/features/patient/chat-widget";
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
        <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 rounded-2xl px-6 py-7 mb-8 text-white shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {t("auth.login.asPatient")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t("patientDashboard.welcome")}, {patientUser.name}
          </h1>
          <p className="text-green-100 text-sm mt-2">{t("patientDashboard.subtitle")}</p>
        </div>
        <PatientDashboardContent />
      </main>
      <PatientChatWidget />
    </div>
  );
}

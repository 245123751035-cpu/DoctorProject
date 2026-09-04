import { redirect } from "next/navigation";
import Link from "next/link";
import { currentDoctor } from "@/lib/auth/current";
import { AppHeader } from "@/features/layout/app-header";
import { getDashboardStats, getRecentPatients } from "@/services/dashboard";
import { PatientSearch } from "@/features/dashboard/patient-search";
import { t } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const doctor = await currentDoctor();
  if (!doctor) redirect("/login");

  const stats = await getDashboardStats(doctor.id);
  const recentPatients = await getRecentPatients(doctor.id);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("dashboard.greeting") : hour < 17 ? t("dashboard.greetingAfternoon") : t("dashboard.greetingEvening");

  return (
    <div className="min-h-screen">
      <AppHeader doctorName={doctor.name.replace(/^dr\.\s*/i, "").split(" ")[0]} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 rounded-2xl px-6 py-7 mb-8 text-white shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0v-5.25M12 12a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM12 19.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
              {t("auth.login.asDoctor")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {greeting},{" "}
            {doctor.name.startsWith("Dr.")
              ? doctor.name
              : `${t("dashboard.greetingDoctor")} ${doctor.name}`}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label={t("dashboard.totalPatients")}
            value={stats.totalPatients}
            accent="bg-teal-100 text-teal-700"
          />
          <StatCard
            label={t("dashboard.todayConsultations")}
            value={stats.todayConsultations}
            accent="bg-blue-100 text-blue-700"
          />
          <StatCard
            label={t("dashboard.consultations")}
            value={stats.totalConsultations}
            accent="bg-indigo-100 text-indigo-700"
          />
        </div>

        <div className="mb-6">
          <Link href="/patients/register" className="btn-primary">
            + {t("dashboard.registerPatient")}
          </Link>
        </div>

        <div className="card card-body mb-8">
          <h2 className="text-lg font-semibold mb-3">{t("dashboard.findPatient")}</h2>
          <PatientSearch />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">{t("dashboard.recentPatients")}</h2>
          {recentPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("dashboard.noPatients")}</p>
          ) : (
            <ul className="divide-y divide-border border rounded-md bg-white">
              {recentPatients.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.fullName}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 font-mono px-1.5 py-0.5 rounded">
                        {p.patientCode}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.age != null ? `${p.age} yrs` : ""} · {p.gender.toLowerCase()} ·{" "}
                      {p.consultationCount} {t("dashboard.consultationsShort")}
                    </div>
                  </div>
                  <Link href={`/patients/${p.id}`} className="btn-outline text-sm py-1.5">
                    {t("dashboard.open")}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="card card-body flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-opacity-100 flex items-center justify-center font-bold text-2xl ${accent}`}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

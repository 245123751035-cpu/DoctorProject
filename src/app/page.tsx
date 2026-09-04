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
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">
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
          />
          <StatCard
            label={t("dashboard.todayConsultations")}
            value={stats.todayConsultations}
          />
          <StatCard
            label={t("dashboard.consultations")}
            value={stats.totalConsultations}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card card-body">
      <div className="text-3xl font-bold text-blue-700">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

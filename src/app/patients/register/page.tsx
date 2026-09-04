import { redirect } from "next/navigation";
import { currentDoctor } from "@/lib/auth/current";
import { AppHeader } from "@/features/layout/app-header";
import { RegisterPatientForm } from "@/features/patients/register-patient-form";
import { t } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function RegisterPatientPage() {
  const doctor = await currentDoctor();
  if (!doctor) redirect("/login");

  return (
    <div className="min-h-screen">
      <AppHeader doctorName={doctor.name.replace(/^dr\.\s*/i, "").split(" ")[0]} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{t("patient.register.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("patient.register.subtitle")}
          </p>
        </div>
        <div className="card card-body">
          <RegisterPatientForm />
        </div>
      </main>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { currentDoctor } from "@/lib/auth/current";
import { AppHeader } from "@/features/layout/app-header";
import { getPatientById } from "@/services/patient";
import { ConsultationForm } from "@/features/consultations/consultation-form";
import { t } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function NewConsultationPage({
  params
}: {
  params: { id: string };
}) {
  const doctor = await currentDoctor();
  if (!doctor) redirect("/login");

  const patient = await getPatientById(doctor.id, params.id);
  if (!patient) notFound();

  return (
    <div className="min-h-screen">
      <AppHeader doctorName={doctor.name.replace(/^dr\.\s*/i, "").split(" ")[0]} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-5">
          <Link href={`/patients/${patient.id}`} className="text-sm text-blue-600 hover:underline">
            ← {t("patient.profile.backToDashboard")}
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{t("consultation.new.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("consultation.new.subtitle")} <span className="font-medium">{patient.fullName}</span>
          </p>
        </div>
        <div className="card card-body">
          <ConsultationForm patientId={patient.id} patientName={patient.fullName} />
        </div>
      </main>
    </div>
  );
}

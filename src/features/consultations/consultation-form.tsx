"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import { languages } from "@/locales/languages";
import { VoiceTextarea } from "@/components/voice-textarea";

export function ConsultationForm({
  patientId,
  patientName
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    chiefComplaint: "",
    chiefComplaintLang: "en",
    symptoms: "",
    duration: "",
    severity: "",
    medicalHistory: "",
    previousDiagnosis: "",
    currentMedications: "",
    allergies: "",
    previousTreatment: "",
    investigations: "",
    doctorObservations: "",
    assessment: "",
    diagnosis: "",
    prescription: "",
    followUpNotes: ""
  });

  function update(field: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, ...values })
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || t("consultation.new.error"), "error");
        return;
      }
      toast(t("consultation.new.success"), "success");
      router.push(`/patients/${patientId}`);
      router.refresh();
    } catch {
      toast(t("consultation.new.error"), "error");
    } finally {
      setLoading(false);
    }
  }

  const label = "label";
  const input = "input";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card card-body">
        <h3 className="font-semibold mb-3">{t("consultation.new.chiefComplaint")} & Patient Symptoms</h3>
        <div className="space-y-4">
          <VoiceTextarea
            id="chiefComplaint"
            label={t("consultation.new.chiefComplaint") + " *"}
            placeholder={t("consultation.new.chiefComplaintPlaceholder")}
            value={values.chiefComplaint}
            onChange={(v) => update("chiefComplaint", v)}
            required
          />

          <div>
            <label className={label} htmlFor="chiefComplaintLang">
              {t("consultation.new.chiefComplaintLang")}
            </label>
            <select
              id="chiefComplaintLang"
              className={input}
              value={values.chiefComplaintLang}
              onChange={(e) => update("chiefComplaintLang", e.target.value)}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          <VoiceTextarea
            id="symptoms"
            label={t("consultation.new.symptoms")}
            placeholder={t("consultation.new.symptomsPlaceholder")}
            value={values.symptoms}
            onChange={(v) => update("symptoms", v)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={label} htmlFor="duration">
                {t("consultation.new.duration")}
              </label>
              <input
                id="duration"
                className={input}
                placeholder={t("consultation.new.durationPlaceholder")}
                value={values.duration}
                onChange={(e) => update("duration", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="severity">
                {t("consultation.new.severity")}
              </label>
              <select
                id="severity"
                className={input}
                value={values.severity}
                onChange={(e) => update("severity", e.target.value)}
              >
                <option value="">{t("consultation.new.severitySelect")}</option>
                <option value="low">{t("consultation.new.low")}</option>
                <option value="moderate">{t("consultation.new.moderate")}</option>
                <option value="severe">{t("consultation.new.severe")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-body">
        <h3 className="font-semibold mb-3">Medical History & Medications</h3>
        <div className="space-y-4">
          <VoiceTextarea label={t("consultation.new.medicalHistory")} placeholder={t("consultation.new.medicalHistoryPlaceholder")} value={values.medicalHistory} onChange={(v) => update("medicalHistory", v)} />
          <VoiceTextarea label={t("consultation.new.previousDiagnosis")} placeholder={t("consultation.new.previousDiagnosisPlaceholder")} value={values.previousDiagnosis} onChange={(v) => update("previousDiagnosis", v)} />
          <VoiceTextarea label={t("consultation.new.currentMedications")} placeholder={t("consultation.new.currentMedicationsPlaceholder")} value={values.currentMedications} onChange={(v) => update("currentMedications", v)} />
          <VoiceTextarea label={t("consultation.new.allergies")} placeholder={t("consultation.new.allergiesPlaceholder")} value={values.allergies} onChange={(v) => update("allergies", v)} />
          <VoiceTextarea label={t("consultation.new.previousTreatment")} placeholder={t("consultation.new.previousTreatmentPlaceholder")} value={values.previousTreatment} onChange={(v) => update("previousTreatment", v)} />
          <VoiceTextarea label={t("consultation.new.investigations")} placeholder={t("consultation.new.investigationsPlaceholder")} value={values.investigations} onChange={(v) => update("investigations", v)} />
        </div>
      </div>

      <div className="card card-body">
        <h3 className="font-semibold mb-3">Doctor Notes & Clinical Information</h3>
        <div className="space-y-4">
          <VoiceTextarea label={t("consultation.new.doctorObservations")} placeholder={t("consultation.new.doctorObservationsPlaceholder")} value={values.doctorObservations} onChange={(v) => update("doctorObservations", v)} />
          <VoiceTextarea label={t("consultation.new.assessment")} placeholder={t("consultation.new.assessmentPlaceholder")} value={values.assessment} onChange={(v) => update("assessment", v)} />
          <VoiceTextarea label={t("consultation.new.diagnosis")} placeholder={t("consultation.new.diagnosisPlaceholder")} value={values.diagnosis} onChange={(v) => update("diagnosis", v)} />
          <VoiceTextarea label={t("consultation.new.prescription")} placeholder={t("consultation.new.prescriptionPlaceholder")} value={values.prescription} onChange={(v) => update("prescription", v)} />
          <VoiceTextarea label={t("consultation.new.followUpNotes")} placeholder={t("consultation.new.followUpNotesPlaceholder")} value={values.followUpNotes} onChange={(v) => update("followUpNotes", v)} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("consultation.new.saving") : t("consultation.new.submit")}
        </button>
        <Link href={`/patients/${patientId}`} className="btn-outline">
          {t("common.cancel")}
        </Link>
      </div>
    </form>
  );
}

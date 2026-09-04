"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import { VoiceTextarea } from "@/components/voice-textarea";

export function PatientSymptomsForm() {
  const router = useRouter();
  const { t } = useLocale();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    complaint: "",
    symptoms: "",
    medicalHistory: "",
    currentCondition: "",
    duration: "",
    additionalNotes: ""
  });

  function update(field: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/patient-reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || t("patient.symptoms.error"), "error");
        return;
      }
      toast(t("patient.symptoms.success"), "success");
      setValues({ complaint: "", symptoms: "", medicalHistory: "", currentCondition: "", duration: "", additionalNotes: "" });
      router.refresh();
    } catch {
      toast(t("patient.symptoms.error"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="card card-body">
        <h3 className="font-semibold mb-4">{t("patient.symptoms.yourComplaint")}</h3>
        <div className="space-y-4">
          <VoiceTextarea
            id="complaint"
            label={t("patient.symptoms.complaint")}
            placeholder={t("patient.symptoms.complaintPlaceholder")}
            value={values.complaint}
            onChange={(v) => update("complaint", v)}
          />

          <VoiceTextarea
            id="symptoms"
            label={t("patient.symptoms.symptoms")}
            placeholder={t("patient.symptoms.symptomsPlaceholder")}
            value={values.symptoms}
            onChange={(v) => update("symptoms", v)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="duration">{t("patient.symptoms.duration")}</label>
              <input
                id="duration"
                className="input"
                placeholder={t("patient.symptoms.durationPlaceholder")}
                value={values.duration}
                onChange={(e) => update("duration", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="currentCondition">{t("patient.symptoms.currentCondition")}</label>
              <input
                id="currentCondition"
                className="input"
                placeholder={t("patient.symptoms.currentConditionPlaceholder")}
                value={values.currentCondition}
                onChange={(e) => update("currentCondition", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-body">
        <h3 className="font-semibold mb-4">{t("patient.symptoms.yourHistory")}</h3>
        <div className="space-y-4">
          <VoiceTextarea
            id="medicalHistory"
            label={t("patient.symptoms.medicalHistory")}
            placeholder={t("patient.symptoms.medicalHistoryPlaceholder")}
            value={values.medicalHistory}
            onChange={(v) => update("medicalHistory", v)}
          />

          <VoiceTextarea
            id="additionalNotes"
            label={t("patient.symptoms.additionalNotes")}
            placeholder={t("patient.symptoms.additionalNotesPlaceholder")}
            value={values.additionalNotes}
            onChange={(v) => update("additionalNotes", v)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("common.loading") : t("patient.symptoms.submit")}
        </button>
      </div>
    </form>
  );
}

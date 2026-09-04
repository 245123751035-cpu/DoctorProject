"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import { VoiceTextarea } from "@/components/voice-textarea";

export function PatientSymptomsForm() {
  const router = useRouter();
  const { t } = useLocale();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [unlinked, setUnlinked] = useState(false);
  const [values, setValues] = useState({
    complaint: "",
    symptoms: "",
    medicalHistory: "",
    currentCondition: "",
    duration: "",
    additionalNotes: ""
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/patient-profile")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUnlinked(!data.patient);
      })
      .catch(() => {
        if (!cancelled) setUnlinked(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  if (checking) {
    return <div className="text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

  if (unlinked) {
    return (
      <div className="card card-body text-center py-14">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">{t("patientDashboard.noLinkedRecord")}</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          {t("patientDashboard.noLinkedRecordHint")}
        </p>
      </div>
    );
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

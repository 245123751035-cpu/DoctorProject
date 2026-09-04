"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import { languages } from "@/locales/languages";

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  t: (k: string) => string;
}

function VoiceInput({ value, onChange, t }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(false);

  const rec = typeof window !== "undefined" ? getRecognition() : null;

  function getRecognition(): any {
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }

  function start() {
    if (!rec) {
      setError(true);
      return;
    }
    setError(false);
    const r = new rec();
    r.lang = navigator.language || "en-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      onChange(value ? `${value} ${transcript}`.trim() : transcript);
      setListening(false);
    };
    r.onerror = () => {
      setListening(false);
      setError(true);
    };
    r.onend = () => setListening(false);
    setListening(true);
    r.start();
  }

  return (
    <div className="flex items-center gap-2 mb-1.5">
      <button
        type="button"
        onClick={start}
        disabled={listening}
        className="btn-outline text-xs py-1 px-2"
        title={!rec ? t("consultation.voice.unsupported") : undefined}
      >
        {listening ? `${t("consultation.voice.stop")}...` : `🎙 ${t("consultation.voice.start")}`}
      </button>
      {error && (
        <span className="text-xs text-amber-600">{t("consultation.voice.error")}</span>
      )}
    </div>
  );
}

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
      <div>
        <label className={label} htmlFor="chiefComplaint">
          {t("consultation.new.chiefComplaint")} *
        </label>
        <VoiceInput value={values.chiefComplaint} onChange={(v) => update("chiefComplaint", v)} t={t} />
        <textarea
          id="chiefComplaint"
          className="input min-h-[80px]"
          placeholder={t("consultation.new.chiefComplaintPlaceholder")}
          value={values.chiefComplaint}
          onChange={(e) => update("chiefComplaint", e.target.value)}
          required
        />
      </div>

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

      <div>
        <label className={label} htmlFor="symptoms">
          {t("consultation.new.symptoms")}
        </label>
        <VoiceInput value={values.symptoms} onChange={(v) => update("symptoms", v)} t={t} />
        <textarea
          id="symptoms"
          className="input min-h-[80px]"
          placeholder={t("consultation.new.symptomsPlaceholder")}
          value={values.symptoms}
          onChange={(e) => update("symptoms", e.target.value)}
        />
      </div>

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

      <Textarea label={t("consultation.new.medicalHistory")} placeholder={t("consultation.new.medicalHistoryPlaceholder")} value={values.medicalHistory} onChange={(v) => update("medicalHistory", v)} />
      <Textarea label={t("consultation.new.previousDiagnosis")} placeholder={t("consultation.new.previousDiagnosisPlaceholder")} value={values.previousDiagnosis} onChange={(v) => update("previousDiagnosis", v)} />
      <Textarea label={t("consultation.new.currentMedications")} placeholder={t("consultation.new.currentMedicationsPlaceholder")} value={values.currentMedications} onChange={(v) => update("currentMedications", v)} />
      <Textarea label={t("consultation.new.allergies")} placeholder={t("consultation.new.allergiesPlaceholder")} value={values.allergies} onChange={(v) => update("allergies", v)} />
      <Textarea label={t("consultation.new.previousTreatment")} placeholder={t("consultation.new.previousTreatmentPlaceholder")} value={values.previousTreatment} onChange={(v) => update("previousTreatment", v)} />
      <Textarea label={t("consultation.new.investigations")} placeholder={t("consultation.new.investigationsPlaceholder")} value={values.investigations} onChange={(v) => update("investigations", v)} />
      <Textarea label={t("consultation.new.doctorObservations")} placeholder={t("consultation.new.doctorObservationsPlaceholder")} value={values.doctorObservations} onChange={(v) => update("doctorObservations", v)} />
      <Textarea label={t("consultation.new.assessment")} placeholder={t("consultation.new.assessmentPlaceholder")} value={values.assessment} onChange={(v) => update("assessment", v)} />
      <Textarea label={t("consultation.new.followUpNotes")} placeholder={t("consultation.new.followUpNotesPlaceholder")} value={values.followUpNotes} onChange={(v) => update("followUpNotes", v)} />

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

function Textarea({
  label,
  placeholder,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea
        className="input min-h-[70px]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

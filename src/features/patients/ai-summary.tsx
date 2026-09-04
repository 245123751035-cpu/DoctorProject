"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";

interface Summary {
  title: string;
  patientOverview: string;
  keyHistory: string[];
  previousConditions: string[];
  recurringSymptoms: string[];
  medicationsMentioned: string[];
  allergies: string[];
  investigations: string[];
  recentDevelopments: string[];
  itemsForDoctorReview: string[];
  disclaimer: string;
}

export function AISummary({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState(false);
  const { lang, t } = useLocale();
  const { toast } = useToast();

  async function generate() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, language: lang })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(true);
        toast(data.error || t("patient.ai.error"), "error");
        return;
      }
      setSummary(data.summary);
    } catch {
      setError(true);
      toast(t("patient.ai.error"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("patient.ai.title")}</h3>
        <button onClick={generate} className="btn-primary text-sm" disabled={loading}>
          {loading ? t("patient.ai.generating") : t("patient.ai.generate")}
        </button>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">{t("patient.ai.generating")}</div>
      )}

      {error && !summary && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {t("patient.ai.error")}
        </div>
      )}

      {summary && (
        <div className="card card-body space-y-5">
          <h4 className="text-xl font-semibold text-blue-700">{summary.title}</h4>

          <Section
            label={t("patient.ai.keyHistory")}
            items={summary.keyHistory}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section label={t("patient.ai.previousConditions")} items={summary.previousConditions} />
            <Section label={t("patient.ai.recurringSymptoms")} items={summary.recurringSymptoms} />
            <Section label={t("patient.ai.medicationsMentioned")} items={summary.medicationsMentioned} />
            <Section label={t("patient.ai.allergies")} items={summary.allergies} />
            <Section label={t("patient.ai.investigations")} items={summary.investigations} />
          </div>

          <Section label={t("patient.ai.recentDevelopments")} items={summary.recentDevelopments} />
          <Section label={t("patient.ai.itemsForDoctorReview")} items={summary.itemsForDoctorReview} />

          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            {summary.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {label}
      </h5>
      <ul className="space-y-1.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

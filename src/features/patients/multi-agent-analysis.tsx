"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import type {
  AgentStep,
  ClinicalReport,
  HistoryAnalysis,
  LanguageAnalysis,
  MultiAgentAnalysis,
  SymptomAnalysis
} from "@/lib/agents/types";

const AGENT_IDS = ["symptom", "history", "language", "report"] as const;

type AgentLabel = {
  labelKey: string;
  doneKey: string;
};

const AGENT_LABELS: Record<(typeof AGENT_IDS)[number], AgentLabel> = {
  symptom: {
    labelKey: "patient.multiAgent.symptom",
    doneKey: "patient.multiAgent.symptomDone"
  },
  history: {
    labelKey: "patient.multiAgent.history",
    doneKey: "patient.multiAgent.historyDone"
  },
  language: {
    labelKey: "patient.multiAgent.language",
    doneKey: "patient.multiAgent.languageDone"
  },
  report: {
    labelKey: "patient.multiAgent.report",
    doneKey: "patient.multiAgent.reportDone"
  }
};

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function MultiAgentAnalysisPanel({
  patientId,
  consultationId,
  consultationDate
}: {
  patientId: string;
  consultationId?: string;
  consultationDate?: string;
}) {
  const { lang, t } = useLocale();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MultiAgentAnalysis | null>(null);
  const [error, setError] = useState(false);

  async function run() {
    if (loading) return;
    setLoading(true);
    setError(false);
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai/multi-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, consultationId, language: lang })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(true);
        toast(data.error || t("patient.multiAgent.error"), "error");
        return;
      }
      setAnalysis(data.analysis);
    } catch {
      setError(true);
      toast(t("patient.multiAgent.error"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{t("patient.multiAgent.title")}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("patient.multiAgent.subtitle")}
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="btn-outline text-sm inline-flex items-center gap-1.5"
          type="button"
        >
          {loading ? (
            <>
              <Spinner />
              {t("patient.multiAgent.running")}
            </>
          ) : analysis ? (
            t("patient.multiAgent.runAgain")
          ) : (
            t("patient.multiAgent.run")
          )}
        </button>
      </div>

      {error && !analysis && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {t("patient.multiAgent.error")}
        </div>
      )}

      {consultationDate && analysis && (
        <div className="text-xs text-muted-foreground">
          {t("patient.multiAgent.consultationLabel")}: {formatDate(consultationDate)}
        </div>
      )}

      {(loading || analysis) && (
        <AgentProgress
          steps={analysis?.steps ?? null}
          loading={loading}
          t={t}
        />
      )}

      {analysis?.usedFallback && (
        <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800 flex items-start gap-2">
          <span className="font-medium">{t("patient.multiAgent.fallback")}</span>
          <span>{t("patient.multiAgent.fallbackHint")}</span>
        </div>
      )}

      {analysis && <ClinicalReportView report={analysis.report} t={t} />}

      {analysis && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          {analysis.report.disclaimer}
        </p>
      )}
    </div>
  );
}

function AgentProgress({
  steps,
  loading,
  t
}: {
  steps: AgentStep[] | null;
  loading: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-2">
      {AGENT_IDS.map((id) => {
        const labels = AGENT_LABELS[id];
        const step = steps?.find((s) => s.id === id);
        const isDone = Boolean(step && step.status === "done");
        const isProcessing = loading && !isDone;

        return (
          <div
            key={id}
            className="flex items-start gap-3 rounded-md border border-border bg-white px-4 py-3"
          >
            {isDone ? (
              <CheckIcon />
            ) : (
              <span className="mt-0.5 w-5 h-5 shrink-0">
                {isProcessing ? <Spinner /> : <PendingIcon />}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{t(labels.labelKey)}</span>
                {isDone && (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    ✓ {t("patient.multiAgent.done")}
                  </span>
                )}
                {isProcessing && (
                  <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                    {t("patient.multiAgent.processing")}
                  </span>
                )}
                {step?.error && (
                  <span className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                    {t("patient.multiAgent.failed")}
                  </span>
                )}
              </div>
              {step && (
                <p className="text-xs text-muted-foreground mt-1">{step.summary}</p>
              )}
              {step && isDone && <AgentResultDetail step={step} t={t} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgentResultDetail({ step, t }: { step: AgentStep; t: (key: string) => string }) {
  switch (step.id) {
    case "symptom": {
      const r = step.result as SymptomAnalysis | undefined;
      if (!r) return null;
      return (
        <div className="mt-2 space-y-1.5 text-sm">
          <p className="whitespace-pre-wrap">
            <span className="font-medium text-muted-foreground">
              {t("patient.multiAgent.chiefComplaint")}:
            </span>{" "}
            {r.chiefComplaint}
          </p>
          {r.symptoms.length > 0 && (
            <BulletList
              label={t("patient.multiAgent.symptoms")}
              items={r.symptoms}

            />
          )}
          <p>
            <span className="font-medium text-muted-foreground">
              {t("patient.multiAgent.duration")}:
            </span>{" "}
            {r.duration}
            <span className="mx-2">·</span>
            <span className="font-medium text-muted-foreground">
              {t("patient.multiAgent.severity")}:
            </span>{" "}
            {r.severity}
          </p>
        </div>
      );
    }
    case "history": {
      const r = step.result as HistoryAnalysis | undefined;
      if (!r) return null;
      return (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <BulletList
            label={t("patient.multiAgent.recurringSymptoms")}
            items={r.recurringSymptoms}

          />
          <BulletList
            label={t("patient.multiAgent.previousDiagnoses")}
            items={r.previousDiagnoses}

          />
          <BulletList
            label={t("patient.multiAgent.medications")}
            items={r.medications}

          />
          <BulletList
            label={t("patient.multiAgent.allergies")}
            items={r.allergies}

          />
        </div>
      );
    }
    case "language": {
      const r = step.result as LanguageAnalysis | undefined;
      if (!r) return null;
      return (
        <div className="mt-2 space-y-1.5 text-sm">
          <p>
            <span className="font-medium text-muted-foreground">
              {t("patient.multiAgent.detectedLanguage")}:
            </span>{" "}
            {r.languageLabel}
          </p>
          <p className="whitespace-pre-wrap text-muted-foreground">
            <span className="font-medium text-foreground">
              {t("patient.multiAgent.originalText")}:
            </span>{" "}
            {r.originalText || t("patient.multiAgent.noText")}
          </p>
          {r.normalizedText && (
            <p className="whitespace-pre-wrap text-muted-foreground">
              <span className="font-medium text-foreground">
                {t("patient.multiAgent.normalizedText")}:
              </span>{" "}
              {r.normalizedText}
            </p>
          )}
          {r.note && <p className="text-xs text-blue-700">{r.note}</p>}
        </div>
      );
    }
    case "report":
      return null;
    default:
      return null;
  }
}

function BulletList({
  label,
  items
}: {
  label: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span className="whitespace-pre-wrap">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClinicalReportView({
  report,
  t
}: {
  report: ClinicalReport;
  t: (key: string) => string;
}) {
  return (
    <div className="card card-body space-y-5">
      <h4 className="text-xl font-semibold text-blue-700">
        {t("patient.multiAgent.reportTitle")}
      </h4>

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t("patient.multiAgent.chiefComplaint")}
        </div>
        <p className="text-sm whitespace-pre-wrap">{report.chiefComplaint}</p>
      </div>

      <BulletList
        label={t("patient.multiAgent.currentSymptoms")}
        items={report.currentSymptoms}

      />

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t("patient.multiAgent.durationSeverity")}
        </div>
        <p className="text-sm whitespace-pre-wrap">{report.durationAndSeverity}</p>
      </div>

      <BulletList
        label={t("patient.multiAgent.relevantHistory")}
        items={report.relevantMedicalHistory}

      />
      <BulletList
        label={t("patient.multiAgent.previousConditions")}
        items={report.previousConditions}

      />
      <BulletList
        label={t("patient.multiAgent.medications")}
        items={report.medications}

      />
      <BulletList
        label={t("patient.multiAgent.allergies")}
        items={report.allergies}

      />
      <BulletList
        label={t("patient.multiAgent.importantObservations")}
        items={report.importantObservations}

      />
      <BulletList
        label={t("patient.multiAgent.itemsForDoctorReview")}
        items={report.itemsForDoctorReview}

      />
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-3.5 h-3.5 shrink-0">
      <svg className="animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </span>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-green-100 text-green-700">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </span>
  );
}

function PendingIcon() {
  return (
    <span className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  );
}
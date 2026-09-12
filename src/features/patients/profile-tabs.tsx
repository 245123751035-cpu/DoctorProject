"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import { AISummary } from "./ai-summary";
import { MultiAgentAnalysisPanel } from "./multi-agent-analysis";

export interface PatientProfileData {
  id: string;
  fullName: string;
  patientCode: string;
  age: number | null;
  gender: string;
  dateOfBirth: string | null;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  bloodGroup: string | null;
  knownAllergies: string | null;
  existingConditions: string | null;
  lastVisit: string | null;
  consultationCount: number;
  accountEmail?: string | null;
}

export interface Med {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
}
export interface Allg {
  id: string;
  name: string;
  severity: string | null;
}
export interface Invest {
  id: string;
  type: string;
  result: string | null;
}
export interface Cond {
  id: string;
  name: string;
  notes: string | null;
}
export interface ConsultationRow {
  id: string;
  createdAt: string;
  chiefComplaint: string;
  symptoms: string | null;
  duration: string | null;
  severity: string | null;
  medicalHistory: string | null;
  previousDiagnosis: string | null;
  currentMedications: string | null;
  allergies: string | null;
  previousTreatment: string | null;
  investigations: string | null;
  doctorObservations: string | null;
  assessment: string | null;
  diagnosis: string | null;
  prescription: string | null;
  followUpNotes: string | null;
}

type TabKey = "overview" | "history" | "consultations" | "medications" | "allergies" | "investigations" | "reports" | "ai";

export interface PatientReportRow {
  id: string;
  createdAt: string;
  symptoms: string | null;
  complaint: string | null;
  medicalHistory: string | null;
  currentCondition: string | null;
  duration: string | null;
  additionalNotes: string | null;
}

export function ProfileTabs({
  patient,
  consultations,
  medications,
  allergies,
  investigations,
  conditions,
  patientReports = []
}: {
  patient: PatientProfileData;
  consultations: ConsultationRow[];
  medications: Med[];
  allergies: Allg[];
  investigations: Invest[];
  conditions: Cond[];
  patientReports?: PatientReportRow[];
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const { t } = useLocale();

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "overview", label: t("patient.profile.overview") },
    { key: "history", label: t("patient.profile.medicalHistory") },
    { key: "consultations", label: t("patient.profile.consultations") },
    { key: "reports", label: t("patient.profile.patientReports") },
    { key: "medications", label: t("patient.profile.medications") },
    { key: "allergies", label: t("patient.profile.allergies") },
    { key: "investigations", label: t("patient.profile.investigations") },
    { key: "ai", label: t("patient.profile.aiSummary") }
  ];

  return (
    <div>
      <div className="border-b border-border mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                tab === tabItem.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              type="button"
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Link href={`/patients/${patient.id}/consultations/new`} className="btn-primary">
          + {t("patient.profile.newConsultation")}
        </Link>
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <Overview patient={patient} t={t} />
          <AccountLinkCard patientId={patient.id} accountEmail={patient.accountEmail ?? null} />
        </div>
      )}
      {tab === "history" && (
        <History
          conditions={conditions}
          knownAllergies={patient.knownAllergies}
          existingConditions={patient.existingConditions}
          medications={medications}
          allergies={allergies}
          investigations={investigations}
          t={t}
        />
      )}
      {tab === "consultations" && <ConsultationsTab consultations={consultations} t={t} />}
      {tab === "reports" && <PatientReportsTab reports={patientReports} t={t} />}
      {tab === "medications" && <Medications medications={medications} t={t} />}
      {tab === "allergies" && <AllergiesTab allergies={allergies} t={t} />}
      {tab === "investigations" && <InvestigationsTab investigations={investigations} t={t} />}
      {tab === "ai" && (
        <div className="space-y-8">
          <AISummary patientId={patient.id} />
          <div className="border-t border-border pt-8">
            <MultiAgentAnalysisPanel patientId={patient.id} />
          </div>
        </div>
      )}
    </div>
  );
}

function Overview({ patient, t }: { patient: PatientProfileData; t: (k: string) => string }) {
  const rows: Array<{ label: string; value: string }> = [
    {
      label: t("patient.profile.age"),
      value: patient.age != null ? `${patient.age} years` : t("patient.profile.notAvailable")
    },
    { label: t("patient.profile.gender"), value: patient.gender.toLowerCase() },
    { label: t("patient.profile.phone"), value: patient.phone || t("patient.profile.notAvailable") },
    { label: t("patient.profile.address"), value: patient.address || t("patient.profile.notAvailable") },
    {
      label: t("patient.profile.emergencyContact"),
      value: patient.emergencyContact || t("patient.profile.notAvailable")
    },
    {
      label: t("patient.profile.bloodGroup"),
      value: patient.bloodGroup ? formatBloodGroup(patient.bloodGroup) : t("patient.profile.notAvailable")
    },
    {
      label: t("patient.profile.knownAllergies"),
      value: patient.knownAllergies || t("patient.profile.notAvailable")
    },
    {
      label: t("patient.profile.existingConditions"),
      value: patient.existingConditions || t("patient.profile.notAvailable")
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {rows.map((r) => (
        <div key={r.label} className="card card-body">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {r.label}
          </div>
          <div className="text-sm mt-1 font-medium">{r.value}</div>
        </div>
      ))}
    </div>
  );
}

function AccountLinkCard({
  patientId,
  accountEmail
}: {
  patientId: string;
  accountEmail: string | null;
}) {
  const { t } = useLocale();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/patients/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, email })
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || t("patient.profile.linkError"), "error");
        return;
      }
      toast(t("patient.profile.linkSuccess"), "success");
      window.location.reload();
    } catch {
      toast(t("patient.profile.linkError"), "error");
    } finally {
      setBusy(false);
    }
  }

  if (accountEmail) {
    return (
      <div className="card card-body flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("patient.profile.linkedAccount")}
          </div>
          <div className="text-sm font-medium mt-1">{accountEmail}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {t("patient.profile.linked")}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleLink} className="card card-body">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {t("patient.profile.linkAccount")}
      </div>
      <p className="text-sm text-muted-foreground mt-1">{t("patient.profile.linkAccountHint")}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <input
          type="email"
          className="input flex-1 min-w-[220px]"
          placeholder="patient@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn-outline" disabled={busy}>
          {busy ? t("common.loading") : t("patient.profile.linkAccountAction")}
        </button>
      </div>
    </form>
  );
}

function History({
  conditions,
  knownAllergies,
  existingConditions,
  medications,
  allergies,
  investigations,
  t
}: {
  conditions: Cond[];
  knownAllergies: string | null;
  existingConditions: string | null;
  medications: Med[];
  allergies: Allg[];
  investigations: Invest[];
  t: (k: string) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="card card-body">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t("patient.profile.conditions")}
        </h4>
        {conditions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("patient.profile.notAvailable")}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {conditions.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="text-blue-600">•</span>
                {c.name}
                {c.notes && <span className="text-muted-foreground">— {c.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {existingConditions && (
        <div className="card card-body">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("patient.profile.existingConditions")}
          </h4>
          <p className="text-sm whitespace-pre-wrap">{existingConditions}</p>
        </div>
      )}

      {knownAllergies && (
        <div className="card card-body">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("patient.profile.knownAllergies")}
          </h4>
          <p className="text-sm whitespace-pre-wrap">{knownAllergies}</p>
        </div>
      )}

      {medications.length > 0 && (
        <div className="card card-body">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("patient.profile.medications")}
          </h4>
          <p className="text-sm">{medications.map((m) => m.name).join(", ")}</p>
        </div>
      )}

      {allergies.length > 0 && (
        <div className="card card-body">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("patient.profile.allergies")}
          </h4>
          <p className="text-sm">{allergies.map((a) => a.name).join(", ")}</p>
        </div>
      )}

      {investigations.length > 0 && (
        <div className="card card-body">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("patient.profile.investigations")}
          </h4>
          <p className="text-sm">
            {investigations.map((i) => (i.result ? `${i.type}: ${i.result}` : i.type)).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

function ConsultationsTab({ consultations, t }: { consultations: ConsultationRow[]; t: (k: string) => string }) {
  const sorted = [...consultations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  if (sorted.length === 0) {
    return (
      <div className="rounded-md bg-muted border px-4 py-6 text-center text-sm text-muted-foreground">
        {t("patient.profile.noConsultations")}
      </div>
    );
  }
  return (
    <ol className="relative border-l border-border ml-3 space-y-8">
      {sorted.map((c) => (
        <li key={c.id} className="ml-6">
          <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
          <div className="mb-1 text-sm font-semibold text-blue-700">{formatDate(c.createdAt)}</div>
          <div className="card card-body">
            <div className="text-sm font-medium whitespace-pre-wrap">{c.chiefComplaint}</div>
            {c.symptoms && (
              <div className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                <span className="font-medium">Symptoms: </span>
                {c.symptoms}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Medications({ medications, t }: { medications: Med[]; t: (k: string) => string }) {
  if (medications.length === 0)
    return <Empty message={t("patient.profile.noMedications")} />;
  return (
    <ul className="divide-y divide-border border rounded-md bg-white">
      {medications.map((m) => (
        <li key={m.id} className="p-4 text-sm">
          <span className="font-medium">{m.name}</span>
          {m.dosage && <span className="text-muted-foreground"> · {m.dosage}</span>}
          {m.frequency && <span className="text-muted-foreground"> · {m.frequency}</span>}
        </li>
      ))}
    </ul>
  );
}

function AllergiesTab({ allergies, t }: { allergies: Allg[]; t: (k: string) => string }) {
  if (allergies.length === 0) return <Empty message={t("patient.profile.noAllergies")} />;
  return (
    <ul className="divide-y divide-border border rounded-md bg-white">
      {allergies.map((a) => (
        <li key={a.id} className="p-4 text-sm flex items-center gap-2">
          <span className="font-medium">{a.name}</span>
          {a.severity && (
            <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
              {a.severity}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function InvestigationsTab({ investigations, t }: { investigations: Invest[]; t: (k: string) => string }) {
  if (investigations.length === 0)
    return <Empty message={t("patient.profile.noInvestigations")} />;
  return (
    <ul className="divide-y divide-border border rounded-md bg-white">
      {investigations.map((i) => (
        <li key={i.id} className="p-4 text-sm">
          <span className="font-medium">{i.type}</span>
          {i.result && <span className="text-muted-foreground">: {i.result}</span>}
        </li>
      ))}
    </ul>
  );
}

function PatientReportsTab({ reports, t }: { reports: PatientReportRow[]; t: (k: string) => string }) {
  if (reports.length === 0)
    return <Empty message={t("patient.profile.noReports")} />;
  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="card card-body">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Patient Report</span>
          </div>
          <div className="space-y-2 text-sm">
            {r.complaint && (
              <div>
                <div className="font-medium text-muted-foreground">Complaint</div>
                <p className="whitespace-pre-wrap">{r.complaint}</p>
              </div>
            )}
            {r.symptoms && (
              <div>
                <div className="font-medium text-muted-foreground">Symptoms</div>
                <p className="whitespace-pre-wrap">{r.symptoms}</p>
              </div>
            )}
            {r.medicalHistory && (
              <div>
                <div className="font-medium text-muted-foreground">Medical History</div>
                <p className="whitespace-pre-wrap">{r.medicalHistory}</p>
              </div>
            )}
            {r.currentCondition && (
              <div>
                <div className="font-medium text-muted-foreground">Current Condition</div>
                <p className="whitespace-pre-wrap">{r.currentCondition}</p>
              </div>
            )}
            {r.additionalNotes && (
              <div>
                <div className="font-medium text-muted-foreground">Additional Notes</div>
                <p className="whitespace-pre-wrap">{r.additionalNotes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-muted border px-4 py-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatBloodGroup(value: string): string {
  const map: Record<string, string> = {
    A_POS: "A+",
    A_NEG: "A-",
    B_POS: "B+",
    B_NEG: "B-",
    AB_POS: "AB+",
    AB_NEG: "AB-",
    O_POS: "O+",
    O_NEG: "O-",
    UNKNOWN: "Unknown"
  };
  return map[value] ?? value;
}

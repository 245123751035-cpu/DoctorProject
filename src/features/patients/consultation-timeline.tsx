export interface TimelineConsultation {
  id: string;
  createdAt: Date;
  chiefComplaint: string;
  symptoms?: string | null;
  duration?: string | null;
  severity?: string | null;
  medicalHistory?: string | null;
  previousDiagnosis?: string | null;
  currentMedications?: string | null;
  allergies?: string | null;
  previousTreatment?: string | null;
  investigations?: string | null;
  doctorObservations?: string | null;
  assessment?: string | null;
  followUpNotes?: string | null;
}

export function ConsultationTimeline({
  consultations,
  t
}: {
  consultations: TimelineConsultation[];
  t: (k: string) => string;
}) {
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
          <div className="mb-1 text-sm font-semibold text-blue-700">
            {formatDateTime(c.createdAt)}
          </div>
          <div className="card">
            <div className="card-body space-y-3">
              <Field label={t("patient.timeline.chiefComplaint")} value={c.chiefComplaint} bold />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {c.duration && <Field label={t("patient.timeline.duration")} value={c.duration} />}
                {c.severity && <Field label={t("patient.timeline.severity")} value={c.severity} />}
              </div>
              {c.symptoms && <Field label={t("patient.timeline.symptoms")} value={c.symptoms} />}
              {c.medicalHistory && <Field label={t("patient.timeline.medicalHistory")} value={c.medicalHistory} />}
              {c.previousDiagnosis && <Field label={t("patient.timeline.previousDiagnosis")} value={c.previousDiagnosis} />}
              {c.currentMedications && <Field label={t("patient.timeline.currentMedications")} value={c.currentMedications} />}
              {c.allergies && <Field label={t("patient.timeline.allergies")} value={c.allergies} />}
              {c.previousTreatment && <Field label={t("patient.timeline.previousTreatment")} value={c.previousTreatment} />}
              {c.investigations && <Field label={t("patient.timeline.investigations")} value={c.investigations} />}
              {c.doctorObservations && <Field label={t("patient.timeline.doctorObservations")} value={c.doctorObservations} />}
              {c.assessment && <Field label={t("patient.timeline.assessment")} value={c.assessment} />}
              {c.followUpNotes && <Field label={t("patient.timeline.followUpNotes")} value={c.followUpNotes} />}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-sm mt-0.5 whitespace-pre-wrap ${bold ? "font-medium" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function formatDateTime(value: Date): string {
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

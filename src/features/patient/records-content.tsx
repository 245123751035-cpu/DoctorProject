"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/providers/locale-provider";

interface Consultation {
  id: string;
  createdAt: string;
  chiefComplaint: string;
  symptoms: string | null;
  duration: string | null;
  severity: string | null;
  medicalHistory: string | null;
  doctorObservations: string | null;
  assessment: string | null;
  diagnosis: string | null;
  prescription: string | null;
  followUpNotes: string | null;
  doctor?: { name: string };
}

interface PatientReport {
  id: string;
  createdAt: string;
  symptoms: string | null;
  complaint: string | null;
  medicalHistory: string | null;
  currentCondition: string | null;
  duration: string | null;
  additionalNotes: string | null;
}

interface ProfileData {
  consultations: Consultation[];
  patientReports: PatientReport[];
}

export function PatientRecordsContent() {
  const { t } = useLocale();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/patient-profile");
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load records");
          return;
        }
        setData({
          consultations: json.patient.consultations || [],
          patientReports: json.patient.patientReports || []
        });
      } catch {
        setError("Failed to load records");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground">{t("common.loading")}</div>;
  if (error || !data) return <div className="text-red-600">{error || t("common.error")}</div>;

  return (
    <div className="space-y-8">
      {data.consultations.length === 0 && data.patientReports.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-muted-foreground">{t("patientDashboard.noRecords")}</p>
        </div>
      ) : null}

      {data.patientReports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("patientDashboard.myReports")}</h2>
          <div className="space-y-3">
            {data.patientReports.map((report) => (
              <div key={report.id} className="card card-body">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString("en-IN", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{t("patientDashboard.yourReport")}</span>
                </div>
                <div className="space-y-2 text-sm">
                  {report.complaint && (
                    <div>
                      <div className="font-medium text-muted-foreground">{t("patientDashboard.complaint")}</div>
                      <p>{report.complaint}</p>
                    </div>
                  )}
                  {report.symptoms && (
                    <div>
                      <div className="font-medium text-muted-foreground">{t("patientDashboard.symptoms")}</div>
                      <p>{report.symptoms}</p>
                    </div>
                  )}
                  {report.medicalHistory && (
                    <div>
                      <div className="font-medium text-muted-foreground">{t("patientDashboard.medicalHistory")}</div>
                      <p>{report.medicalHistory}</p>
                    </div>
                  )}
                  {report.currentCondition && (
                    <div>
                      <div className="font-medium text-muted-foreground">{t("patientDashboard.currentCondition")}</div>
                      <p>{report.currentCondition}</p>
                    </div>
                  )}
                  {report.additionalNotes && (
                    <div>
                      <div className="font-medium text-muted-foreground">{t("patientDashboard.additionalNotes")}</div>
                      <p>{report.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.consultations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("patientDashboard.doctorRecords")}</h2>
          <div className="space-y-3">
            {data.consultations.map((c) => (
              <div key={c.id} className="card card-body">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString("en-IN", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                  {c.severity && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      c.severity === "severe" ? "bg-red-100 text-red-700" :
                      c.severity === "moderate" ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>{c.severity}</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium">{t("patientDashboard.chiefComplaint")}</div>
                    <p>{c.chiefComplaint}</p>
                  </div>
                  {c.symptoms && (
                    <div>
                      <div className="font-medium text-muted-foreground">{t("patientDashboard.symptoms")}</div>
                      <p>{c.symptoms}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                    {t("patientDashboard.doctorInformation")}
                  </div>
                  <div className="space-y-2 text-sm">
                    {c.doctorObservations && (
                      <div>
                        <div className="font-medium text-muted-foreground">{t("patientDashboard.observations")}</div>
                        <p>{c.doctorObservations}</p>
                      </div>
                    )}
                    {c.assessment && (
                      <div>
                        <div className="font-medium text-muted-foreground">{t("patientDashboard.assessment")}</div>
                        <p>{c.assessment}</p>
                      </div>
                    )}
                    {c.diagnosis && (
                      <div>
                        <div className="font-medium text-muted-foreground">{t("patientDashboard.diagnosis")}</div>
                        <p>{c.diagnosis}</p>
                      </div>
                    )}
                    {c.prescription && (
                      <div>
                        <div className="font-medium text-muted-foreground">{t("patientDashboard.prescription")}</div>
                        <p>{c.prescription}</p>
                      </div>
                    )}
                    {c.followUpNotes && (
                      <div>
                        <div className="font-medium text-muted-foreground">{t("patientDashboard.followUp")}</div>
                        <p>{c.followUpNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";

interface PatientProfile {
  id: string;
  fullName: string;
  patientCode: string;
  age: number | null;
  gender: string;
  phone: string | null;
  address: string | null;
  bloodGroup: string | null;
  knownAllergies: string | null;
  existingConditions: string | null;
  doctor: { name: string; clinicName: string | null };
  consultations: any[];
  patientReports: any[];
  medications: any[];
  allergies: any[];
  medicalConditions: any[];
}

export function PatientDashboardContent() {
  const { t } = useLocale();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/patient-profile");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load profile");
          return;
        }
        setProfile(data.patient);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

  if (error) {
    return (
      <div className="card card-body">
        <p className="text-red-600">{error || t("common.error")}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card card-body text-center py-14">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-green-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card card-body">
          <h3 className="text-lg font-semibold mb-3">{t("patientDashboard.myProfile")}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("patient.profile.patientCode")}</span>
              <span className="font-mono bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                {profile.patientCode}
              </span>
            </div>
            {profile.age != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("patient.profile.age")}</span>
                <span>{profile.age} years</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("patient.profile.gender")}</span>
              <span>{profile.gender.toLowerCase()}</span>
            </div>
            {profile.doctor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("patientDashboard.doctor")}</span>
                <span>{profile.doctor.name}</span>
              </div>
            )}
            {profile.doctor?.clinicName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("patientDashboard.clinic")}</span>
                <span>{profile.doctor.clinicName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card card-body">
          <h3 className="text-lg font-semibold mb-3">{t("patientDashboard.summary")}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{profile.consultations.length}</div>
              <div className="text-xs text-muted-foreground">{t("patientDashboard.visits")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{profile.patientReports.length}</div>
              <div className="text-xs text-muted-foreground">{t("patientDashboard.myReports")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{profile.medications.length}</div>
              <div className="text-xs text-muted-foreground">{t("patientDashboard.medications")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/patient/symptoms" className="card card-body hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">{t("patientDashboard.reportSymptoms")}</div>
              <div className="text-xs text-muted-foreground">{t("patientDashboard.reportSymptomsHint")}</div>
            </div>
          </div>
        </Link>

        <Link href="/patient/records" className="card card-body hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">{t("patientDashboard.viewRecords")}</div>
              <div className="text-xs text-muted-foreground">{t("patientDashboard.viewRecordsHint")}</div>
            </div>
          </div>
        </Link>

        <div className="card card-body">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">{profile.fullName}</div>
              <div className="text-xs text-muted-foreground">{profile.existingConditions || t("patientDashboard.noConditions")}</div>
            </div>
          </div>
        </div>
      </div>

      {profile.consultations.length > 0 && (
        <div className="card card-body">
          <h3 className="text-lg font-semibold mb-3">{t("patientDashboard.recentVisits")}</h3>
          <ul className="divide-y divide-border">
            {profile.consultations.slice(0, 5).map((c: any) => (
              <li key={c.id} className="py-3">
                <div className="text-sm font-medium">{c.chiefComplaint}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  {c.severity && ` · ${c.severity}`}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {profile.knownAllergies && (
        <div className="card card-body">
          <h3 className="text-sm font-semibold mb-2">{t("patient.profile.knownAllergies")}</h3>
          <p className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">{profile.knownAllergies}</p>
        </div>
      )}
    </div>
  );
}

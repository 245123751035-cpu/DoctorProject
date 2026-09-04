"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useRouter } from "next/navigation";

interface PatientRow {
  id: string;
  patientCode: string;
  fullName: string;
  age: number | null;
  gender: string;
  lastConsultationAt: string | null;
  consultationCount: number;
}

export function PatientSearch() {
  const router = useRouter();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(false);
    setSearched(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.results ?? []);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input"
          placeholder={t("dashboard.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t("dashboard.findPatient")}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("common.loading") : t("dashboard.search")}
        </button>
      </form>
      <p className="text-xs text-muted-foreground mt-2">
        {t("dashboard.findPatientHint")}
      </p>

      {searched && !loading && !error && results.length === 0 && (
        <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          {t("patient.search.notFound")}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {t("common.error")}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">
            {t("patient.search.title")}
          </h3>
          <ul className="divide-y divide-border border rounded-md bg-white">
            {results.map((p) => (
              <li key={p.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.fullName}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 font-mono px-1.5 py-0.5 rounded">
                      {p.patientCode}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {p.age != null ? `${p.age} yrs` : ""} · {p.gender.toLowerCase()} ·{" "}
                    {p.consultationCount} {t("dashboard.consultationsShort")} ·{" "}
                    {t("dashboard.lastVisit")}:{" "}
                    {p.lastConsultationAt ? formatDate(p.lastConsultationAt) : t("dashboard.never")}
                  </div>
                </div>
                <Link href={`/patients/${p.id}`} className="btn-outline text-sm py-1.5">
                  {t("dashboard.open")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageSelector } from "@/components/language-selector";
import { useLocale } from "@/components/providers/locale-provider";

export function PatientHeader({ patientName }: { patientName: string }) {
  const router = useRouter();
  const { t } = useLocale();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/patient/login");
    router.refresh();
  }

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/patient/dashboard" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold">
              {t("brand.title").charAt(0)}
            </span>
            <span className="font-semibold text-lg">{t("brand.title")}</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/patient/dashboard" className="text-foreground hover:text-green-600">
              {t("nav.dashboard")}
            </Link>
            <Link href="/patient/records" className="text-foreground hover:text-green-600">
              {t("nav.myRecords")}
            </Link>
            <Link href="/patient/symptoms" className="text-foreground hover:text-green-600">
              {t("nav.reportSymptoms")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <span className="text-sm text-muted-foreground hidden md:inline">
            {patientName}
          </span>
          <button
            onClick={handleLogout}
            className="btn-outline text-sm py-1.5"
            type="button"
          >
            {t("nav.logout")}
          </button>
        </div>
      </div>
    </header>
  );
}

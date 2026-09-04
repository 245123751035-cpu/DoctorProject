"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";

export function PatientRegisterForm() {
  const router = useRouter();
  const { t } = useLocale();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    patientCode: ""
  });

  function update(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/patient-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || t("auth.patient.register.error"), "error");
        return;
      }
      toast(t("auth.patient.register.success"), "success");
      router.push("/patient/dashboard");
      router.refresh();
    } catch {
      toast(t("auth.patient.register.error"), "error");
    } finally {
      setLoading(false);
    }
  }

  const input = "input";
  const label = "label";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700">{t("brand.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("brand.subtitle")}</p>
      </div>

      <div className="card w-full max-w-lg">
        <div className="card-header">
          <h2 className="text-xl font-semibold">{t("auth.patient.register.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("auth.patient.register.subtitle")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div>
            <label className={label} htmlFor="patientCode">
              {t("auth.patient.register.patientCode")} *
            </label>
            <input
              id="patientCode"
              className={input}
              placeholder="e.g. MX-6660"
              value={values.patientCode}
              onChange={update("patientCode")}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("auth.patient.register.patientCodeHint")}
            </p>
          </div>
          <div>
            <label className={label} htmlFor="name">
              {t("auth.register.name")} *
            </label>
            <input
              id="name"
              className={input}
              placeholder="Your full name"
              value={values.name}
              onChange={update("name")}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="email">
              {t("auth.register.email")} *
            </label>
            <input
              id="email"
              type="email"
              className={input}
              placeholder="patient@example.com"
              value={values.email}
              onChange={update("email")}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="password">
              {t("auth.register.password")} *
            </label>
            <input
              id="password"
              type="password"
              className={input}
              placeholder={t("auth.register.passwordPlaceholder")}
              value={values.password}
              onChange={update("password")}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className={label} htmlFor="phone">
              {t("auth.register.phone")}
            </label>
            <input
              id="phone"
              className={input}
              placeholder="Phone number"
              value={values.phone}
              onChange={update("phone")}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? t("common.loading") : t("auth.patient.register.submit")}
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {t("auth.patient.register.hasAccount")}{" "}
        <Link href="/patient/login" className="text-blue-600 hover:underline">
          {t("auth.patient.register.loginLink")}
        </Link>
      </p>
    </div>
  );
}

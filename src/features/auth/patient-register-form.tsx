"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import { VoiceInput } from "@/components/voice-input";

export function PatientRegisterForm() {
  const router = useRouter();
  const { t } = useLocale();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
        if (data.details && typeof data.details === "object") {
          setFieldErrors(data.details);
        } else {
          toast(data.error || t("auth.patient.register.error"), "error");
        }
        return;
      }
      setFieldErrors({});
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

  function FieldError({ field }: { field: keyof typeof values }) {
    const msg = fieldErrors[field];
    if (!msg) return null;
    return <p className="text-xs text-red-600 mt-1">{msg}</p>;
  }

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
          {Object.keys(fieldErrors).length > 0 && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              Please fix the highlighted fields below before submitting.
            </div>
          )}
          <div>
            <label className={label} htmlFor="patientCode">
              {t("auth.patient.register.patientCode")} *
            </label>
            <input
              id="patientCode"
              className={`${input} ${fieldErrors.patientCode ? "border-red-400" : ""}`}
              placeholder="e.g. MX-6660"
              value={values.patientCode}
              onChange={update("patientCode")}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("auth.patient.register.patientCodeHint")}
            </p>
            <FieldError field="patientCode" />
          </div>
          <div>
            <label className={label} htmlFor="name">
              {t("auth.register.name")} *
            </label>
            <VoiceInput
              id="name"
              placeholder="Your full name"
              value={values.name}
              onChange={(v) => setValues((s) => ({ ...s, name: v }))}
              required
              className={`${input} ${fieldErrors.name ? "border-red-400" : ""}`}
            />
            <FieldError field="name" />
          </div>
          <div>
            <label className={label} htmlFor="email">
              {t("auth.register.email")} *
            </label>
            <input
              id="email"
              type="email"
              className={`${input} ${fieldErrors.email ? "border-red-400" : ""}`}
              placeholder="patient@example.com"
              value={values.email}
              onChange={update("email")}
              required
            />
            <FieldError field="email" />
          </div>
          <div>
            <label className={label} htmlFor="password">
              {t("auth.register.password")} *
            </label>
            <input
              id="password"
              type="password"
              className={`${input} ${fieldErrors.password ? "border-red-400" : ""}`}
              placeholder={t("auth.register.passwordPlaceholder")}
              value={values.password}
              onChange={update("password")}
              required
              minLength={8}
            />
            <FieldError field="password" />
          </div>
          <div>
            <label className={label} htmlFor="phone">
              {t("auth.register.phone")}
            </label>
            <VoiceInput
              id="phone"
              placeholder="Phone number"
              value={values.phone}
              onChange={(v) => setValues((s) => ({ ...s, phone: v }))}
              className={`${input} ${fieldErrors.phone ? "border-red-400" : ""}`}
            />
            <FieldError field="phone" />
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

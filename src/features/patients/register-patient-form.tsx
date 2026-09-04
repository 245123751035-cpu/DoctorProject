"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import { languages } from "@/locales/languages";
import { VoiceInput } from "@/components/voice-input";

const BLOOD_GROUPS = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG", "UNKNOWN"];

export function RegisterPatientForm() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; patientCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    fullName: "",
    dateOfBirth: "",
    age: "",
    gender: "" as string,
    phone: "",
    address: "",
    emergencyContact: "",
    bloodGroup: "",
    knownAllergies: "",
    existingConditions: "",
    preferredLanguage: "en"
  });

  function update(field: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        ...values,
        age: values.age ? Number(values.age) : null,
        gender: values.gender as "MALE" | "FEMALE" | "OTHER",
        bloodGroup: values.bloodGroup || undefined,
        dateOfBirth: values.dateOfBirth || null
      };
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details && typeof data.details === "object") {
          setFieldErrors(data.details);
          setCreated(null);
        } else {
          toast(data.error || t("patient.register.error"), "error");
        }
        return;
      }
      setValues((v) => ({
        ...v,
        fullName: "",
        dateOfBirth: "",
        age: "",
        phone: "",
        address: "",
        emergencyContact: "",
        bloodGroup: "",
        knownAllergies: "",
        existingConditions: ""
      }));
      setCreated(data.patient);
      setFieldErrors({});
      toast(data.patient?.patientCode ? `Patient ${data.patient.patientCode} registered.` : "Patient registered.", "success");
    } catch {
      toast(t("patient.register.error"), "error");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.patientCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (created) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card card-body text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl mb-4">
            ✓
          </div>
          <h2 className="text-xl font-semibold mb-1">{t("patient.register.successTitle")}</h2>
          <div className="my-5">
            <div className="text-sm text-muted-foreground mb-1">
              {t("patient.register.patientCode")}
            </div>
            <div className="text-4xl font-bold font-mono text-blue-700 tracking-widest">
              {created.patientCode}
            </div>
            <button
              onClick={copyCode}
              className="mt-3 btn-outline text-sm"
              type="button"
            >
              {copied ? t("patient.register.copied") : t("patient.register.copy")}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            {t("patient.register.successHint")}
          </p>
          <div className="flex flex-col gap-2">
            <Link href={`/patients/${created.id}`} className="btn-primary w-full">
              {t("patient.register.openProfile")}
            </Link>
            <button
              onClick={() => setCreated(null)}
              className="btn-outline w-full"
              type="button"
            >
              {t("patient.register.registerAnother")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const label = "label";
  const input = "input";

  function FieldError({ field }: { field: keyof typeof values }) {
    const msg = fieldErrors[field];
    if (!msg) return null;
    return <p className="text-xs text-red-600 mt-1">{msg}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.keys(fieldErrors).length > 0 && (
        <div className="md:col-span-2 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Please fix the highlighted fields below before saving.
        </div>
      )}
      <div className="md:col-span-2">
        <label className={label} htmlFor="fullName">
          {t("patient.register.fullName")} *
        </label>
        <VoiceInput
          id="fullName"
          required
          placeholder={t("patient.register.fullNamePlaceholder")}
          value={values.fullName}
          onChange={(v) => update("fullName", v)}
          className={`${input} ${fieldErrors.fullName ? "border-red-400" : ""}`}
        />
        <FieldError field="fullName" />
      </div>

      <div>
        <label className={label} htmlFor="dateOfBirth">
          {t("patient.register.dateOfBirth")}
        </label>
        <input
          id="dateOfBirth"
          type="date"
          className={`${input} ${fieldErrors.dateOfBirth ? "border-red-400" : ""}`}
          value={values.dateOfBirth}
          onChange={(e) => update("dateOfBirth", e.target.value)}
        />
        <FieldError field="dateOfBirth" />
      </div>

      <div>
        <label className={label} htmlFor="age">
          {t("patient.register.orAge")}
        </label>
        <input
          id="age"
          type="number"
          min={0}
          max={120}
          className={`${input} ${fieldErrors.age ? "border-red-400" : ""}`}
          placeholder={t("patient.register.agePlaceholder")}
          value={values.age}
          onChange={(e) => update("age", e.target.value)}
        />
        <FieldError field="age" />
      </div>

      <div>
        <label className={label} htmlFor="gender">
          {t("patient.register.gender")} *
        </label>
        <select
          id="gender"
          className={`${input} ${fieldErrors.gender ? "border-red-400" : ""}`}
          value={values.gender}
          onChange={(e) => update("gender", e.target.value)}
          required
        >
          <option value="" disabled>
            {t("common.required")}
          </option>
          <option value="MALE">{t("patient.register.male")}</option>
          <option value="FEMALE">{t("patient.register.female")}</option>
          <option value="OTHER">{t("patient.register.other")}</option>
        </select>
        <FieldError field="gender" />
      </div>

      <div>
        <label className={label} htmlFor="phone">
          {t("patient.register.phone")}
        </label>
        <VoiceInput
          id="phone"
          placeholder={t("patient.register.phonePlaceholder")}
          value={values.phone}
          onChange={(v) => update("phone", v)}
          className={`${input} ${fieldErrors.phone ? "border-red-400" : ""}`}
        />
        <FieldError field="phone" />
      </div>

      <div>
        <label className={label} htmlFor="bloodGroup">
          {t("patient.register.bloodGroup")}
        </label>
        <select
          id="bloodGroup"
          className={`${input} ${fieldErrors.bloodGroup ? "border-red-400" : ""}`}
          value={values.bloodGroup}
          onChange={(e) => update("bloodGroup", e.target.value)}
        >
          <option value="">—</option>
          {BLOOD_GROUPS.map((b) => (
            <option key={b} value={b}>
              {b.replace("_", "+")}
            </option>
          ))}
        </select>
        <FieldError field="bloodGroup" />
      </div>

      <div>
        <label className={label} htmlFor="emergencyContact">
          {t("patient.register.emergencyContact")}
        </label>
        <VoiceInput
          id="emergencyContact"
          placeholder={t("patient.register.emergencyContactPlaceholder")}
          value={values.emergencyContact}
          onChange={(v) => update("emergencyContact", v)}
          className={`${input} ${fieldErrors.emergencyContact ? "border-red-400" : ""}`}
        />
        <FieldError field="emergencyContact" />
      </div>

      <div className="md:col-span-2">
        <label className={label} htmlFor="address">
          {t("patient.register.address")}
        </label>
        <VoiceInput
          id="address"
          placeholder={t("patient.register.addressPlaceholder")}
          value={values.address}
          onChange={(v) => update("address", v)}
          className={`${input} ${fieldErrors.address ? "border-red-400" : ""}`}
        />
        <FieldError field="address" />
      </div>

      <div className="md:col-span-2">
        <label className={label} htmlFor="knownAllergies">
          {t("patient.register.knownAllergies")}
        </label>
        <VoiceInput
          id="knownAllergies"
          placeholder={t("patient.register.knownAllergiesPlaceholder")}
          value={values.knownAllergies}
          onChange={(v) => update("knownAllergies", v)}
          className={`${input} ${fieldErrors.knownAllergies ? "border-red-400" : ""}`}
        />
        <FieldError field="knownAllergies" />
      </div>

      <div className="md:col-span-2">
        <label className={label} htmlFor="existingConditions">
          {t("patient.register.existingConditions")}
        </label>
        <VoiceInput
          id="existingConditions"
          placeholder={t("patient.register.existingConditionsPlaceholder")}
          value={values.existingConditions}
          onChange={(v) => update("existingConditions", v)}
          className={`${input} ${fieldErrors.existingConditions ? "border-red-400" : ""}`}
        />
        <FieldError field="existingConditions" />
      </div>

      <div className="md:col-span-2">
        <label className={label} htmlFor="preferredLanguage">
          {t("patient.register.preferredLanguage")}
        </label>
        <select
          id="preferredLanguage"
          className={input}
          value={values.preferredLanguage}
          onChange={(e) => update("preferredLanguage", e.target.value)}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("common.loading") : t("patient.register.submit")}
        </button>
        <Link href="/" className="btn-outline">
          {t("common.cancel")}
        </Link>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { useToast } from "@/components/ui/toast";
import { LanguageSelector } from "@/components/language-selector";

export function LoginForm() {
  const router = useRouter();
  const { t } = useLocale();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || t("auth.login.error"), "error");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      toast(t("auth.login.genericError"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute top-5 right-5">
        <LanguageSelector />
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700">{t("brand.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("brand.subtitle")}</p>
      </div>

      <div className="card w-full max-w-md">
        <div className="card-header">
          <h2 className="text-xl font-semibold">{t("auth.login.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("auth.login.subtitle")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div>
            <label className="label" htmlFor="email">
              {t("auth.login.email")}
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder={t("auth.login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              {t("auth.login.password")}
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder={t("auth.login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? t("common.loading") : t("auth.login.submit")}
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {t("auth.login.noAccount")}{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          {t("auth.login.registerLink")}
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useLocale } from "@/components/providers/locale-provider";

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

export function DemoLogin({
  accounts,
  onLogin
}: {
  accounts: DemoAccount[];
  onLogin: (email: string, password: string) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="mt-4 w-full max-w-md rounded-xl border border-dashed border-blue-200 bg-blue-50/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
          {t("auth.login.demoTitle")}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{t("auth.login.demoHint")}</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {accounts.map((account) => (
          <button
            key={account.email}
            type="button"
            onClick={() => onLogin(account.email, account.password)}
            className="flex items-center justify-between gap-2 rounded-md bg-white border border-blue-100 px-3 py-2 text-left hover:border-blue-300 hover:shadow-sm transition-all text-sm"
          >
            <span className="font-medium text-foreground">{account.label}</span>
            <span className="text-xs text-muted-foreground font-mono">{account.email}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
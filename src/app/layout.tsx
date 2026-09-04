import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getServerLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "CaseTaker — Patient Case-Taking Software",
  description:
    "Multilingual patient case-taking and longitudinal medical-history software for doctors."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const lang = getServerLocale();

  return (
    <html lang={lang}>
      <body>
        <LocaleProvider lang={lang}>
          <ToastProvider>{children}</ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

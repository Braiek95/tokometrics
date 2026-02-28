"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/providers/language-provider";
import { ThemeProvider } from "next-themes";

function LegalNav() {
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="flex items-center gap-6 text-sm text-muted-foreground">
      <Link href="/privacy" className="hover:text-foreground transition-colors">
        {language === "zh" ? "隐私政策" : "Privacy Policy"}
      </Link>
      <Link href="/terms" className="hover:text-foreground transition-colors">
        {language === "zh" ? "服务条款" : "Terms of Service"}
      </Link>
      <button
        onClick={() => setLanguage(language === "en" ? "zh" : "en")}
        className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
      >
        {language === "en" ? "中文" : "English"}
      </button>
      <Link href="/login" className="hover:text-foreground transition-colors">
        {language === "zh" ? "登录" : "Login"}
      </Link>
    </nav>
  );
}

function LegalContent({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-4 w-4" />
            </div>
            TokoMetrics
          </Link>
          <LegalNav />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">{children}</main>

      <footer className="border-t mt-16">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TokoMetrics. {language === "zh" ? "版权所有" : "All rights reserved"}.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {language === "zh" ? "隐私政策" : "Privacy Policy"}
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {language === "zh" ? "服务条款" : "Terms of Service"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <LegalContent>{children}</LegalContent>
      </LanguageProvider>
    </ThemeProvider>
  );
}

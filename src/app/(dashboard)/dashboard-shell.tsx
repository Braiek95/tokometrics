"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import type { ShopItem } from "@/components/layout/shop-switcher";

interface DashboardShellProps {
  shops: ShopItem[];
  children: React.ReactNode;
}

export function DashboardShell({ shops, children }: DashboardShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full">
        <div className="w-[var(--sidebar-width)] bg-sidebar border-r" />
        <div className="flex-1 flex flex-col">
          <div className="h-14 border-b" />
          <div className="flex-1 p-4">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar shops={shops} />
      <SidebarInset>
        <Header />
        <PageTransition>{children}</PageTransition>
        <footer className="mt-auto border-t px-4 py-3 text-xs text-muted-foreground/60 flex items-center justify-between">
          <span>© {new Date().getFullYear()} TokoMetrics</span>
          <div className="flex gap-3">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

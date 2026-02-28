"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { breadcrumbContainer, breadcrumbItem } from "@/lib/animations";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

interface Breadcrumb {
  label: string;
  href?: string;
}

function useBreadcrumbs(): Breadcrumb[] {
  const pathname = usePathname();
  const params = useParams();
  const { language } = useLanguage();
  const shopId = params.shopId as string | undefined;

  const breadcrumbs: Breadcrumb[] = [];

  if (pathname === "/shops") {
    breadcrumbs.push({ label: t(language, "myShops") });
    return breadcrumbs;
  }

  if (pathname === "/settings") {
    breadcrumbs.push({ label: t(language, "settings") });
    return breadcrumbs;
  }

  if (shopId && pathname.startsWith(`/shop/${shopId}`)) {
    breadcrumbs.push({ label: t(language, "myShops"), href: "/shops" });
    const subPath = pathname.replace(`/shop/${shopId}`, "");
    if (!subPath || subPath === "/") {
      breadcrumbs.push({ label: t(language, "overview") });
    } else if (subPath === "/orders") {
      breadcrumbs.push({ label: t(language, "orders") });
    } else if (subPath === "/products") {
      breadcrumbs.push({ label: t(language, "products") });
    } else if (subPath === "/revenue") {
      breadcrumbs.push({ label: t(language, "revenue") });
    } else if (subPath === "/settings") {
      breadcrumbs.push({ label: t(language, "settings") });
    } else {
      const segment = subPath.split("/").filter(Boolean)[0];
      if (segment) {
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
        });
      }
    }
    return breadcrumbs;
  }

  const segments = pathname.split("/").filter(Boolean);
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    breadcrumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : `/${segments.slice(0, index + 1).join("/")}`,
    });
  });

  return breadcrumbs;
}

export function Header() {
  const breadcrumbs = useBreadcrumbs();
  const pathname = usePathname();

  return (
    <motion.header
      className="flex h-14 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Breadcrumbs — re-stagger on every route change */}
        <nav aria-label="Breadcrumb">
          <AnimatePresence mode="wait">
            <motion.ol
              key={pathname}
              className="flex items-center gap-1"
              variants={breadcrumbContainer}
              initial="hidden"
              animate="visible"
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <motion.li
                    key={`${crumb.label}-${index}`}
                    className="flex items-center gap-1"
                    variants={breadcrumbItem}
                  >
                    {index > 0 && (
                      <ChevronRight className="size-3.5 text-muted-foreground/50" />
                    )}
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className={cn(
                          "text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                        )}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          "text-sm",
                          isLast
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </motion.ol>
          </AnimatePresence>
        </nav>
      </div>

      {/* Right side — slide in from right */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <LanguageToggle />
        <ThemeToggle />
      </motion.div>
    </motion.header>
  );
}

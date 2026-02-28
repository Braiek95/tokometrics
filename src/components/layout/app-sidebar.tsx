"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  Store,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ShopSwitcher, type ShopItem } from "@/components/layout/shop-switcher";
import { UserNav } from "@/components/layout/user-nav";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { stagger, fadeUp } from "@/lib/animations";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  shops: ShopItem[];
}

const SHOP_NAV = [
  { titleKey: "dashboard" as const, icon: LayoutDashboard, path: "" },
  { titleKey: "orders" as const, icon: ShoppingCart, path: "/orders" },
  { titleKey: "products" as const, icon: Package, path: "/products" },
  { titleKey: "revenue" as const, icon: DollarSign, path: "/revenue" },
  { titleKey: "settings" as const, icon: Settings, path: "/settings" },
];

const GENERAL_NAV = [
  { titleKey: "shops" as const, icon: Store, href: "/shops" },
  { titleKey: "settings" as const, icon: Settings, href: "/settings" },
];

interface AnimatedNavItemProps {
  href: string;
  isActive: boolean;
  icon: React.ElementType;
  label: string;
  index: number;
}

function AnimatedNavItem({ href, isActive, icon: Icon, label, index }: AnimatedNavItemProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
    >
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
          <Link href={href} className="relative overflow-hidden">
            {/* Active background pill */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-md bg-sidebar-accent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  style={{ zIndex: 0 }}
                />
              )}
            </AnimatePresence>
            <motion.span
              className="relative z-10 flex items-center gap-2"
              whileHover={{ x: isActive ? 0 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </motion.span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </motion.div>
  );
}

export function AppSidebar({ shops, ...props }: AppSidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const { language } = useLanguage();
  const shopId = params.shopId as string | undefined;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-10 items-center px-2"
        >
          <Logo size={28} showText={true} />
        </motion.div>
      </SidebarHeader>

      <SidebarContent>
        {/* Shop Switcher */}
        <SidebarGroup>
          <SidebarGroupLabel>{t(language, "sidebarShop")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <ShopSwitcher shops={shops} currentShopId={shopId ?? null} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {shopId ? (
          <SidebarGroup>
            <SidebarGroupLabel>{t(language, "sidebarNavigation")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <motion.div
                  variants={stagger(0.05, 0.1)}
                  initial="hidden"
                  animate="visible"
                >
                  {SHOP_NAV.map((item, i) => {
                    const href = `/shop/${shopId}${item.path}`;
                    const isActive =
                      item.path === ""
                        ? pathname === `/shop/${shopId}`
                        : pathname.startsWith(href);

                    return (
                      <AnimatedNavItem
                        key={item.titleKey}
                        href={href}
                        isActive={isActive}
                        icon={item.icon}
                        label={t(language, item.titleKey)}
                        index={i}
                      />
                    );
                  })}
                </motion.div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>{t(language, "sidebarNavigation")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <motion.div
                  variants={stagger(0.05, 0.1)}
                  initial="hidden"
                  animate="visible"
                >
                  {GENERAL_NAV.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                      <AnimatedNavItem
                        key={item.titleKey}
                        href={item.href}
                        isActive={isActive}
                        icon={item.icon}
                        label={t(language, item.titleKey)}
                        index={i}
                      />
                    );
                  })}
                </motion.div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <UserNav />
        </motion.div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

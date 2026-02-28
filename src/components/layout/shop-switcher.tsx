"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, Plus, Store } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ShopItem {
  id: string;
  name: string;
  status: string;
  avatarUrl?: string | null;
}

interface ShopSwitcherProps {
  shops: ShopItem[];
  currentShopId: string | null;
}

const statusColorMap: Record<string, string> = {
  ACTIVE: "bg-green-500/15 text-green-700 dark:text-green-400",
  PENDING: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  CONNECTING: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  DISCONNECTED: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  ERROR: "bg-red-500/15 text-red-700 dark:text-red-400",
};

function getShopInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ShopSwitcher({ shops, currentShopId }: ShopSwitcherProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { isMobile } = useSidebar();
  const [open, setOpen] = React.useState(false);

  const currentShop = shops.find((shop) => shop.id === currentShopId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {currentShop ? (
                <>
                  <Avatar size="sm">
                    <AvatarImage
                      src={currentShop.avatarUrl ?? undefined}
                      alt={currentShop.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getShopInitials(currentShop.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {currentShop.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {currentShop.status.toLowerCase()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-6 items-center justify-center rounded-md bg-muted">
                    <Store className="size-3.5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Select a Shop</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {shops.length} shop{shops.length !== 1 ? "s" : ""}{" "}
                      available
                    </span>
                  </div>
                </>
              )}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] min-w-56 rounded-lg p-0"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <Command>
              <CommandInput placeholder={t(language, "searchShops")} />
              <CommandList>
                <CommandEmpty>No shops found.</CommandEmpty>
                <CommandGroup heading={t(language, "myShops")}>
                  {shops.map((shop) => (
                    <CommandItem
                      key={shop.id}
                      value={shop.name}
                      onSelect={() => {
                        router.push(`/shop/${shop.id}`);
                        setOpen(false);
                      }}
                      className="gap-2"
                    >
                      <Avatar size="sm">
                        <AvatarImage
                          src={shop.avatarUrl ?? undefined}
                          alt={shop.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getShopInitials(shop.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">{shop.name}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          statusColorMap[shop.status] ?? ""
                        )}
                      >
                        {shop.status}
                      </Badge>
                      {shop.id === currentShopId && (
                        <Check className="ml-1 size-4 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      router.push("/shops?connect=true");
                      setOpen(false);
                    }}
                    className="gap-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-3.5" />
                    </div>
                    <span className="font-medium text-muted-foreground">
                      Connect New Shop
                    </span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

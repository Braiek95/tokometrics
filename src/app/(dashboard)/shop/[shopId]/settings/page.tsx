"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

const REGION_KEYS: { value: string; key: string }[] = [
  { value: "US", key: "regionUS" },
  { value: "UK", key: "regionUK" },
  { value: "SG", key: "regionSG" },
  { value: "MY", key: "regionMY" },
  { value: "TH", key: "regionTH" },
  { value: "VN", key: "regionVN" },
  { value: "PH", key: "regionPH" },
  { value: "ID", key: "regionID" },
];

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (\u00a3)" },
  { value: "SGD", label: "SGD (S$)" },
  { value: "MYR", label: "MYR (RM)" },
  { value: "THB", label: "THB (\u0e3f)" },
  { value: "VND", label: "VND (\u20ab)" },
  { value: "PHP", label: "PHP (\u20b1)" },
  { value: "IDR", label: "IDR (Rp)" },
  { value: "EUR", label: "EUR (\u20ac)" },
];

const SYNC_INTERVAL_KEYS: { value: string; key: string }[] = [
  { value: "5", key: "syncEvery5" },
  { value: "15", key: "syncEvery15" },
  { value: "30", key: "syncEvery30" },
  { value: "60", key: "syncEvery60" },
  { value: "360", key: "syncEvery360" },
  { value: "1440", key: "syncEvery1440" },
];

export default function ShopSettingsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = use(params);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { language } = useLanguage();

  // ---- Local form state ----
  const [name, setName] = useState("");
  const [region, setRegion] = useState("US");
  const [currency, setCurrency] = useState("USD");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState("30");
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState("10000");
  const [annualRevenueGoal, setAnnualRevenueGoal] = useState("120000");

  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  // ---- Fetch shop data ----
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}`);
      if (!res.ok) throw new Error("Failed to fetch shop");
      return res.json();
    },
  });

  // ---- Fetch shop settings ----
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["shop-settings", shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/settings`);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  // ---- Populate form when data loads ----
  useEffect(() => {
    if (shopData?.shop) {
      setName(shopData.shop.name ?? "");
      setRegion(shopData.shop.region ?? "US");
      setCurrency(shopData.shop.currency ?? "USD");
    }
  }, [shopData]);

  useEffect(() => {
    if (settingsData?.settings) {
      setNotificationsEnabled(settingsData.settings.notificationsEnabled ?? true);
      setEmailNotifications(settingsData.settings.emailNotifications ?? true);
      setSyncIntervalMinutes(String(settingsData.settings.syncIntervalMinutes ?? 30));
      setMonthlyRevenueGoal(String(settingsData.settings.monthlyRevenueGoal ?? 10000));
      setAnnualRevenueGoal(String(settingsData.settings.annualRevenueGoal ?? 120000));
    }
  }, [settingsData]);

  // ---- Mutations ----
  const shopInfoMutation = useMutation({
    mutationFn: async (data: { name: string; region: string; currency: string }) => {
      const res = await fetch(`/api/shops/${shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update shop");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(t(language, "shopInfoUpdated"));
      queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/shops/${shopId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update settings");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(t(language, "settingsUpdated"));
      queryClient.invalidateQueries({ queryKey: ["shop-settings", shopId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/shops/${shopId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to disconnect shop");
      }
      return true;
    },
    onSuccess: () => {
      toast.success(t(language, "shopDisconnected"));
      setDisconnectDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      router.push("/shops");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ---- Handlers ----
  const handleSaveShopInfo = () => {
    shopInfoMutation.mutate({ name, region, currency });
  };

  const handleToggleNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked);
    settingsMutation.mutate({ notificationsEnabled: checked });
  };

  const handleToggleEmailNotifications = (checked: boolean) => {
    setEmailNotifications(checked);
    settingsMutation.mutate({ emailNotifications: checked });
  };

  const handleSaveSyncInterval = (value: string) => {
    setSyncIntervalMinutes(value);
    settingsMutation.mutate({ syncIntervalMinutes: parseInt(value, 10) });
  };

  const handleSaveRevenueGoal = () => {
    const goal = parseFloat(monthlyRevenueGoal);
    if (isNaN(goal) || goal < 0) {
      toast.error(t(language, "invalidRevenue"));
      return;
    }
    const computedAnnual = goal * 12;
    setAnnualRevenueGoal(String(computedAnnual));
    settingsMutation.mutate({ monthlyRevenueGoal: goal, annualRevenueGoal: computedAnnual });
  };

  const isLoading = shopLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t(language, "shopSettingsTitle")} description={t(language, "shopSettingsDesc2")} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t(language, "shopSettingsTitle")} description={t(language, "shopSettingsDesc2")} />

      {/* Shop Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "shopInformation")}</CardTitle>
          <CardDescription>{t(language, "shopInfoDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop-name">{t(language, "shopNameLabel")}</Label>
            <Input
              id="shop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(language, "enterShopName")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t(language, "regionLabel")}</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t(language, "selectRegion")} />
                </SelectTrigger>
                <SelectContent>
                  {REGION_KEYS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {t(language, r.key as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t(language, "currencyLabel")}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t(language, "selectCurrency")} />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveShopInfo}
              disabled={shopInfoMutation.isPending}
            >
              {shopInfoMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {t(language, "saveChanges")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "notificationsTitle")}</CardTitle>
          <CardDescription>{t(language, "notificationsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t(language, "pushNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t(language, "pushNotificationsDesc")}
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t(language, "emailNotificationsLabel")}</Label>
              <p className="text-sm text-muted-foreground">
                {t(language, "emailNotificationsDesc")}
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={handleToggleEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "syncSettings")}</CardTitle>
          <CardDescription>{t(language, "syncSettingsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t(language, "syncIntervalLabel")}</Label>
            <Select value={syncIntervalMinutes} onValueChange={handleSaveSyncInterval}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder={t(language, "selectInterval")} />
              </SelectTrigger>
              <SelectContent>
                {SYNC_INTERVAL_KEYS.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value}>
                    {t(language, interval.key as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Goals */}
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "revenueGoals")}</CardTitle>
          <CardDescription>{t(language, "revenueGoalsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revenue-goal">{t(language, "monthlyRevenueGoalLabel")}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "VND" ? "₫" : currency === "THB" ? "฿" : currency}</span>
              <Input
                id="revenue-goal"
                type="number"
                min="0"
                step="100"
                value={monthlyRevenueGoal}
                onChange={(e) => setMonthlyRevenueGoal(e.target.value)}
                className="max-w-[200px]"
                placeholder="10000"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveRevenueGoal}
              disabled={settingsMutation.isPending}
            >
              {settingsMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {t(language, "saveGoal")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t(language, "dangerZoneTitle")}</CardTitle>
          <CardDescription>
            {t(language, "dangerZoneDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t(language, "disconnectShopLabel")}</p>
              <p className="text-sm text-muted-foreground">
                {t(language, "disconnectShopDesc")}
              </p>
            </div>
            <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">{t(language, "disconnectShopLabel")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t(language, "disconnectConfirmTitle")}</DialogTitle>
                  <DialogDescription>
                    {t(language, "disconnectConfirmDesc")}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDisconnectDialogOpen(false)}
                  >
                    {t(language, "cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {t(language, "yesDisconnect")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

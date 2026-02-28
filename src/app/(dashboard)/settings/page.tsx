"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

export default function UserSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();

  // ---- Profile state ----
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // ---- Password state ----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // ---- Populate from session ----
  useEffect(() => {
    if (session?.user) {
      setProfileName(session.user.name ?? "");
      setProfileEmail(session.user.email ?? "");
    }
  }, [session]);

  // ---- Profile save ----
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error(t(language, "nameRequired"));
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t(language, "profileUpdateFailed"));
      }

      // Update the NextAuth session with new name
      await updateSession({ name: profileName });
      toast.success(t(language, "profileUpdated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(language, "profileUpdateFailed"));
    } finally {
      setProfileSaving(false);
    }
  };

  // ---- Password change ----
  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error(t(language, "passwordRequired"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t(language, "passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t(language, "passwordsDontMatch"));
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t(language, "passwordChangeFailed"));
      }

      toast.success(t(language, "passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(language, "passwordChangeFailed"));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t(language, "settingsPageTitle")} description={t(language, "settingsPageDesc")} />

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">{t(language, "name")}</Label>
            <Input
              id="profile-name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder={t(language, "yourName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">{t(language, "email")}</Label>
            <Input
              id="profile-email"
              type="email"
              value={profileEmail}
              readOnly
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              {t(language, "emailCannotChange")}
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} disabled={profileSaving}>
              {profileSaving && <Loader2 className="size-4 animate-spin" />}
              {t(language, "updateProfile")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "changePassword")}</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t(language, "currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t(language, "enterCurrentPassword")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t(language, "newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t(language, "enterNewPassword")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t(language, "confirmNewPassword")}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t(language, "enterConfirmPassword")}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleChangePassword} disabled={passwordSaving}>
              {passwordSaving && <Loader2 className="size-4 animate-spin" />}
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how TokoMetrics looks on your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

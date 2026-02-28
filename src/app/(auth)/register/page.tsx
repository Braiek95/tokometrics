"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerSchema } from "@/lib/validators";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || t(language, "registrationFailed"));
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError(t(language, "accountCreatedLoginFailed"));
      setLoading(false);
      return;
    }

    router.push("/shops");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-2 text-primary">
            <Logo size={36} showText={true} />
          </div>
        </div>
        <CardTitle className="text-xl">{t(language, "createAccountTitle")}</CardTitle>
        <CardDescription>{t(language, "getStarted")}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">{t(language, "name")}</Label>
            <Input id="name" name="name" placeholder={t(language, "namePlaceholder")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t(language, "email")}</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t(language, "password")}</Label>
            <Input id="password" name="password" type="password" placeholder={t(language, "atLeast6Chars")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t(language, "confirmNewPassword")}</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder={t(language, "confirmYourPassword")} required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t(language, "createAccount")}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {t(language, "alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline">{t(language, "signIn")}</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

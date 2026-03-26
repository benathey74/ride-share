"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchLogin, fetchLogout } from "@/features/auth/api";
import { authMeQueryKey } from "@/features/auth/hooks";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { describeApiFailure } from "@/lib/api/errors";
import { getApiBaseUrl } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";

export function LoginScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(getApiBaseUrl());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      toast({ message: "Enter email and password.", variant: "error" });
      return;
    }
    setBusy(true);
    try {
      const account = await fetchLogin(trimmed, password);
      await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
      toast({ message: "You’re in.", variant: "success" });
      const dest = account.onboardingCompletedAt ? ROUTES.home : ROUTES.onboarding.welcome;
      router.replace(dest);
      router.refresh();
    } catch (err) {
      toast({ message: describeApiFailure(err).title, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 py-8">
      <Card className="mx-auto w-full max-w-md rounded-3xl border-border/90 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription className="space-y-2">
            <p>Internal alpha — email and password. No SSO yet.</p>
            <p className="text-xs text-muted-foreground">
              Seeded admin:{" "}
              <code className="rounded bg-muted/80 px-1 py-0.5 text-[11px]">admin@rides.local</code> /{" "}
              <code className="rounded bg-muted/80 px-1 py-0.5 text-[11px]">Admin123!</code> (after{" "}
              <code className="text-[11px]">migration:fresh --seed</code> or{" "}
              <code className="text-[11px]">ensure:alpha-users</code>).
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {!configured ? (
            <p className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
              Set <code className="text-foreground/90">NEXT_PUBLIC_API_BASE_URL</code> in{" "}
              <code className="text-foreground/90">.env.local</code>, then restart the dev server.
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                className="h-12 rounded-2xl"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={!configured || busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                className="h-12 rounded-2xl"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                disabled={!configured || busy}
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-2xl text-base"
              disabled={!configured || busy}
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href={ROUTES.register} className="font-medium text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={async () => {
                try {
                  await fetchLogout();
                } catch {
                  /* ignore */
                }
                await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
                toast({ message: "Signed out.", variant: "success" });
              }}
            >
              Sign out (clear server session)
            </button>
            {" · "}
            <Link href={ROUTES.onboarding.welcome} className="underline-offset-4 hover:underline">
              Setup wizard
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

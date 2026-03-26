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
import { fetchRegister } from "@/features/auth/api";
import { authMeQueryKey } from "@/features/auth/hooks";
import type { IntendedRole } from "@/features/auth/types";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { ApiError, describeApiFailure } from "@/lib/api/errors";
import { getApiBaseUrl } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { value: IntendedRole; label: string; hint: string }[] = [
  { value: "passenger", label: "Passenger", hint: "Request rides; onboarding covers rider setup." },
  { value: "driver", label: "Driver", hint: "Offer seats; driver profile requires admin approval." },
  { value: "both", label: "Both", hint: "Passenger + driver; driver side stays pending until approved." },
];

export function RegisterScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [intendedRole, setIntendedRole] = useState<IntendedRole>("passenger");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(getApiBaseUrl());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      toast({ message: "Enter email and password.", variant: "error" });
      return;
    }
    if (password.length < 8) {
      toast({ message: "Password must be at least 8 characters.", variant: "error" });
      return;
    }
    if (password !== confirm) {
      toast({ message: "Passwords do not match.", variant: "error" });
      return;
    }
    setBusy(true);
    try {
      await fetchRegister(trimmed, password, intendedRole);
      await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
      toast({ message: "Account created.", variant: "success" });
      router.replace(ROUTES.onboarding.welcome);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({ message: "That email is already registered. Try signing in.", variant: "error" });
        return;
      }
      toast({ message: describeApiFailure(err).title, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 py-8">
      <Card className="mx-auto w-full max-w-md rounded-3xl border-border/90 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl">Create account</CardTitle>
          <CardDescription>
            Internal alpha registration. You’ll continue into onboarding next.
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
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                className="h-12 rounded-2xl"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={!configured || busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                className="h-12 rounded-2xl"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                disabled={!configured || busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <Input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                className="h-12 rounded-2xl"
                value={confirm}
                onChange={(ev) => setConfirm(ev.target.value)}
                disabled={!configured || busy}
              />
            </div>
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!configured || busy}
                    onClick={() => setIntendedRole(opt.value)}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-left text-sm transition-colors",
                      intendedRole === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border/80 bg-muted/20 hover:bg-muted/40",
                    )}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-2xl text-base"
              disabled={!configured || busy}
            >
              {busy ? "Creating…" : "Register"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

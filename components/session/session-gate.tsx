"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { OnboardingLoadingPlaceholder } from "@/features/onboarding/components/onboarding-loading-placeholder";
import { useAuthMeQuery } from "@/features/auth/hooks";
import { getApiBaseUrl } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";

const LOGIN_PREFIX = ROUTES.login;
const REGISTER_PREFIX = ROUTES.register;

function isPublicAuthPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === LOGIN_PREFIX || pathname.startsWith(`${LOGIN_PREFIX}/`)) return true;
  if (pathname === REGISTER_PREFIX || pathname.startsWith(`${REGISTER_PREFIX}/`)) return true;
  return false;
}

function postAuthDestination(account: {
  onboardingCompletedAt: string | null;
}): string {
  return account.onboardingCompletedAt ? ROUTES.home : ROUTES.onboarding.welcome;
}

/**
 * Requires a valid API session (cookie) before the rest of the app. `/login` and `/register` stay public.
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const configured = Boolean(getApiBaseUrl());
  const publicPath = isPublicAuthPath(pathname);

  const { data: authUser, isPending, isError } = useAuthMeQuery({
    enabled: configured,
  });

  useEffect(() => {
    if (!configured || !publicPath) return;
    if (isPending || !authUser) return;
    router.replace(postAuthDestination(authUser));
  }, [authUser, configured, isPending, publicPath, router]);

  useEffect(() => {
    if (!configured || publicPath || isPending) return;
    if (authUser) return;
    router.replace(ROUTES.login);
  }, [authUser, configured, isPending, publicPath, router]);

  useEffect(() => {
    if (!configured || publicPath || !isError) return;
    router.replace(ROUTES.login);
  }, [configured, isError, publicPath, router]);

  if (!configured) {
    return <>{children}</>;
  }

  if (publicPath) {
    return <>{children}</>;
  }

  if (isPending) {
    return (
      <OnboardingLoadingPlaceholder
        message="Opening…"
        className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-3 px-6 py-12"
      />
    );
  }

  if (!authUser) {
    return (
      <OnboardingLoadingPlaceholder
        message="Opening sign in…"
        className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-3 px-6 py-12"
      />
    );
  }

  return <>{children}</>;
}

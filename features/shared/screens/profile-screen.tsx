"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import {
  useProfileMeQuery,
  useSaveProfileMutation,
} from "@/features/shared/hooks";
import { PrivacyNotice } from "@/features/shared/components/privacy-notice";
import { fetchLogout } from "@/features/auth/api";
import { authMeQueryKey } from "@/features/auth/hooks";
import { describeApiFailure } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants/routes";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/features/shared/schemas/profile";

function ProfileSkeleton() {
  return (
    <div className="space-y-6 pb-2 md:space-y-7" aria-busy="true" aria-label="Loading profile">
      <div className="h-14 animate-pulse rounded-lg bg-muted/50" />
      <div className="h-72 animate-pulse rounded-3xl bg-muted/50" />
    </div>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch } = useProfileMeQuery();
  const mutation = useSaveProfileMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      alias: "",
      avatarEmoji: "",
      bio: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      alias: data.alias,
      avatarEmoji: data.avatarEmoji,
      bio: data.bio ?? "",
    });
  }, [data, form]);

  if (isPending) {
    return <ProfileSkeleton />;
  }

  if (isError || !data) {
    const { title, description } = describeApiFailure(error);
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="whitespace-pre-wrap text-left">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <ApiErrorDevHint error={error} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-2 md:space-y-7">
      <SectionHeader
        title="Profile"
        description="Public alias and avatar sync to the API. Notes map to passenger accessibility (private)."
      />

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Riding</CardTitle>
          <CardDescription>
            See pending requests, upcoming trips, and history in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary" className="w-full rounded-2xl">
            <Link href={ROUTES.passengerMyTrips}>My trips & requests</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Public identity</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              await mutation.mutateAsync(values);
            })}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="alias">Alias</Label>
              <Input id="alias" autoComplete="off" {...form.register("alias")} />
              {form.formState.errors.alias ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.alias.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarEmoji">Avatar (emoji)</Label>
              <Input id="avatarEmoji" {...form.register("avatarEmoji")} />
              {form.formState.errors.avatarEmoji ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.avatarEmoji.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Passenger notes (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Stored as accessibility notes on your account."
                {...form.register("bio")}
              />
              {form.formState.errors.bio ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.bio.message}
                </p>
              ) : null}
            </div>

            {mutation.isError ? (
              <p className="text-xs text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Could not save."}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full rounded-2xl"
              disabled={form.formState.isSubmitting || mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Session</CardTitle>
          <CardDescription>
            Ends your server session (cookie). Sign in again to switch accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-2xl"
            onClick={async () => {
              try {
                await fetchLogout();
              } catch {
                /* still clear client state */
              }
              await queryClient.invalidateQueries({ queryKey: authMeQueryKey });
              router.replace(ROUTES.login);
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>

      <PrivacyNotice />
    </div>
  );
}

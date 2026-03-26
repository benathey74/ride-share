"use client";

import Link from "next/link";
import { Fragment, useMemo, useState, type ReactNode } from "react";
import { SectionHeader } from "@/components/layout/section-header";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAdminDashboardQuery,
  useAdminReportsQuery,
  useAdminUsersQuery,
  useApproveAdminDriverMutation,
  useRejectAdminDriverMutation,
  useRevokeAdminDriverMutation,
  useSuspendAdminUserMutation,
} from "@/features/admin/hooks";
import type { AdminReportRow, AdminUserDriverDetails, AdminUserRow } from "@/types/admin";
import { useAuthMeQuery } from "@/features/auth/hooks";
import { ApiError, describeApiFailure } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { DriverModerationReasonDialog } from "@/features/admin/components/driver-moderation-reason-dialog";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="rounded-3xl border-border/90">
      <CardHeader className="pb-1 pt-4">
        <CardDescription className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      {sub ? (
        <CardContent className="pb-4 pt-0">
          <p className="text-xs text-muted-foreground">{sub}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

function SectionSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={`Loading ${label}`}>
      <div className="h-5 w-32 animate-pulse rounded-lg bg-muted/50" />
      <div className="h-36 animate-pulse rounded-3xl bg-muted/40" />
    </div>
  );
}

function SectionError({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <Card className="rounded-3xl border-destructive/30">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="whitespace-pre-wrap text-left">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="secondary" className="rounded-2xl" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function formatReportWhen(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatVehicleLine(driver: AdminUserDriverDetails): string {
  const parts = [driver.vehicleMake, driver.vehicleModel].filter(
    (s): s is string => typeof s === "string" && s.trim() !== "",
  );
  if (parts.length === 0) return "—";
  return parts.join(" ");
}

function DriverDetail({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium leading-snug text-foreground">{value}</div>
    </div>
  );
}

function DriverApplicationDetails({ driver }: { driver: AdminUserDriverDetails }) {
  const pickup =
    driver.pickupRadiusMeters != null
      ? `${driver.pickupRadiusMeters.toLocaleString()} m`
      : "—";

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Vehicle & commute
      </p>
      <div className="grid gap-3 rounded-2xl border border-border/80 bg-muted/30 px-3 py-3 sm:grid-cols-2">
        <DriverDetail label="Vehicle" value={formatVehicleLine(driver)} />
        <DriverDetail label="Color" value={driver.vehicleColor?.trim() || "—"} />
        <DriverDetail
          label="Plate"
          value={
            <span className="font-mono text-[13px] tabular-nums tracking-tight">
              {driver.plateNumber?.trim() || "—"}
            </span>
          }
        />
        <DriverDetail label="Seats" value={String(driver.seatsTotal)} />
        <DriverDetail label="Detour tolerance" value={`${driver.detourToleranceMinutes} min`} />
        <DriverDetail label="Pickup radius" value={pickup} />
      </div>
      {driver.commuteNotes?.trim() ? (
        <p className="rounded-2xl border border-border/60 bg-background/80 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground/80">Notes: </span>
          {driver.commuteNotes.trim()}
        </p>
      ) : null}
    </div>
  );
}

function UserRowCard({
  user,
  viewerUserId,
  suspendMutation,
  revokeMutation,
  approveMutation,
  rejectMutation,
}: {
  user: AdminUserRow;
  viewerUserId: string | null;
  suspendMutation: ReturnType<typeof useSuspendAdminUserMutation>;
  revokeMutation: ReturnType<typeof useRevokeAdminDriverMutation>;
  approveMutation: ReturnType<typeof useApproveAdminDriverMutation>;
  rejectMutation: ReturnType<typeof useRejectAdminDriverMutation>;
}) {
  const uid = String(user.id);
  const suspending = suspendMutation.isPending && suspendMutation.variables?.userId === uid;
  const revoking = revokeMutation.isPending && revokeMutation.variables?.userId === uid;
  const approving = approveMutation.isPending && approveMutation.variables?.userId === uid;
  const rejecting = rejectMutation.isPending && rejectMutation.variables?.userId === uid;
  const busy = suspending || revoking || approving || rejecting;

  const isSuspended = user.status === "suspended";
  const isSelf = viewerUserId != null && String(user.id) === viewerUserId;
  const canSuspend = !user.isAdmin && !isSuspended && !isSelf;

  const dStatus = user.driverApprovalStatus;
  const hasDriverProfile = Boolean(dStatus);
  const isPendingApplication = dStatus === "pending";
  const canRejectDriver = hasDriverProfile && dStatus === "pending" && !isSelf;
  const canApproveDriver =
    hasDriverProfile &&
    !isSelf &&
    (dStatus === "pending" || dStatus === "rejected" || dStatus === "revoked");
  const canRevokeApprovedDriver = hasDriverProfile && dStatus === "approved" && !isSelf;

  const [moderationDialog, setModerationDialog] = useState<null | "reject" | "revoke">(null);
  const reasonDialogPending =
    (moderationDialog === "reject" && rejecting) || (moderationDialog === "revoke" && revoking);
  const moderationSheetOpen = moderationDialog !== null;

  return (
    <Fragment>
    <Card
      className={cn(
        "rounded-3xl border-border/90",
        isPendingApplication &&
          "border-2 border-amber-500/45 bg-gradient-to-b from-amber-500/[0.07] to-transparent shadow-sm ring-1 ring-amber-500/15",
      )}
    >
      <CardHeader className="space-y-2 pb-2">
        {isPendingApplication ? (
          <div className="flex items-center gap-2">
            <Badge className="rounded-full border-amber-600/40 bg-amber-500/15 text-[11px] font-semibold uppercase tracking-wide text-amber-950 dark:text-amber-100">
              Driver application — review
            </Badge>
          </div>
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-base leading-snug">{user.email}</CardTitle>
            <CardDescription className="text-xs">
              {user.realName ? (
                <span className="text-foreground/90">{user.realName}</span>
              ) : (
                <span className="italic">No legal name</span>
              )}
              {user.phone ? <span className="block text-muted-foreground">{user.phone}</span> : null}
            </CardDescription>
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {user.isAdmin ? (
              <Badge variant="secondary" className="rounded-full">
                Admin
              </Badge>
            ) : null}
            <Badge
              variant={isSuspended ? "accent" : "outline"}
              className={cn(
                "capitalize rounded-full",
                isSuspended && "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {user.status}
            </Badge>
            {dStatus ? (
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full capitalize",
                  dStatus === "pending" && "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-50",
                  dStatus === "rejected" && "border-destructive/40 bg-destructive/10 text-destructive",
                  dStatus === "approved" && "border-emerald-600/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
                )}
              >
                Driver: {dStatus}
              </Badge>
            ) : null}
          </div>
        </div>
        {user.alias ? (
          <p className="text-xs text-muted-foreground">
            Public alias:{" "}
            <span className="font-medium text-foreground/90">
              {user.avatar ? `${user.avatar} ` : ""}
              {user.alias}
            </span>
          </p>
        ) : null}

        {user.driver ? <DriverApplicationDetails driver={user.driver} /> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        {canRejectDriver || canApproveDriver ? (
          <div className="rounded-2xl border border-border/70 bg-background/60 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Driver decision
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dStatus === "pending"
                ? "Verify the vehicle details above, then approve or reject this application."
                : "You can restore driver access if the member has corrected their profile."}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                size="sm"
                className="order-1 rounded-2xl sm:order-none"
                disabled={!canApproveDriver || busy || moderationSheetOpen}
                title={isSelf ? "You cannot approve your own dev user." : undefined}
                onClick={() => {
                  if (
                    !confirm(
                      `Approve driver access for ${user.email}? They will be able to publish routes and drive for the workspace.`,
                    )
                  ) {
                    return;
                  }
                  approveMutation.mutate({ userId: uid });
                }}
              >
                {approving ? "Approving…" : "Approve driver"}
              </Button>
              {canRejectDriver ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="rounded-2xl"
                  disabled={busy || moderationSheetOpen}
                  onClick={() => setModerationDialog("reject")}
                >
                  Reject application
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Account moderation
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-2xl"
              disabled={!canSuspend || busy || moderationSheetOpen}
              title={
                user.isAdmin
                  ? "Cannot suspend admin accounts from this UI."
                  : isSelf
                    ? "You cannot suspend your own dev user."
                    : isSuspended
                      ? "Already suspended."
                      : undefined
              }
              onClick={() => {
                if (
                  !confirm(
                    `Suspend ${user.email}? They will not be able to use the app until reinstated in the database.`,
                  )
                ) {
                  return;
                }
                suspendMutation.mutate({ userId: uid });
              }}
            >
              {suspending ? "Suspending…" : "Suspend user"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-2xl"
              disabled={!canRevokeApprovedDriver || busy || moderationSheetOpen}
              title={
                !hasDriverProfile
                  ? "No driver profile."
                  : dStatus !== "approved"
                    ? "Only approved drivers can be revoked from this action."
                    : undefined
              }
              onClick={() => setModerationDialog("revoke")}
            >
              Revoke driver access
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {moderationDialog ? (
      <DriverModerationReasonDialog
        open
        flow={moderationDialog}
        memberEmail={user.email}
        isPending={reasonDialogPending}
        onOpenChange={(next) => {
          if (!next && !reasonDialogPending) setModerationDialog(null);
        }}
        onConfirm={(reason) => {
          if (moderationDialog === "reject") {
            rejectMutation.mutate(
              { userId: uid, reason },
              { onSuccess: () => setModerationDialog(null) },
            );
          } else {
            revokeMutation.mutate(
              { userId: uid, reason },
              { onSuccess: () => setModerationDialog(null) },
            );
          }
        }}
      />
    ) : null}
    </Fragment>
  );
}

function ReportCard({ report }: { report: AdminReportRow }) {
  return (
    <Card className="rounded-3xl border-border/90">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Report #{report.id}</CardTitle>
          <Badge variant="secondary" className="capitalize rounded-full">
            {report.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Opened {formatReportWhen(report.createdAt)}
          {report.updatedAt ? ` · Updated ${formatReportWhen(report.updatedAt)}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Reason
          </span>
          <br />
          <span className="text-foreground">{report.reason}</span>
        </p>
        {report.details ? (
          <p className="rounded-2xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {report.details}
          </p>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          Reporter user #{report.reportedByUserId} · Subject user #{report.reportedUserId}
          {report.tripInstanceId != null ? ` · Trip #${report.tripInstanceId}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardScreen() {
  const { data: authUser } = useAuthMeQuery();
  const viewerUserId = authUser ? String(authUser.id) : null;
  const dashboard = useAdminDashboardQuery();
  const users = useAdminUsersQuery();
  const reports = useAdminReportsQuery();
  const suspendMutation = useSuspendAdminUserMutation();
  const revokeMutation = useRevokeAdminDriverMutation();
  const approveMutation = useApproveAdminDriverMutation();
  const rejectMutation = useRejectAdminDriverMutation();

  const sortedUsers = useMemo(() => {
    if (!users.data) return [];
    return [...users.data].sort((a, b) => {
      const pri = (u: AdminUserRow) => (u.driverApprovalStatus === "pending" ? 0 : 1);
      const d = pri(a) - pri(b);
      if (d !== 0) return d;
      return a.id - b.id;
    });
  }, [users.data]);

  const pendingDriverCount =
    users.data?.filter((u) => u.driverApprovalStatus === "pending").length ?? 0;

  const anyForbidden =
    (dashboard.error instanceof ApiError && dashboard.error.status === 403) ||
    (users.error instanceof ApiError && users.error.status === 403) ||
    (reports.error instanceof ApiError && reports.error.status === 403);

  const sessionActive = Boolean(authUser);
  const activeId = authUser ? String(authUser.id) : null;

  if (anyForbidden) {
    return (
      <Card className="rounded-3xl border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">Admin access required</CardTitle>
          <CardDescription className="space-y-3 text-left">
            {sessionActive ? (
              <p>
                You&apos;re signed in, but this account (user id{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{activeId ?? "—"}</code>) is not an
                admin. Sign out from{" "}
                <Link
                  href={ROUTES.profile}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Profile
                </Link>{" "}
                or <code className="rounded bg-muted px-1 py-0.5 text-[11px]">/login</code>, then sign in
                as an admin (for example{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">admin@rides.local</code>).
              </p>
            ) : (
              <p>
                Sign in at{" "}
                <Link href={ROUTES.login} className="font-medium text-primary underline-offset-4 hover:underline">
                  /login
                </Link>{" "}
                with an admin account (e.g.{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">admin@rides.local</code> /{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">Admin123!</code> after seeding). For
                local tooling only, set{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true
                </code>{" "}
                and use the <strong>Dev</strong> menu or{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">NEXT_PUBLIC_DEV_USER_ID</code>.
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild className="rounded-2xl">
            <Link href={ROUTES.login}>Go to sign in</Link>
          </Button>
          <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => dashboard.refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-4 md:space-y-10">
      <SectionHeader
        title="Admin"
        description="Moderation dashboard — real-time totals, users, and reports. Actions are audited on the server."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Overview</h2>
        {dashboard.isPending ? (
          <SectionSkeleton label="overview" />
        ) : dashboard.isError ? (
          <SectionError
            title={describeApiFailure(dashboard.error).title}
            description={describeApiFailure(dashboard.error).description}
            onRetry={() => dashboard.refetch()}
          />
        ) : dashboard.data ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Users" value={dashboard.data.totals.users} />
            <StatCard label="Open reports" value={dashboard.data.totals.openReports} />
            <StatCard label="Suspended" value={dashboard.data.totals.suspendedUsers} />
            <StatCard label="Approved drivers" value={dashboard.data.totals.approvedDrivers} />
          </div>
        ) : null}
        {dashboard.isError ? <ApiErrorDevHint error={dashboard.error} /> : null}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Users</h2>
          {pendingDriverCount > 0 ? (
            <Badge className="rounded-full border-amber-500/40 bg-amber-500/12 text-[11px] font-semibold text-amber-950 dark:text-amber-50">
              {pendingDriverCount} driver application{pendingDriverCount === 1 ? "" : "s"} pending
            </Badge>
          ) : null}
        </div>
        {users.isPending ? (
          <SectionSkeleton label="users" />
        ) : users.isError ? (
          <>
            <SectionError
              title={describeApiFailure(users.error).title}
              description={describeApiFailure(users.error).description}
              onRetry={() => users.refetch()}
            />
            <ApiErrorDevHint error={users.error} />
          </>
        ) : users.data ? (
          <div className="space-y-3">
            {sortedUsers.length === 0 ? (
              <Card className="rounded-3xl border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">No users</CardTitle>
                  <CardDescription>The database returned an empty user list.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              sortedUsers.map((u) => (
                <UserRowCard
                  key={u.id}
                  user={u}
                  viewerUserId={viewerUserId}
                  suspendMutation={suspendMutation}
                  revokeMutation={revokeMutation}
                  approveMutation={approveMutation}
                  rejectMutation={rejectMutation}
                />
              ))
            )}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Reports</h2>
        {reports.isPending ? (
          <SectionSkeleton label="reports" />
        ) : reports.isError ? (
          <>
            <SectionError
              title={describeApiFailure(reports.error).title}
              description={describeApiFailure(reports.error).description}
              onRetry={() => reports.refetch()}
            />
            <ApiErrorDevHint error={reports.error} />
          </>
        ) : reports.data ? (
          <div className="space-y-3">
            {reports.data.length === 0 ? (
              <Card className="rounded-3xl border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">No reports</CardTitle>
                  <CardDescription>There are no moderation reports yet.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              reports.data.map((r) => <ReportCard key={r.id} report={r} />)
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

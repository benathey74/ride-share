"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_MODERATION_OPTIONAL_REASON_MAX_LENGTH } from "@/features/admin/constants";

export type DriverModerationReasonFlow = "reject" | "revoke";

type DriverModerationReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flow: DriverModerationReasonFlow;
  memberEmail: string;
  isPending: boolean;
  onConfirm: (reason: string | undefined) => void;
};

const COPY: Record<
  DriverModerationReasonFlow,
  { title: string; description: string; confirmLabel: string }
> = {
  reject: {
    title: "Reject application",
    description: "They will not be able to drive until approved again after resubmitting.",
    confirmLabel: "Reject application",
  },
  revoke: {
    title: "Revoke driver access",
    description: "They will lose canDrive until approved again through the normal flow.",
    confirmLabel: "Revoke driver access",
  },
};

/**
 * Optional moderation reason for reject/revoke driver actions.
 * Reason is sent as `reason` on POST …/reject-driver and …/revoke-driver (audited server-side).
 */
export function DriverModerationReasonDialog({
  open,
  onOpenChange,
  flow,
  memberEmail,
  isPending,
  onConfirm,
}: DriverModerationReasonDialogProps) {
  const titleId = useId();
  const descId = useId();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open, flow]);

  if (!open) return null;

  const c = COPY[flow];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onOpenChange(false);
      }}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-md rounded-3xl border-border/90 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <CardHeader className="space-y-1 pb-2">
          <CardTitle id={titleId} className="text-base">
            {c.title}
          </CardTitle>
          <CardDescription id={descId} className="text-left text-xs leading-relaxed">
            <span className="font-medium text-foreground/90">{memberEmail}</span>
            <span className="mt-1 block text-muted-foreground">{c.description}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <div className="space-y-2">
            <Label htmlFor="admin-mod-reason" className="text-xs font-semibold text-foreground">
              Optional note
            </Label>
            <Textarea
              id="admin-mod-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={ADMIN_MODERATION_OPTIONAL_REASON_MAX_LENGTH}
              disabled={isPending}
              placeholder="Why you’re taking this action…"
              className="min-h-[100px] resize-y text-sm"
            />
            <p className="text-[11px] leading-snug text-muted-foreground">
              Optional reason. This may be shown to the user.
            </p>
            <p className="text-[10px] text-muted-foreground tabular-nums">
              {reason.length}/{ADMIN_MODERATION_OPTIONAL_REASON_MAX_LENGTH}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-2xl"
              disabled={isPending}
              onClick={() => {
                const trimmed = reason.trim();
                onConfirm(trimmed.length > 0 ? trimmed : undefined);
              }}
            >
              {isPending ? "Working…" : c.confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

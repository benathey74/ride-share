"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { ApiErrorDevHint } from "@/components/dev/api-error-hint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  usePostTripCoordinationMessageMutation,
  useTripCoordinationMessagesQuery,
} from "@/features/trip-chat/hooks";
import { useAppToast } from "@/features/shared/components/toast-provider";
import { describeApiFailure } from "@/lib/api/errors";
import { publicAliasLabel } from "@/lib/utils/privacy";
import type { TripCoordinationMessage } from "@/types/trip-chat";

const QUICK_REPLIES = [
  "I'm here",
  "Running late",
  "On my way",
  "Meet at the pickup point",
] as const;

function formatChatTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function MessageBubble({ row }: { row: TripCoordinationMessage }) {
  const mine = row.fromViewer;
  return (
    <div
      className={`flex max-w-[min(100%,20rem)] flex-col gap-0.5 ${mine ? "ml-auto items-end" : "mr-auto items-start"}`}
    >
      {!mine ? (
        <span className="px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {row.sender ? publicAliasLabel(row.sender) : "Rider"}
        </span>
      ) : (
        <span className="sr-only">You</span>
      )}
      <div
        className={`rounded-2xl px-3 py-2 text-sm leading-snug shadow-sm ${
          mine
            ? "bg-primary text-primary-foreground"
            : "bg-muted/80 text-foreground ring-1 ring-border/60"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{row.message}</p>
        <p
          className={`mt-1 text-[10px] tabular-nums ${
            mine ? "text-primary-foreground/75" : "text-muted-foreground"
          }`}
        >
          {formatChatTime(row.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-3 py-1" aria-busy="true" aria-label="Loading messages">
      <div className="mr-auto h-14 w-4/5 max-w-xs animate-pulse rounded-2xl bg-muted/70" />
      <div className="ml-auto h-12 w-3/5 max-w-[12rem] animate-pulse rounded-2xl bg-muted/60" />
      <div className="mr-auto h-16 w-[90%] max-w-sm animate-pulse rounded-2xl bg-muted/65" />
    </div>
  );
}

type TripCoordinationChatProps = {
  tripInstanceId: string;
  /** When false, the parent should not mount this; included for defensive queries. */
  enabled?: boolean;
};

export function TripCoordinationChat({
  tripInstanceId,
  enabled = true,
}: TripCoordinationChatProps) {
  const id = tripInstanceId.trim();
  const [draft, setDraft] = useState("");
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const toast = useAppToast();

  const { data, isPending, isError, error, refetch, isFetching } =
    useTripCoordinationMessagesQuery(id, { enabled: enabled && Boolean(id) });
  const send = usePostTripCoordinationMessageMutation(id);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data?.length, isPending]);

  const onSend = () => {
    const text = draft.trim();
    if (!text || send.isPending) return;
    send.mutate(text, {
      onSuccess: () => setDraft(""),
      onError: (err) =>
        toast({ message: describeApiFailure(err).title, variant: "error" }),
    });
  };

  const busy = send.isPending;

  return (
    <Card className="rounded-3xl border-border/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-secondary" aria-hidden />
          <CardTitle className="text-base">Trip coordination</CardTitle>
        </div>
        <CardDescription className="text-left">
          Short updates for pickup timing — aliases only, same privacy as elsewhere. No photos or
          off-platform contact in this thread.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <ChatSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-3 py-3 text-sm">
            <p className="font-medium text-foreground">{describeApiFailure(error).title}</p>
            <p className="mt-1 text-muted-foreground">{describeApiFailure(error).description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-xl"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
            <ApiErrorDevHint error={error} />
          </div>
        ) : (
          <>
            <div
              className="max-h-[min(50vh,22rem)] space-y-2 overflow-y-auto rounded-2xl border border-border/50 bg-muted/20 px-2 py-3"
              role="log"
              aria-label="Trip messages"
            >
              {!data?.length ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No messages yet. Say hi to coordinate pickup.
                </p>
              ) : (
                data.map((row) => <MessageBubble key={row.id} row={row} />)
              )}
              <div ref={listEndRef} />
            </div>
            {isFetching && !isPending ? (
              <p className="text-center text-[11px] text-muted-foreground">Refreshing…</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((label) => (
                <Button
                  key={label}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full text-xs"
                  disabled={busy}
                  onClick={() =>
                    send.mutate(label, {
                      onError: (err) =>
                        toast({
                          message: describeApiFailure(err).title,
                          variant: "error",
                        }),
                    })
                  }
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                className="min-w-0 flex-1 rounded-2xl"
                placeholder="Message the group…"
                value={draft}
                maxLength={4000}
                disabled={busy}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                aria-label="Coordination message"
              />
              <Button
                type="button"
                className="shrink-0 rounded-2xl px-4"
                disabled={busy || !draft.trim()}
                onClick={onSend}
              >
                {busy ? "Sending…" : "Send"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

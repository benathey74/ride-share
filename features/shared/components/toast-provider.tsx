"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type AppToastInput = {
  message: string;
  variant?: "success" | "error";
};

type ToastItem = AppToastInput & { id: string };

type ToastContextValue = (input: AppToastInput) => void;

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (input: AppToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const item: ToastItem = {
        id,
        message: input.message,
        variant: input.variant ?? "success",
      };
      setItems((prev) => [...prev, item]);
      const handle = setTimeout(() => dismiss(id), DISMISS_MS);
      timers.current.set(id, handle);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-[min(100%-2rem,24rem)] -translate-x-1/2 flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm",
              t.variant === "error"
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-primary/25 bg-card/95 text-foreground",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAppToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useAppToast must be used within ToastProvider");
  }
  return ctx;
}

"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FormActionResult = { error?: string } | null | undefined;

/**
 * Wraps a server action so validation failures show as an inline message
 * instead of crashing to the generic error boundary. Thrown Server Action
 * errors are redacted to an opaque digest on the client by Next.js design —
 * so expected validation failures (missing field, role check, business
 * rule) must be returned as `{ error: string }`, not thrown. Reserve throw
 * for genuinely exceptional cases (tampering, not-found records).
 */
export function SubmitForm({
  action,
  hidden,
  submitLabel,
  pendingLabel,
  children,
  className,
}: {
  action: (prevState: FormActionResult, formData: FormData) => Promise<FormActionResult>;
  hidden?: Record<string, string>;
  submitLabel: string;
  pendingLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={cn("flex flex-col gap-4", className)}>
      {hidden &&
        Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      {children}
      {state?.error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? pendingLabel ?? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

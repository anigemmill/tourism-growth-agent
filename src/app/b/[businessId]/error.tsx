"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BusinessError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <AlertTriangle className="h-8 w-8 text-danger" />
      <h2 className="text-base font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-foreground-muted">
        An unexpected error interrupted this page. If you were submitting a form, nothing was saved.
        {error.digest && <span className="block mt-1 text-xs text-foreground-subtle">Reference: {error.digest}</span>}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "brand" | "accent" | "warning" | "danger" | "success";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-foreground-muted border-border",
  brand: "bg-brand-soft text-brand border-transparent",
  accent: "bg-accent-soft text-accent border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  success: "bg-success-soft text-success border-transparent",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

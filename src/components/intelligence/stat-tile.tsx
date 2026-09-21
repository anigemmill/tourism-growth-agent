import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  sublabel,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: "neutral" | "brand" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "text-foreground",
    brand: "text-brand",
    warning: "text-warning",
    danger: "text-danger",
  }[tone];

  return (
    <Card className="p-4">
      <div className="text-xs text-foreground-subtle">{label}</div>
      <div className={cn("text-2xl font-semibold tabular-nums mt-1", toneClass)}>{value}</div>
      {sublabel && <div className="text-[11px] text-foreground-subtle mt-0.5">{sublabel}</div>}
    </Card>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description && <p className="text-sm text-foreground-muted mt-1">{description}</p>}
    </div>
  );
}

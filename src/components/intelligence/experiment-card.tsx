import type { Experiment } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const STATUS_TONE = {
  PLANNED: "neutral",
  RUNNING: "accent",
  COMPLETE: "success",
  ABANDONED: "danger",
} as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
      <span className="text-foreground-subtle">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <CardTitle className="text-sm">{experiment.hypothesis}</CardTitle>
        <Badge tone={STATUS_TONE[experiment.status as keyof typeof STATUS_TONE] ?? "neutral"}>
          {experiment.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Row label="Audience" value={experiment.audience} />
        <Row label="Action" value={experiment.action} />
        <Row label="Channel" value={experiment.channel} />
        <Row
          label="Timeframe"
          value={`${formatDate(experiment.timeframeStart)} – ${formatDate(experiment.timeframeEnd)}`}
        />
        <Row label="Success metric" value={experiment.successMetric} />
        <Row label="Baseline" value={experiment.baseline} />
        {experiment.result && <Row label="Result" value={experiment.result} />}
        {experiment.learning && <Row label="Learning" value={experiment.learning} />}
        {experiment.nextAction && <Row label="Next action" value={experiment.nextAction} />}
        {experiment.whyDifferent && (
          <div className="mt-1 rounded-lg bg-warning-soft p-2.5 text-xs text-warning">
            Retry rationale: {experiment.whyDifferent}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

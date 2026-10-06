import type { Experiment } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { EXPERIMENT_TRANSITIONS } from "@/lib/workflow";
import { roleAtLeast } from "@/lib/auth";
import type { ExperimentStatus } from "@/lib/enums";
import { transitionExperiment, completeExperiment } from "@/app/b/[businessId]/experiments/actions";

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

export function ExperimentCard({ experiment, role }: { experiment: Experiment; role?: string }) {
  const transitions = EXPERIMENT_TRANSITIONS[experiment.status as ExperimentStatus];
  const canAct = (minRole: Parameters<typeof roleAtLeast>[1]) => !!role && roleAtLeast(role, minRole);
  const simpleTransitions = transitions.filter((t) => t.next !== "COMPLETE" && canAct(t.minRole));
  const canComplete = transitions.some((t) => t.next === "COMPLETE") && canAct("STRATEGIST");

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

        {simpleTransitions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 mt-1">
            {simpleTransitions.map((t) => (
              <form key={t.next} action={transitionExperiment.bind(null, experiment.businessId, experiment.id, t.next)}>
                <Button type="submit" size="sm" variant={t.next === "ABANDONED" ? "outline" : "primary"}>
                  {t.label}
                </Button>
              </form>
            ))}
          </div>
        )}

        {canComplete && (
          <form
            action={completeExperiment.bind(null, experiment.businessId, experiment.id)}
            className="flex flex-col gap-2 border-t border-border pt-3 mt-1"
          >
            <div className="text-xs font-medium">Complete this experiment</div>
            <textarea
              name="result"
              required
              placeholder="Result — what actually happened, with numbers if available"
              rows={2}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-brand"
            />
            <textarea
              name="learning"
              required
              placeholder="Learning — what this means for future recommendations"
              rows={2}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-brand"
            />
            <input
              name="nextAction"
              placeholder="Next action (optional)"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-brand"
            />
            <Button type="submit" size="sm" variant="primary" className="self-start">
              Mark complete
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

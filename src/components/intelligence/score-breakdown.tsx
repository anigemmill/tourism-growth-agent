import { RUBRIC_LABELS, RUBRIC_WEIGHTS, type OpportunityScoreInputs } from "@/lib/opportunity-engine/score";

export function ScoreBreakdown({ inputs, explanation }: { inputs: OpportunityScoreInputs; explanation: string }) {
  const rows = (Object.keys(RUBRIC_WEIGHTS) as Array<keyof OpportunityScoreInputs>).map((key) => ({
    key,
    label: RUBRIC_LABELS[key],
    value: inputs[key],
    weight: RUBRIC_WEIGHTS[key],
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2 text-xs">
            <span className="w-40 shrink-0 text-foreground-muted">
              {row.label} <span className="text-foreground-subtle">({Math.round(row.weight * 100)}%)</span>
            </span>
            <div className="h-1.5 flex-1 rounded-full bg-surface-muted overflow-hidden">
              <div className="h-full rounded-full bg-brand" style={{ width: `${row.value}%` }} />
            </div>
            <span className="w-8 text-right tabular-nums text-foreground-subtle">{row.value}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-foreground-muted border-t border-border pt-2">{explanation}</p>
    </div>
  );
}

import type { Signal } from "@prisma/client";
import { Field, SelectField, RangeField, FormCard } from "@/components/ui/field";
import { SubmitForm } from "@/components/ui/submit-form";
import { Badge } from "@/components/ui/badge";
import { OPPORTUNITY_CATEGORIES, RUBRIC_LABEL_HINT } from "@/lib/enums";
import { RUBRIC_LABELS } from "@/lib/opportunity-engine/score";
import { createOpportunity } from "@/app/b/[businessId]/opportunities/actions";

export function OpportunityForm({ businessId, signals }: { businessId: string; signals: Signal[] }) {
  return (
    <FormCard title="+ Create an opportunity">
      <p className="text-xs text-foreground-subtle">
        Score each factor honestly — the total is a straight weighted average, never adjusted after the fact. You
        must attach at least one signal as evidence.
      </p>
      <SubmitForm action={createOpportunity} hidden={{ businessId }} submitLabel="Create opportunity">
        <Field label="Title" name="title" placeholder="Launch a weather-guarantee shoulder-season offer" required />
        <SelectField label="Category" name="category" options={OPPORTUNITY_CATEGORIES} required />
        <Field label="Summary" name="summary" textarea rows={2} required />
        <Field label="Recommended action" name="recommendedAction" textarea rows={2} required />

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-muted p-3">
          {(Object.keys(RUBRIC_LABELS) as Array<keyof typeof RUBRIC_LABELS>).map((key) => (
            <RangeField key={key} label={RUBRIC_LABELS[key]} name={key} defaultValue={50} hint={RUBRIC_LABEL_HINT[key]} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Supporting signals <span className="text-danger">*</span>
          </span>
          {signals.length === 0 ? (
            <p className="text-xs text-foreground-muted">
              No signals recorded yet for this business — add one on Demand, Competitors, or AI Discovery first.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto scrollbar-thin rounded-lg border border-border p-2">
              {signals.map((s) => (
                <label key={s.id} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="signalIds" value={s.id} className="mt-1 accent-brand" />
                  <span>
                    {s.title} <Badge tone="neutral">{s.type}</Badge>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </SubmitForm>
    </FormCard>
  );
}

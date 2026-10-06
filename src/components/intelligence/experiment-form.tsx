import type { Experiment, Opportunity } from "@prisma/client";
import { Field, SelectField, FormCard } from "@/components/ui/field";
import { SubmitForm } from "@/components/ui/submit-form";
import { createExperiment } from "@/app/b/[businessId]/experiments/create-action";

export function ExperimentForm({
  businessId,
  opportunities,
  priorExperiments,
}: {
  businessId: string;
  opportunities: Opportunity[];
  priorExperiments: Experiment[];
}) {
  return (
    <FormCard title="+ Create an experiment">
      <p className="text-xs text-foreground-subtle">
        If this closely matches a past completed or abandoned experiment, link it below and explain what&apos;s
        different — the system will reject a silent repeat of a failed test.
      </p>
      <SubmitForm action={createExperiment} hidden={{ businessId }} submitLabel="Create experiment">
        <Field label="Hypothesis" name="hypothesis" textarea rows={2} required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Audience" name="audience" required />
          <Field label="Channel" name="channel" required />
        </div>
        <Field label="Action" name="action" textarea rows={2} placeholder="What will actually be done" required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Success metric" name="successMetric" required />
          <Field label="Baseline" name="baseline" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date" name="timeframeStart" type="date" required />
          <Field label="End date" name="timeframeEnd" type="date" required />
        </div>
        {opportunities.length > 0 && (
          <SelectField
            label="Linked opportunity (optional)"
            name="opportunityId"
            options={[{ value: "", label: "— none —" }, ...opportunities.map((o) => ({ value: o.id, label: o.title }))]}
          />
        )}
        {priorExperiments.length > 0 && (
          <>
            <SelectField
              label="Retries a previous experiment (optional)"
              name="supersedesExperimentId"
              options={[
                { value: "", label: "— this is a new idea —" },
                ...priorExperiments.map((e) => ({ value: e.id, label: `[${e.status}] ${e.hypothesis}` })),
              ]}
            />
            <Field
              label="Why is this different?"
              name="whyDifferent"
              textarea
              rows={2}
              hint="Required if you selected a previous experiment above, or if your hypothesis closely matches one."
            />
          </>
        )}
      </SubmitForm>
    </FormCard>
  );
}

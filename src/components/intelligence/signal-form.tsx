import { Field, SelectField, RangeField, FormCard } from "@/components/ui/field";
import { SubmitForm } from "@/components/ui/submit-form";
import { SIGNAL_TYPES, CLAIM_TYPES, LEVELS, MOMENTUM } from "@/lib/enums";
import { createSignal } from "@/app/b/[businessId]/signals/actions";
import type { Competitor } from "@prisma/client";

export function SignalForm({
  businessId,
  redirectPath,
  defaultType,
  competitors,
}: {
  businessId: string;
  redirectPath: string;
  defaultType: string;
  competitors?: Competitor[];
}) {
  return (
    <FormCard title="+ Add a signal">
      <p className="text-xs text-foreground-subtle">
        Record a piece of evidence manually. Every signal needs a real source and honest confidence — this isn&apos;t a
        place to invent a trend.
      </p>
      <SubmitForm action={createSignal} hidden={{ businessId, redirectPath }} submitLabel="Add signal">
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Type" name="type" options={SIGNAL_TYPES} defaultValue={defaultType} required />
          <SelectField label="Claim type" name="claimType" options={CLAIM_TYPES} defaultValue="OBSERVATION" required />
        </div>
        <Field label="Title" name="title" placeholder="Short headline for this signal" required />
        <Field label="Summary" name="summary" textarea rows={2} placeholder="What is happening" required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Source" name="source" placeholder="e.g. Manual review of competitor site, GA4 export" required />
          <RangeField label="Confidence" name="confidence" defaultValue={60} hint="0 = pure guess, 100 = verified fact" />
        </div>
        <Field
          label="Evidence"
          name="evidence"
          textarea
          rows={2}
          placeholder="What specifically supports this — a quote, a number, a link description"
          required
        />
        {competitors && competitors.length > 0 && (
          <SelectField
            label="Competitor (if applicable)"
            name="competitorId"
            options={[{ value: "", label: "— none —" }, ...competitors.map((c) => ({ value: c.id, label: c.name }))]}
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Target audience" name="targetAudience" placeholder="Optional" />
          <SelectField
            label="Relevance"
            name="relevance"
            options={["", ...LEVELS]}
            defaultValue=""
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <SelectField label="Scale" name="scale" options={["", ...LEVELS]} defaultValue="" />
          <SelectField label="Momentum" name="momentum" options={["", ...MOMENTUM]} defaultValue="" />
          <SelectField label="Commercial potential" name="commercialPotential" options={["", ...LEVELS]} defaultValue="" />
        </div>
      </SubmitForm>
    </FormCard>
  );
}

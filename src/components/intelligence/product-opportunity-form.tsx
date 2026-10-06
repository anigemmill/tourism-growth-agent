import { Field, RangeField, FormCard } from "@/components/ui/field";
import { SubmitForm } from "@/components/ui/submit-form";
import { createProductOpportunity } from "@/app/b/[businessId]/product/actions";

export function ProductOpportunityForm({ businessId }: { businessId: string }) {
  return (
    <FormCard title="+ Propose a product opportunity">
      <p className="text-xs text-foreground-subtle">
        Never claim viability without evidence — if you&apos;re not confident, say what data is still needed rather than
        inflating the confidence score.
      </p>
      <SubmitForm action={createProductOpportunity} hidden={{ businessId }} submitLabel="Propose product opportunity">
        <Field label="Target traveller" name="targetTraveller" required />
        <Field label="Problem" name="problem" textarea rows={2} required />
        <Field label="Demand evidence" name="demandEvidence" textarea rows={2} required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Existing supply" name="existingSupply" textarea rows={2} required />
          <Field label="Gap" name="gap" textarea rows={2} required />
        </div>
        <Field label="Proposed product" name="proposedProduct" textarea rows={2} required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Potential partners" name="potentialPartners" textarea rows={2} hint="One per line" />
          <Field label="Seasonality" name="seasonality" placeholder="Optional" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Risks" name="risks" textarea rows={2} hint="One per line" />
          <Field
            label="Data still needed"
            name="dataNeeded"
            textarea
            rows={2}
            hint="One per line — required if confidence is 70%+"
          />
        </div>
        <RangeField label="Confidence" name="confidence" defaultValue={30} hint="Be honest — this gates what the UI is allowed to imply" />
      </SubmitForm>
    </FormCard>
  );
}

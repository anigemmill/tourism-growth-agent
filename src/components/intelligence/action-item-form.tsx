import type { Opportunity } from "@prisma/client";
import { Field, SelectField, FormCard } from "@/components/ui/field";
import { SubmitForm } from "@/components/ui/submit-form";
import { LEVELS, EXECUTION_MODES } from "@/lib/enums";
import { createActionItem } from "@/app/b/[businessId]/actions/actions";

export function ActionItemForm({ businessId, opportunities }: { businessId: string; opportunities: Opportunity[] }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <FormCard title="+ Add an action to this week's plan">
      <SubmitForm action={createActionItem} hidden={{ businessId }} submitLabel="Add action">
        <Field label="Action" name="action" required />
        <Field label="Why" name="why" textarea rows={2} required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Audience" name="audience" required />
          <Field label="Channel" name="channel" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Owner" name="owner" placeholder="e.g. AI, Marketing lead, Owner" required />
          <SelectField label="Effort" name="effort" options={LEVELS} defaultValue="MEDIUM" required />
        </div>
        <Field label="Expected outcome" name="expectedOutcome" required />
        <Field label="Measurement" name="measurement" placeholder="How you'll know it worked" required />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Execution mode"
            name="executionMode"
            options={EXECUTION_MODES.map((m) => ({ value: m, label: m === "AI_CAN_EXECUTE" ? "AI can execute" : "Needs a human" }))}
            defaultValue="NEEDS_HUMAN"
            required
          />
          <Field label="Week of" name="weekOf" type="date" defaultValue={today} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requiresApproval" defaultChecked className="accent-brand" />
          Requires approval before being marked done
        </label>
        {opportunities.length > 0 && (
          <SelectField
            label="Linked opportunity (optional)"
            name="opportunityId"
            options={[{ value: "", label: "— none —" }, ...opportunities.map((o) => ({ value: o.id, label: o.title }))]}
          />
        )}
      </SubmitForm>
    </FormCard>
  );
}

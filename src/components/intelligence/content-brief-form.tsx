import { Field, SelectField, FormCard } from "@/components/ui/field";
import { SubmitForm } from "@/components/ui/submit-form";
import { CONTENT_TYPES } from "@/lib/enums";
import { createContentBrief } from "@/app/b/[businessId]/marketing/actions";

export function ContentBriefForm({ businessId }: { businessId: string }) {
  return (
    <FormCard title="+ Propose a content brief">
      <p className="text-xs text-foreground-subtle">
        Base this on actual traveller demand, commercial intent, SEO/AI discovery opportunity, or a competitive gap —
        not just because a topic is trending.
      </p>
      <SubmitForm action={createContentBrief} hidden={{ businessId }} submitLabel="Propose brief">
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Content type" name="contentType" options={CONTENT_TYPES} required />
          <Field label="Target audience" name="targetAudience" required />
        </div>
        <Field label="Title" name="title" required />
        <Field label="Why now" name="whyNow" textarea rows={2} required />
        <Field label="Key points" name="keyPoints" textarea rows={3} hint="One per line" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="SEO notes" name="seoNotes" placeholder="Optional" />
          <Field label="AI discovery notes" name="aiDiscoveryNotes" placeholder="Optional" />
        </div>
      </SubmitForm>
    </FormCard>
  );
}

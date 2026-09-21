import { Compass } from "lucide-react";
import { createBusiness } from "./actions";
import { isAnthropicConfigured } from "@/lib/integrations/registry";
import { Badge } from "@/components/ui/badge";

function Field({
  label,
  name,
  placeholder,
  required,
  textarea,
  hint,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {hint && <span className="text-xs text-foreground-subtle -mt-1">{hint}</span>}
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={3}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        />
      )}
    </label>
  );
}

export default function OnboardingPage() {
  const aiEnabled = isAnthropicConfigured();

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold">Tourism Growth Intelligence</div>
            <div className="text-xs text-foreground-subtle">Business onboarding</div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Automated website analysis</span>
            <Badge tone={aiEnabled ? "success" : "warning"}>
              {aiEnabled ? "Connected" : "Requires API"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            {aiEnabled
              ? "We'll fetch and analyze the website below to build an initial business intelligence profile."
              : "Set ANTHROPIC_API_KEY to automatically analyze the website. Without it, the profile stays empty until you add it manually or connect the API later — nothing will be invented."}
          </p>
        </div>

        <form action={createBusiness} className="flex flex-col gap-5">
          <Field label="Business name" name="name" placeholder="Coastal Peak Adventures" required />
          <Field label="Website" name="website" placeholder="https://example.com" required type="url" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Destination" name="destination" placeholder="Queenstown, NZ" required />
            <Field label="Category" name="category" placeholder="Tour operator" required />
          </div>
          <Field
            label="Products"
            name="products"
            textarea
            hint="One per line"
            placeholder={"Half-day hiking tours\nMulti-day trekking packages"}
          />
          <Field
            label="Services"
            name="services"
            textarea
            hint="One per line"
            placeholder={"Private guiding\nEquipment rental"}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Target markets"
              name="targetMarkets"
              textarea
              hint="One per line"
              placeholder={"Australia\nUSA\nUK"}
            />
            <Field
              label="Target audiences"
              name="targetAudiences"
              textarea
              hint="One per line"
              placeholder={"Adventure couples\nFamily groups"}
            />
          </div>
          <Field
            label="Competitors"
            name="competitors"
            textarea
            hint="Website or name, one per line"
            placeholder={"competitor1.com\ncompetitor2.com"}
          />
          <Field label="Booking URL" name="bookingUrl" placeholder="https://example.com/book" type="url" />
          <Field
            label="Existing marketing channels"
            name="marketingChannels"
            textarea
            hint="One per line"
            placeholder={"Instagram\nEmail newsletter\nGoogle Ads"}
          />
          <Field
            label="Business goals"
            name="goals"
            textarea
            hint="One per line"
            placeholder={"Grow direct bookings 20% this year\nIncrease shoulder-season demand"}
          />

          <button
            type="submit"
            className="mt-2 h-11 rounded-lg bg-brand text-brand-foreground text-sm font-medium hover:opacity-90"
          >
            Create business profile
          </button>
        </form>
      </div>
    </div>
  );
}

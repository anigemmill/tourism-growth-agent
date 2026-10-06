import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrationStatusBadge } from "@/components/intelligence/integration-status-badge";
import { getIntegrationStatuses, type IntegrationDomain } from "@/lib/integrations/registry";
import { formatDateTime, formatPercent } from "@/lib/utils";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { ROLES } from "@/lib/enums";
import { Field } from "@/components/ui/field";
import { SubmitForm } from "@/components/ui/submit-form";
import { updateMemberRole, addCompetitor, removeCompetitor, updateBusinessProfile } from "./actions";

const DOMAIN_LABEL: Record<IntegrationDomain, string> = {
  SEARCH: "Search",
  SOCIAL: "Social",
  BUSINESS: "Business systems",
  REPUTATION: "Reputation",
  MARKET: "Market",
  EXTERNAL: "External signals",
  AI: "AI",
};

function asList(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

export default async function SettingsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { membership } = await requireMembership(businessId);
  const [business, profile, members, competitors] = await Promise.all([
    prisma.business.findUniqueOrThrow({ where: { id: businessId } }),
    prisma.businessProfile.findUnique({ where: { businessId } }),
    prisma.businessMember.findMany({ where: { businessId }, include: { user: true }, orderBy: { createdAt: "asc" } }),
    prisma.competitor.findMany({ where: { businessId }, orderBy: { name: "asc" } }),
  ]);
  const canManageMembers = roleAtLeast(membership.role, "ADMIN");
  const canManageBusiness = roleAtLeast(membership.role, "ADMIN");

  const integrations = getIntegrationStatuses();
  const grouped = integrations.reduce<Record<string, typeof integrations>>((acc, i) => {
    (acc[i.domain] ??= []).push(i);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Settings" description="Business profile and integration status." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Business profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div>
              <span className="text-foreground-subtle">Name: </span>
              {business.name}
            </div>
            <div>
              <span className="text-foreground-subtle">Website: </span>
              {business.website}
            </div>
            <div>
              <span className="text-foreground-subtle">Destination: </span>
              {business.destination}
            </div>
            <div>
              <span className="text-foreground-subtle">Category: </span>
              {business.category}
            </div>
            <div>
              <span className="text-foreground-subtle">Products: </span>
              {asList(business.products).join(", ") || "—"}
            </div>

            {canManageBusiness ? (
              <SubmitForm
                action={updateBusinessProfile}
                hidden={{ businessId }}
                submitLabel="Save changes"
                className="mt-2 border-t border-border pt-3"
              >
                <Field
                  label="Target markets"
                  name="targetMarkets"
                  textarea
                  rows={2}
                  hint="One per line"
                  defaultValue={asList(business.targetMarkets).join("\n")}
                />
                <Field
                  label="Target audiences"
                  name="targetAudiences"
                  textarea
                  rows={2}
                  hint="One per line"
                  defaultValue={asList(business.targetAudiences).join("\n")}
                />
                <Field
                  label="Goals"
                  name="goals"
                  textarea
                  rows={2}
                  hint="One per line"
                  defaultValue={asList(business.goals).join("\n")}
                />
              </SubmitForm>
            ) : (
              <>
                <div>
                  <span className="text-foreground-subtle">Target markets: </span>
                  {asList(business.targetMarkets).join(", ") || "—"}
                </div>
                <div>
                  <span className="text-foreground-subtle">Target audiences: </span>
                  {asList(business.targetAudiences).join(", ") || "—"}
                </div>
                <div>
                  <span className="text-foreground-subtle">Goals: </span>
                  {asList(business.goals).join(", ") || "—"}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Derived intelligence profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <IntegrationStatusBadge status={profile?.analysisSource ?? "NOT_CONNECTED"} />
              {profile?.analyzedAt && (
                <span className="text-xs text-foreground-subtle">
                  Analyzed {formatDateTime(profile.analyzedAt)}
                  {profile.analysisConfidence != null && ` · ${formatPercent(profile.analysisConfidence)} confidence`}
                </span>
              )}
            </div>
            {profile?.positioning ? (
              <p className="text-foreground-muted">{profile.positioning}</p>
            ) : (
              <p className="text-foreground-muted">
                No automated profile yet. Set <code>ANTHROPIC_API_KEY</code> and re-run onboarding, or add this
                manually.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team &amp; roles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 text-sm border-b border-border pb-3 last:border-0 last:pb-0">
              <div>
                <div className="font-medium">{m.user.name || m.user.email}</div>
                <div className="text-xs text-foreground-subtle">{m.user.email}</div>
              </div>
              {canManageMembers ? (
                <SubmitForm
                  action={updateMemberRole}
                  hidden={{ businessId, memberId: m.id }}
                  submitLabel="Update"
                  className="flex-row items-center gap-2 flex-wrap"
                >
                  <select
                    name="newRole"
                    defaultValue={m.role}
                    className="rounded-lg border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-brand"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </SubmitForm>
              ) : (
                <Badge tone="neutral">{m.role}</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Competitors</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {competitors.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 text-sm border-b border-border pb-3 last:border-0 last:pb-0">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-foreground-subtle">{c.website}</div>
              </div>
              {canManageBusiness && (
                <form action={removeCompetitor.bind(null, businessId, c.id)}>
                  <button type="submit" className="text-xs text-danger hover:underline">
                    Remove
                  </button>
                </form>
              )}
            </div>
          ))}
          {competitors.length === 0 && <p className="text-sm text-foreground-muted">No competitors defined yet.</p>}

          {canManageBusiness && (
            <SubmitForm
              action={addCompetitor}
              hidden={{ businessId }}
              submitLabel="Add"
              className="flex-row items-end gap-2 border-t border-border pt-3 mt-1"
            >
              <Field label="Name" name="name" required className="flex-1" />
              <Field label="Website" name="website" placeholder="example.com" className="flex-1" />
            </SubmitForm>
          )}
        </CardContent>
      </Card>

      <h2 className="text-sm font-semibold mb-3">Integrations</h2>
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([domain, items]) => (
          <Card key={domain}>
            <CardHeader>
              <CardTitle>{DOMAIN_LABEL[domain as IntegrationDomain]}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {items.map((i) => (
                <div key={i.key} className="flex items-start justify-between gap-3 text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-foreground-muted">{i.description}</div>
                    <div className="text-[11px] text-foreground-subtle mt-0.5">{i.notes}</div>
                  </div>
                  <IntegrationStatusBadge status={i.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-xs text-foreground-subtle">
        <Badge tone="neutral">Note</Badge> Statuses above are computed live from configured environment variables —
        nothing here is hardcoded to look connected.
      </div>
    </div>
  );
}

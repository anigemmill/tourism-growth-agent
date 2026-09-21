import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrationStatusBadge } from "@/components/intelligence/integration-status-badge";
import { getIntegrationStatuses, type IntegrationDomain } from "@/lib/integrations/registry";
import { formatDateTime, formatPercent } from "@/lib/utils";

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
  const [business, profile] = await Promise.all([
    prisma.business.findUniqueOrThrow({ where: { id: businessId } }),
    prisma.businessProfile.findUnique({ where: { businessId } }),
  ]);

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
            <div>
              <span className="text-foreground-subtle">Target audiences: </span>
              {asList(business.targetAudiences).join(", ") || "—"}
            </div>
            <div>
              <span className="text-foreground-subtle">Goals: </span>
              {asList(business.goals).join(", ") || "—"}
            </div>
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

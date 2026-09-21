import { prisma } from "@/lib/prisma";
import { PageHeader, StatTile } from "@/components/intelligence/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationStatusBadge } from "@/components/intelligence/integration-status-badge";
import { getIntegrationStatuses } from "@/lib/integrations/registry";

export default async function AnalyticsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId } });
  const keyMetrics = (business.keyMetrics as Record<string, string>) ?? {};
  const metricEntries = Object.entries(keyMetrics);

  const analyticsSources = getIntegrationStatuses().filter((i) =>
    ["google_analytics", "google_search_console", "booking_system"].includes(i.key)
  );

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Performance and trend data. Live traffic, search, and booking analytics require connecting the sources below."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Live data sources</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {analyticsSources.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-foreground-muted">{s.description}</div>
              </div>
              <IntegrationStatusBadge status={s.status} />
            </div>
          ))}
        </CardContent>
      </Card>

      <h2 className="text-sm font-semibold mb-3">Business-reported metrics</h2>
      {metricEntries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">
            No metrics on file. These are entered by the business (Settings) or pulled automatically once analytics
            integrations are connected — never estimated.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metricEntries.map(([k, v]) => (
            <StatTile key={k} label={k} value={v} sublabel="Self-reported by business" />
          ))}
        </div>
      )}
    </div>
  );
}

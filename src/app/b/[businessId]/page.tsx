import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildDailyBrief } from "@/lib/opportunity-engine/daily-brief";
import { PageHeader, StatTile } from "@/components/intelligence/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceMeta } from "@/components/intelligence/evidence-meta";
import { OpportunityCard } from "@/components/intelligence/opportunity-card";
import { formatDate } from "@/lib/utils";
import { Bot, User, AlertTriangle } from "lucide-react";
import { requireMembership } from "@/lib/auth";

export default async function ExecutiveOverviewPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const { membership } = await requireMembership(businessId);

  const [brief, opportunityCount, experimentCount, actionCount, integrationConnected, integrationTotal] =
    await Promise.all([
      buildDailyBrief(businessId),
      prisma.opportunity.count({ where: { businessId, status: { notIn: ["DISCARDED"] } } }),
      prisma.experiment.count({ where: { businessId, status: "RUNNING" } }),
      prisma.actionItem.count({ where: { businessId, status: { not: "DONE" } } }),
      prisma.integrationConnection.count({ where: { businessId, status: "CONNECTED" } }),
      prisma.integrationConnection.count({ where: { businessId } }),
    ]);

  const topOpportunity = brief.biggestOpportunity
    ? await prisma.opportunity.findUnique({
        where: { id: brief.biggestOpportunity.id },
        include: { signals: { include: { signal: true } } },
      })
    : null;

  return (
    <div>
      <PageHeader
        title="Executive Overview"
        description={`What you need to know and what to do today — ${formatDate(new Date())}`}
      />

      {brief.isStale && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          No new signals landed today — showing the most recent signals on file instead. Connect live
          integrations in Settings for continuously fresh intelligence.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatTile label="Open opportunities" value={opportunityCount} />
        <StatTile label="Running experiments" value={experimentCount} />
        <StatTile label="Open actions" value={actionCount} />
        <StatTile
          label="Integrations connected"
          value={`${integrationConnected}/${integrationTotal}`}
          sublabel="See Settings for detail"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. What changed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {brief.whatChanged.length === 0 && (
              <p className="text-sm text-foreground-muted">No signals recorded yet for this business.</p>
            )}
            {brief.whatChanged.map((item) => (
              <div key={item.signalId} className="text-sm">
                <div className="font-medium">{item.text}</div>
                <EvidenceMeta
                  claimType={item.claimType}
                  source={item.source}
                  timestamp={new Date()}
                  confidence={item.confidence}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Why it matters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-muted">{brief.whyItMatters}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-3">3. Biggest opportunity</h2>
        {topOpportunity ? (
          <OpportunityCard opportunity={topOpportunity} role={membership.role} showBreakdown={false} />
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-foreground-muted">
              No prioritized opportunities yet. Add signals or run analysis to generate one.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>4. What should we do</CardTitle>
          </CardHeader>
          <CardContent>
            {brief.whatToDo.length === 0 ? (
              <p className="text-sm text-foreground-muted">Nothing prioritized yet.</p>
            ) : (
              <ul className="text-sm space-y-2 list-disc pl-4">
                {brief.whatToDo.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Bot className="h-4 w-4" /> 5. What AI can execute
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brief.aiCanExecute.length === 0 ? (
              <p className="text-sm text-foreground-muted">Nothing queued.</p>
            ) : (
              <ul className="text-sm space-y-2">
                {brief.aiCanExecute.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Badge tone="brand">AI</Badge>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> 6. What needs a human
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brief.needsHuman.length === 0 ? (
              <p className="text-sm text-foreground-muted">Nothing waiting on you.</p>
            ) : (
              <ul className="text-sm space-y-2">
                {brief.needsHuman.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Badge tone="warning">You</Badge>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between text-xs text-foreground-subtle">
        <span>Full weekly plan and history are available in the sidebar.</span>
        <Link href={`/b/${businessId}/actions`} className="text-brand hover:underline">
          View weekly plan →
        </Link>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { SignalCard } from "@/components/intelligence/signal-card";
import { SignalForm } from "@/components/intelligence/signal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireMembership, roleAtLeast } from "@/lib/auth";

export default async function CompetitorsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { membership } = await requireMembership(businessId);
  const [competitors, signals] = await Promise.all([
    prisma.competitor.findMany({ where: { businessId }, orderBy: { name: "asc" } }),
    prisma.signal.findMany({
      where: { businessId, type: "COMPETITOR" },
      orderBy: { createdAt: "desc" },
      include: { competitor: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Competitors"
        description="What has changed that could affect this business — not every competitor move, only the ones that matter."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {competitors.map((c) => (
          <Badge key={c.id} tone="neutral">
            {c.name}
          </Badge>
        ))}
        {competitors.length === 0 && (
          <span className="text-sm text-foreground-muted">No competitors defined yet — add them in Settings.</span>
        )}
      </div>

      {roleAtLeast(membership.role, "MARKETER") && (
        <div className="mb-6">
          <SignalForm
            businessId={businessId}
            redirectPath={`/b/${businessId}/competitors`}
            defaultType="COMPETITOR"
            competitors={competitors}
          />
        </div>
      )}

      {signals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">
            No meaningful competitor changes recorded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((s) => (
            <div key={s.id}>
              {s.competitor && (
                <div className="text-xs text-foreground-subtle mb-1 flex items-center gap-1">
                  <Badge tone="neutral">{s.competitor.name}</Badge>
                </div>
              )}
              <SignalCard signal={s} />
            </div>
          ))}
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Monitoring scope</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground-muted">
          Full automated monitoring (pricing, SEO, AI visibility, social activity, reviews, campaigns) requires the
          Competitor websites connector, currently <Badge tone="neutral">Not connected</Badge> — see Settings. Until
          then, competitor signals are added manually or via periodic analysis runs.
        </CardContent>
      </Card>
    </div>
  );
}

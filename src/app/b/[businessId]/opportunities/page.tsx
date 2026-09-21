import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { OpportunityCard } from "@/components/intelligence/opportunity-card";
import { Card, CardContent } from "@/components/ui/card";

export default async function OpportunitiesPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const opportunities = await prisma.opportunity.findMany({
    where: { businessId, status: { not: "DISCARDED" } },
    include: { signals: { include: { signal: true } } },
    orderBy: { totalScore: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Growth Opportunities"
        description="Every opportunity is scored on a documented, reproducible rubric — never an arbitrary AI score."
      />
      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">
            No opportunities identified yet. They appear once signals are recorded for this business.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {opportunities.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
}

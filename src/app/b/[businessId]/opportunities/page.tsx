import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { OpportunityCard } from "@/components/intelligence/opportunity-card";
import { OpportunityForm } from "@/components/intelligence/opportunity-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireMembership, roleAtLeast } from "@/lib/auth";

export default async function OpportunitiesPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { membership } = await requireMembership(businessId);
  const [opportunities, signals] = await Promise.all([
    prisma.opportunity.findMany({
      where: { businessId, status: { not: "DISCARDED" } },
      include: { signals: { include: { signal: true } } },
      orderBy: { totalScore: "desc" },
    }),
    prisma.signal.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Growth Opportunities"
        description="Every opportunity is scored on a documented, reproducible rubric — never an arbitrary AI score."
      />

      {roleAtLeast(membership.role, "STRATEGIST") && (
        <div className="mb-6">
          <OpportunityForm businessId={businessId} signals={signals} />
        </div>
      )}

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">
            No opportunities identified yet. They appear once signals are recorded for this business.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {opportunities.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} role={membership.role} />
          ))}
        </div>
      )}
    </div>
  );
}

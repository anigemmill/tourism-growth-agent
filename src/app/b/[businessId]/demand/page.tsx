import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { SignalCard } from "@/components/intelligence/signal-card";
import { SignalForm } from "@/components/intelligence/signal-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireMembership, roleAtLeast } from "@/lib/auth";

export default async function DemandPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { membership } = await requireMembership(businessId);
  const signals = await prisma.signal.findMany({
    where: { businessId, type: "DEMAND" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Traveller Demand"
        description="Emerging needs, segments, preferences, questions, objections, and booking barriers — evaluated for relevance, scale, momentum, and commercial potential."
      />

      {roleAtLeast(membership.role, "MARKETER") && (
        <div className="mb-6">
          <SignalForm businessId={businessId} redirectPath={`/b/${businessId}/demand`} defaultType="DEMAND" />
        </div>
      )}

      {signals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">
            No demand signals recorded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      )}
    </div>
  );
}

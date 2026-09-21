import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { SignalCard } from "@/components/intelligence/signal-card";
import { Card, CardContent } from "@/components/ui/card";

export default async function DemandPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
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

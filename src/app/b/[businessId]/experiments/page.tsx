import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { ExperimentCard } from "@/components/intelligence/experiment-card";
import { Card, CardContent } from "@/components/ui/card";

export default async function ExperimentsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const experiments = await prisma.experiment.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Experiments"
        description="Structured growth experiments with a remembered history — a retried experiment must say what's different, never repeat a failed one silently."
      />
      {experiments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">No experiments yet.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiments.map((e) => (
            <ExperimentCard key={e.id} experiment={e} />
          ))}
        </div>
      )}
    </div>
  );
}

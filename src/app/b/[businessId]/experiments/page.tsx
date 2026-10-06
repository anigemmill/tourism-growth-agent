import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { ExperimentCard } from "@/components/intelligence/experiment-card";
import { ExperimentForm } from "@/components/intelligence/experiment-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireMembership, roleAtLeast } from "@/lib/auth";

export default async function ExperimentsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { membership } = await requireMembership(businessId);
  const [experiments, opportunities] = await Promise.all([
    prisma.experiment.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
    prisma.opportunity.findMany({ where: { businessId, status: { not: "DISCARDED" } }, orderBy: { totalScore: "desc" } }),
  ]);
  const priorExperiments = experiments.filter((e) => e.status === "COMPLETE" || e.status === "ABANDONED");

  return (
    <div>
      <PageHeader
        title="Experiments"
        description="Structured growth experiments with a remembered history — a retried experiment must say what's different, never repeat a failed one silently."
      />

      {roleAtLeast(membership.role, "STRATEGIST") && (
        <div className="mb-6">
          <ExperimentForm businessId={businessId} opportunities={opportunities} priorExperiments={priorExperiments} />
        </div>
      )}

      {experiments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">No experiments yet.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiments.map((e) => (
            <ExperimentCard key={e.id} experiment={e} role={membership.role} />
          ))}
        </div>
      )}
    </div>
  );
}

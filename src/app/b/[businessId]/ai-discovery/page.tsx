import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { SignalCard } from "@/components/intelligence/signal-card";
import { SignalForm } from "@/components/intelligence/signal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isAnthropicConfigured } from "@/lib/integrations/registry";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { runDiscoveryProbe } from "./actions";

export default async function AIDiscoveryPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { membership } = await requireMembership(businessId);
  const [signals, business] = await Promise.all([
    prisma.signal.findMany({ where: { businessId, type: "AI_DISCOVERY" }, orderBy: { createdAt: "desc" } }),
    prisma.business.findUniqueOrThrow({ where: { id: businessId } }),
  ]);
  const aiEnabled = isAnthropicConfigured();
  const runProbe = runDiscoveryProbe.bind(null, businessId);

  const suggestions = [
    `best experiences in ${business.destination}`,
    `best ${business.category.toLowerCase()} in ${business.destination}`,
    `best experiences for families in ${business.destination}`,
  ];

  return (
    <div>
      <PageHeader
        title="AI Discovery"
        description="How this business appears when travellers ask an AI assistant for recommendations."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Run a live probe</CardTitle>
        </CardHeader>
        <CardContent>
          {aiEnabled ? (
            <form action={runProbe} className="flex flex-col gap-3">
              <input
                name="question"
                placeholder={suggestions[0]}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <Badge key={s} tone="neutral">
                    {s}
                  </Badge>
                ))}
              </div>
              <button
                type="submit"
                className="self-start h-9 px-4 rounded-lg bg-brand text-brand-foreground text-sm font-medium hover:opacity-90"
              >
                Ask Claude and record result
              </button>
              <p className="text-xs text-foreground-subtle">
                This sends the question to Claude live and records exactly what it says — the result is a genuine
                observation of one AI surface, not a guarantee about every AI search system.
              </p>
            </form>
          ) : (
            <p className="text-sm text-foreground-muted">
              <Badge tone="warning">Requires API</Badge> Set <code>ANTHROPIC_API_KEY</code> to run live AI discovery
              probes.
            </p>
          )}
        </CardContent>
      </Card>

      {roleAtLeast(membership.role, "MARKETER") && (
        <div className="mb-6">
          <SignalForm businessId={businessId} redirectPath={`/b/${businessId}/ai-discovery`} defaultType="AI_DISCOVERY" />
        </div>
      )}

      {signals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">
            No AI discovery checks recorded yet — run a probe above.
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

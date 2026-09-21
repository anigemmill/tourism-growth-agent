import Link from "next/link";
import { Compass, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PortfolioPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { opportunities: true, signals: true } },
      opportunities: { orderBy: { totalScore: "desc" }, take: 1 },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center gap-2.5 border-b border-border bg-surface px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <Compass className="h-4.5 w-4.5" />
        </div>
        <div className="text-sm font-semibold">Portfolio</div>
        <Link
          href="/onboarding"
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface-muted"
        >
          <Plus className="h-3.5 w-3.5" /> Add business
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-sm text-foreground-muted mb-6">
          Portfolio-level intelligence across every business you manage. Authorized users see aggregated signals and
          opportunities; each business&apos;s data, competitors, and integrations remain isolated.
        </p>

        {businesses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-foreground-muted">
              No businesses yet.{" "}
              <Link href="/onboarding" className="text-brand hover:underline">
                Add your first one
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((b) => (
              <Link key={b.id} href={`/b/${b.id}`}>
                <Card className="hover:border-brand transition-colors h-full">
                  <CardHeader>
                    <CardTitle>{b.name}</CardTitle>
                    <div className="text-xs text-foreground-subtle">
                      {b.destination} · {b.category}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex gap-4 text-xs text-foreground-muted">
                      <span>{b._count.opportunities} opportunities</span>
                      <span>{b._count.signals} signals</span>
                    </div>
                    {b.opportunities[0] && (
                      <div className="rounded-lg bg-surface-muted p-2.5 text-xs">
                        <Badge tone="brand">Top opportunity</Badge>
                        <div className="mt-1">{b.opportunities[0].title}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Compass, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/sign-in/actions";

export default async function PortfolioPage() {
  const user = await requireUser("/portfolio");

  const memberships = await prisma.businessMember.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      business: {
        include: {
          _count: { select: { opportunities: true, signals: true } },
          opportunities: { orderBy: { totalScore: "desc" }, take: 1 },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center gap-2.5 border-b border-border bg-surface px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <Compass className="h-4.5 w-4.5" />
        </div>
        <div className="text-sm font-semibold">Portfolio</div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface-muted"
          >
            <Plus className="h-3.5 w-3.5" /> Add business
          </Link>
          <span className="text-xs text-foreground-muted">{user.name || user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-xs text-foreground-subtle hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-sm text-foreground-muted mb-6">
          Businesses you have a role on. Each business&apos;s data, competitors, and integrations remain isolated —
          this view only aggregates what you&apos;re authorized to see.
        </p>

        {memberships.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-foreground-muted">
              You don&apos;t have access to any businesses yet.{" "}
              <Link href="/onboarding" className="text-brand hover:underline">
                Add one
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberships.map(({ business: b, role }) => (
              <Link key={b.id} href={`/b/${b.id}`}>
                <Card className="hover:border-brand transition-colors h-full">
                  <CardHeader className="flex-row items-start justify-between">
                    <div>
                      <CardTitle>{b.name}</CardTitle>
                      <div className="text-xs text-foreground-subtle">
                        {b.destination} · {b.category}
                      </div>
                    </div>
                    <Badge tone="neutral">{role}</Badge>
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

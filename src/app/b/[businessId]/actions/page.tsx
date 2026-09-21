import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { ActionItemRow } from "@/components/intelligence/action-item-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function ActionsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const actions = await prisma.actionItem.findMany({ where: { businessId }, orderBy: [{ weekOf: "desc" }, { createdAt: "asc" }] });

  const grouped = new Map<string, typeof actions>();
  for (const a of actions) {
    const key = a.weekOf.toISOString();
    grouped.set(key, [...(grouped.get(key) ?? []), a]);
  }

  return (
    <div>
      <PageHeader
        title="Actions"
        description="The weekly growth plan — every action states why, for whom, on which channel, who owns it, effort, expected outcome, and how it's measured."
      />
      {grouped.size === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">No actions planned yet.</CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {[...grouped.entries()].map(([weekOf, items]) => (
            <Card key={weekOf}>
              <CardHeader>
                <CardTitle>Week of {formatDate(weekOf)}</CardTitle>
              </CardHeader>
              <CardContent>
                {items.map((a) => (
                  <ActionItemRow key={a.id} action={a} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function HistoryPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const [briefs, learnings, completedActions, completedExperiments, auditLog] = await Promise.all([
    prisma.dailyBrief.findMany({ where: { businessId }, orderBy: { date: "desc" }, take: 20 }),
    prisma.learning.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.actionItem.findMany({ where: { businessId, status: "DONE" }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.experiment.findMany({ where: { businessId, status: "COMPLETE" }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.auditLog.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 40, include: { user: true } }),
  ]);

  return (
    <div>
      <PageHeader title="History" description="Past briefs, actions, experiments, and what the Learning Engine took from them." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily briefs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {briefs.length === 0 && <p className="text-sm text-foreground-muted">None recorded yet.</p>}
            {briefs.map((b) => (
              <div key={b.id} className="text-sm border-b border-border pb-2 last:border-0">
                <div className="font-medium">{formatDate(b.date)}</div>
                <div className="text-foreground-muted text-xs">{b.whyItMatters}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learnings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {learnings.length === 0 && <p className="text-sm text-foreground-muted">None recorded yet.</p>}
            {learnings.map((l) => (
              <div key={l.id} className="text-sm border-b border-border pb-2 last:border-0">
                <div>{l.observation}</div>
                <div className="text-foreground-muted text-xs">→ {l.implication}</div>
                <div className="text-foreground-subtle text-[11px]">{formatDateTime(l.createdAt)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {completedActions.length === 0 && <p className="text-sm text-foreground-muted">None yet.</p>}
            {completedActions.map((a) => (
              <div key={a.id} className="text-sm border-b border-border pb-2 last:border-0">
                {a.action}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed experiments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {completedExperiments.length === 0 && <p className="text-sm text-foreground-muted">None yet.</p>}
            {completedExperiments.map((e) => (
              <div key={e.id} className="text-sm border-b border-border pb-2 last:border-0">
                <div>{e.hypothesis}</div>
                <div className="text-foreground-muted text-xs">{e.result}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-sm font-semibold mt-8 mb-3">Audit log</h2>
      <Card>
        <CardContent className="flex flex-col gap-0 pt-5">
          {auditLog.length === 0 && <p className="text-sm text-foreground-muted pb-5">No actions recorded yet.</p>}
          {auditLog.map((entry) => (
            <div key={entry.id} className="flex items-start justify-between gap-3 text-sm border-b border-border py-2.5 last:border-0">
              <div>
                <span className="font-medium">{entry.user ? entry.user.name || entry.user.email : entry.actor}</span>{" "}
                <span className="text-foreground-muted">{entry.action}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {entry.requiresApproval && <Badge tone="warning">Approval</Badge>}
                <span className="text-xs text-foreground-subtle">{formatDateTime(entry.createdAt)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

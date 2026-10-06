import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { ContentBriefCard } from "@/components/intelligence/content-brief-card";
import { ContentBriefForm } from "@/components/intelligence/content-brief-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireMembership, roleAtLeast } from "@/lib/auth";

export default async function MarketingPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { membership } = await requireMembership(businessId);
  const briefs = await prisma.contentBrief.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Marketing"
        description="Content and campaign briefs — generated from traveller demand, commercial intent, SEO/AI discovery opportunity, and competitive gaps, never just because a topic is trending."
      />

      {roleAtLeast(membership.role, "MARKETER") && (
        <div className="mb-6">
          <ContentBriefForm businessId={businessId} />
        </div>
      )}

      {briefs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">No content briefs yet.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {briefs.map((b) => (
            <ContentBriefCard key={b.id} brief={b} role={membership.role} />
          ))}
        </div>
      )}
    </div>
  );
}

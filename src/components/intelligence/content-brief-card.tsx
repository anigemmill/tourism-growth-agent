import type { ContentBrief } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTENT_BRIEF_TRANSITIONS } from "@/lib/workflow";
import { roleAtLeast } from "@/lib/auth";
import type { ContentBriefStatus } from "@/lib/enums";
import { transitionContentBrief } from "@/app/b/[businessId]/marketing/actions";

export function ContentBriefCard({ brief, role }: { brief: ContentBrief; role?: string }) {
  const keyPoints = Array.isArray(brief.keyPoints) ? (brief.keyPoints as string[]) : [];
  const transitions = CONTENT_BRIEF_TRANSITIONS[brief.status as ContentBriefStatus];
  const available = role ? transitions.filter((t) => roleAtLeast(role, t.minRole)) : [];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <Badge tone="accent">{brief.contentType.replace("_", " ")}</Badge>
          <CardTitle className="text-sm mt-1.5">{brief.title}</CardTitle>
        </div>
        <Badge tone="neutral">{brief.status}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 text-sm">
        <p className="text-foreground-muted">
          <span className="font-medium text-foreground">Why now: </span>
          {brief.whyNow}
        </p>
        <p className="text-foreground-muted">
          <span className="font-medium text-foreground">Audience: </span>
          {brief.targetAudience}
        </p>
        {keyPoints.length > 0 && (
          <ul className="list-disc pl-4 text-foreground-muted space-y-0.5">
            {keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        )}
        {brief.seoNotes && (
          <p className="text-xs text-foreground-subtle border-t border-border pt-2">SEO: {brief.seoNotes}</p>
        )}
        {brief.aiDiscoveryNotes && (
          <p className="text-xs text-foreground-subtle">AI discovery: {brief.aiDiscoveryNotes}</p>
        )}

        {available.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {available.map((t) => (
              <form key={t.next} action={transitionContentBrief.bind(null, brief.businessId, brief.id, t.next)}>
                <Button type="submit" size="sm" variant={t.next === "REJECTED" ? "outline" : "secondary"}>
                  {t.label}
                </Button>
              </form>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

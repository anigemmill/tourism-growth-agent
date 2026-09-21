import type { ContentBrief } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ContentBriefCard({ brief }: { brief: ContentBrief }) {
  const keyPoints = Array.isArray(brief.keyPoints) ? (brief.keyPoints as string[]) : [];
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
      </CardContent>
    </Card>
  );
}

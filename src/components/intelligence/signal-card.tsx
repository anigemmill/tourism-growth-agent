import type { Signal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceMeta } from "@/components/intelligence/evidence-meta";

const MOMENTUM_TONE = {
  DECLINING: "danger",
  STABLE: "neutral",
  RISING: "accent",
  SURGING: "brand",
} as const;

export function SignalCard({ signal }: { signal: Signal }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <CardTitle className="text-sm">{signal.title}</CardTitle>
        {signal.momentum && (
          <Badge tone={MOMENTUM_TONE[signal.momentum as keyof typeof MOMENTUM_TONE] ?? "neutral"}>
            {signal.momentum}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-foreground-muted">{signal.summary}</p>
        <div className="flex flex-wrap gap-1.5 text-[11px] text-foreground-subtle">
          {signal.targetAudience && <Badge tone="neutral">Audience: {signal.targetAudience}</Badge>}
          {signal.relevance && <Badge tone="neutral">Relevance: {signal.relevance}</Badge>}
          {signal.scale && <Badge tone="neutral">Scale: {signal.scale}</Badge>}
          {signal.commercialPotential && (
            <Badge tone="neutral">Commercial potential: {signal.commercialPotential}</Badge>
          )}
        </div>
        <EvidenceMeta
          claimType={signal.claimType}
          source={signal.source}
          timestamp={signal.sourceTimestamp}
          confidence={signal.confidence}
          evidence={signal.evidence}
        />
      </CardContent>
    </Card>
  );
}

import type { Opportunity, Signal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceMeta } from "@/components/intelligence/evidence-meta";
import { ScoreBreakdown } from "@/components/intelligence/score-breakdown";
import { explainScore } from "@/lib/opportunity-engine/score";
import { OPPORTUNITY_TRANSITIONS } from "@/lib/workflow";
import { roleAtLeast } from "@/lib/auth";
import type { OpportunityStatus } from "@/lib/enums";
import { transitionOpportunity } from "@/app/b/[businessId]/opportunities/actions";

type OpportunityWithSignals = Opportunity & { signals: { signal: Signal }[] };

const CATEGORY_TONE = {
  MARKETING: "accent",
  PRODUCT: "brand",
  MARKET: "warning",
  CONVERSION: "success",
  RETENTION: "neutral",
} as const;

export function OpportunityCard({
  opportunity,
  showBreakdown = true,
  role,
}: {
  opportunity: OpportunityWithSignals;
  showBreakdown?: boolean;
  /** Current user's role on this business — omit to render read-only. */
  role?: string;
}) {
  const explanation = explainScore(opportunity);
  const transitions = OPPORTUNITY_TRANSITIONS[opportunity.status as OpportunityStatus];
  const availableTransitions = role ? transitions.filter((t) => roleAtLeast(role, t.minRole)) : [];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge tone={CATEGORY_TONE[opportunity.category as keyof typeof CATEGORY_TONE] ?? "neutral"}>
              {opportunity.category}
            </Badge>
            <Badge tone="neutral">{opportunity.status.replace("_", " ")}</Badge>
          </div>
          <CardTitle className="text-base">{opportunity.title}</CardTitle>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-semibold tabular-nums">{opportunity.totalScore}</div>
          <div className="text-[11px] text-foreground-subtle">opportunity score</div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-foreground-muted">{opportunity.summary}</p>

        <div className="rounded-lg bg-surface-muted p-3">
          <div className="text-xs font-medium mb-1">Recommended action</div>
          <p className="text-sm">{opportunity.recommendedAction}</p>
        </div>

        {showBreakdown && <ScoreBreakdown inputs={opportunity} explanation={explanation} />}

        {opportunity.signals.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <div className="text-xs font-medium text-foreground-muted">Evidence trail</div>
            {opportunity.signals.map(({ signal }) => (
              <EvidenceMeta
                key={signal.id}
                claimType={signal.claimType}
                source={signal.source}
                timestamp={signal.sourceTimestamp}
                confidence={signal.confidence}
                evidence={signal.evidence}
              />
            ))}
          </div>
        )}

        {role && transitions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {availableTransitions.length > 0 ? (
              availableTransitions.map((t) => (
                <form key={t.next} action={transitionOpportunity.bind(null, opportunity.businessId, opportunity.id, t.next)}>
                  <Button type="submit" size="sm" variant={t.next === "DISCARDED" ? "outline" : "primary"}>
                    {t.label}
                  </Button>
                </form>
              ))
            ) : (
              <span className="text-xs text-foreground-subtle">
                Requires {transitions[0].minRole}+ role to move this forward.
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

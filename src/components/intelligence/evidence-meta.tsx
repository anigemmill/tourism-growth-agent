import { Badge } from "@/components/ui/badge";
import { CLAIM_TYPE_LABEL, type ClaimType } from "@/lib/enums";
import { formatDateTime, formatPercent } from "@/lib/utils";

const CLAIM_TONE: Record<ClaimType, "neutral" | "brand" | "accent" | "warning"> = {
  FACT: "brand",
  OBSERVATION: "accent",
  INFERENCE: "warning",
  HYPOTHESIS: "warning",
  RECOMMENDATION: "neutral",
};

function confidenceTone(confidence: number): "success" | "warning" | "danger" {
  if (confidence >= 0.7) return "success";
  if (confidence >= 0.4) return "warning";
  return "danger";
}

/**
 * The data-integrity primitive: every insight in the product renders this so
 * a user can always see where a claim came from, when, how strong the
 * evidence is, and what kind of claim it is (fact vs inference vs
 * hypothesis). Never omit this on a signal/opportunity card.
 */
export function EvidenceMeta({
  claimType,
  source,
  timestamp,
  confidence,
  evidence,
}: {
  claimType: ClaimType | string;
  source: string;
  timestamp: Date | string;
  confidence: number;
  evidence?: string;
}) {
  const ct = claimType as ClaimType;
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={CLAIM_TONE[ct] ?? "neutral"}>{CLAIM_TYPE_LABEL[ct] ?? claimType}</Badge>
        <Badge tone={confidenceTone(confidence)}>{formatPercent(confidence)} confidence</Badge>
        <span className="text-foreground-subtle">
          {source} · {formatDateTime(timestamp)}
        </span>
      </div>
      {evidence && <p className="text-foreground-muted">{evidence}</p>}
    </div>
  );
}

import type { ProductOpportunity } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/utils";

function asList(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

export function ProductOpportunityCard({ product }: { product: ProductOpportunity }) {
  const partners = asList(product.potentialPartners);
  const risks = asList(product.risks);
  const dataNeeded = asList(product.dataNeeded);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <CardTitle className="text-sm">{product.proposedProduct}</CardTitle>
        <Badge tone={product.confidence >= 0.6 ? "success" : "warning"}>
          {formatPercent(product.confidence)} confidence
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <p>
          <span className="font-medium">Target traveller: </span>
          {product.targetTraveller}
        </p>
        <p className="text-foreground-muted">
          <span className="font-medium text-foreground">Problem: </span>
          {product.problem}
        </p>
        <p className="text-foreground-muted">
          <span className="font-medium text-foreground">Demand evidence: </span>
          {product.demandEvidence}
        </p>
        <p className="text-foreground-muted">
          <span className="font-medium text-foreground">Existing supply / gap: </span>
          {product.existingSupply} — {product.gap}
        </p>
        {product.seasonality && (
          <p className="text-foreground-muted">
            <span className="font-medium text-foreground">Seasonality: </span>
            {product.seasonality}
          </p>
        )}
        {partners.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {partners.map((p) => (
              <Badge key={p} tone="neutral">
                Partner: {p}
              </Badge>
            ))}
          </div>
        )}
        {risks.length > 0 && (
          <div className="rounded-lg bg-danger-soft p-2.5 text-xs text-danger">Risks: {risks.join("; ")}</div>
        )}
        {dataNeeded.length > 0 && (
          <div className="rounded-lg bg-warning-soft p-2.5 text-xs text-warning">
            Data needed before this can be called viable: {dataNeeded.join("; ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
